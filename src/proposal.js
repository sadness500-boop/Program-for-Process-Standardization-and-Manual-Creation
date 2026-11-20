/* =====================================================================
 * 💼 견적 연동 · 제안서 — 에스텍 제안서 제작시스템과 같은 연동
 *  ① 3개 견적 프로그램(용역인력 견적 · 업무량 기반 산정 · 단기인력 견적)의 「📑 제안서로 보내기」 자료
 *  ② 엑셀(.xlsx·.xls·.csv)·PDF 견적서 불러오기 (고객사·기간·월 금액·직종·인원·단가·원가 구성)
 *  ③ 견적 기준 「운영 제안서」(Word · PPT · PDF) — 업무표준·작업표준(SOP)·교육·안전·품질·인수인계를 붙여 작성
 *  Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const PROP = { mode: 'client', applied: null };
function jobFromText(t) {
  t = String(t || '');
  return /보안|경비|경호/.test(t) ? 'sec' : /미화|청소|환경/.test(t) ? 'cln' : /주차/.test(t) ? 'prk' : /시설|설비|기전|전기|영선/.test(t) ? 'fac' : /안내|리셉|데스크|프론트/.test(t) ? 'info' : /조리|식당|급식|주방/.test(t) ? 'cook' : /방역|소독|해충/.test(t) ? 'san' : null;
}
function estSummary(pkgs) {
  const m = moneyOf(pkgs), first = pkgs[0] || {}, jobs = [];
  m.rows.forEach(r => { const j = jobFromText(r.job + ' ' + r.title); if (j && !jobs.includes(j)) jobs.push(j); });
  return { pkgs, client: (pkgs.find(p => p.client) || first).client || '', svc: (pkgs.find(p => p.svc) || {}).svc || '', addr: (pkgs.find(p => p.addr) || {}).addr || '',
    period: (pkgs.find(p => p.period && p.period.from) || first).period || { from: '', to: '', months: null }, heads: m.heads, monthly: m.monthly, vat: m.vat, yearly: m.yearly, once: m.once, onceVat: m.onceVat,
    months: m.months, need: m.need, rows: m.rows, jobs: jobs.length ? jobs : [state.job], mix: (pkgs.find(p => p.mix) || {}).mix || null, notes: pkgs.flatMap(p => p.notes || []), tasks: pkgs.flatMap(p => p.tasks || []), srcs: [...new Set(pkgs.map(p => p.src))] };
}

/* ---------- 화면 ---------- */
function estRow(p) {
  const S = SRC[p.src] || SRC.manual, amt = p.unit === '건' ? (p.total != null ? `총 ${wonL(p.total)}원` : '금액 확인 필요') : (p.monthly != null ? `월 ${wonL(p.monthly)}원` : '금액 확인 필요');
  return `<label class="est-it"><input type="checkbox" data-id="${esc(p.id)}" ${LINK.picked.has(p.id) ? 'checked' : ''}>
    <span class="est-ic" style="background:#${S.color}">${S.ic}</span><span class="est-b"><b>${esc(p.title)}</b><small>${esc(S.n)}${p.origin === 'excel' ? ' · 엑셀/PDF' : p.origin === 'raw' ? ' · 보관함' : ''} · ${esc(p.client || '-')} · ${p.heads || 0}명 · ${amt}${p.at ? ' · ' + esc(String(p.at).slice(0, 10)) : ''}</small></span>
    <button type="button" class="est-del" data-del="${esc(p.id)}" title="목록에서 지우기">✕</button></label>`;
}
async function openEstimate() {
  openModal(`<h2>💼 견적 연동 · 제안서</h2><div class="sub">견적 프로그램 3종에서 「📑 제안서로 보내기」한 견적과 엑셀·PDF 견적서를 불러와, 견적 기준으로 작성 정보를 채우고 <b>운영 제안서</b>를 만듭니다.</div>
    <div class="est-tools"><button class="btn" id="estRe">🔄 새로고침</button><button class="btn" id="estXl">📊 엑셀·PDF 견적서 불러오기</button><button class="btn" id="estJs">📁 연동 파일(.json)</button>
      <input type="file" id="estFile" accept=".xlsx,.xlsm,.xls,.xlsb,.ods,.csv,.pdf" hidden multiple><input type="file" id="estJson" accept=".json" hidden></div>
    <div class="est-drop" id="estDrop">엑셀·PDF 견적서를 여기에 끌어다 놓으세요 <small>(.xlsx · .xls · .csv · .pdf — 이 기기 안에서만 읽습니다)</small></div>
    <div class="est-msg" id="estMsg">불러오는 중…</div><div class="est-list" id="estList"></div>
    <div class="est-links">${['stqs', 'wbe', 'stse'].map(k => `<a href="${SRC[k].url}" target="_blank" rel="noopener">${SRC[k].ic} ${SRC[k].n} 열기</a>`).join('')}</div>
    <div class="est-opt"><b>문서 용도</b><label><input type="radio" name="estMode" value="client" ${PROP.mode === 'client' ? 'checked' : ''}> 대외 제출용</label><label><input type="radio" name="estMode" value="internal" ${PROP.mode === 'internal' ? 'checked' : ''}> 내부 검토용 (원가 구성 포함)</label></div>
    <div class="mrow"><button class="btn" id="estApply">✍ 작성 정보에 반영</button><button class="btn pri" id="estDoc">📄 제안서 Word</button><button class="btn pri" id="estPpt">📊 제안서 PPT</button><button class="btn pri" id="estPdf">📕 제안서 PDF</button><button class="btn" id="estX">닫기</button></div>`,
  md => {
    md.classList.add('wide');
    const $m = s => md.querySelector(s);
    const draw = () => { $m('#estList').innerHTML = LINK.items.length ? LINK.items.map(estRow).join('') : '<div class="est-empty">연동된 견적이 없습니다. 견적 프로그램에서 「📑 제안서로 보내기」를 누르거나 엑셀·PDF 견적서를 불러오세요.</div>';
      const sel = pickedPkgs(); $m('#estMsg').textContent = `${LINK.serverMsg || ''}${LINK.serverMsg ? ' · ' : ''}${LINK.items.length}건 · 선택 ${sel.length}건${sel.length ? ` (합계 ${estSummary(sel).heads}명 · 월 ${wonL(estSummary(sel).monthly || null)}원)` : ''}`; };
    const load = async srv => { $m('#estMsg').textContent = '불러오는 중…'; try { await loadLinks(srv); } catch (e) { LINK.serverMsg = '불러오기 오류: ' + e.message; } if (!LINK.picked.size && LINK.items[0]) LINK.picked.add(LINK.items[0].id); draw(); };
    const addFiles = async files => { for (const f of files) { try { $m('#estMsg').textContent = `「${f.name}」 읽는 중…`; const p = await importEstimateFile(f); LINK.picked.add(p.id); toast(`견적서를 읽었습니다 — ${p.client || p.title} · ${p.heads}명`); } catch (e) { toast(`「${f.name}」: ${e.message}`, 5000); } } await load(false); };
    md.addEventListener('change', e => { const c = e.target.closest('input[data-id]'); if (c) { c.checked ? LINK.picked.add(c.dataset.id) : LINK.picked.delete(c.dataset.id); draw(); } const r = e.target.closest('input[name=estMode]'); if (r) PROP.mode = r.value; });
    md.addEventListener('click', e => { const d = e.target.closest('[data-del]'); if (d) { e.preventDefault(); removeLocalPkg(d.dataset.del); LINK.picked.delete(d.dataset.del); load(false); } });
    $m('#estRe').onclick = () => load(true); $m('#estX').onclick = closeModal;
    $m('#estXl').onclick = () => $m('#estFile').click(); $m('#estFile').onchange = e => addFiles([...e.target.files]);
    $m('#estJs').onclick = () => $m('#estJson').click(); $m('#estJson').onchange = async e => { try { const a = await importLinkFile(e.target.files[0]); a.forEach(p => LINK.picked.add(p.id)); await load(false); } catch (er) { toast(er.message, 5000); } };
    const dz = $m('#estDrop'); ['dragover', 'dragenter'].forEach(t => dz.addEventListener(t, e => { e.preventDefault(); dz.classList.add('on'); })); ['dragleave', 'drop'].forEach(t => dz.addEventListener(t, () => dz.classList.remove('on')));
    dz.addEventListener('drop', e => { e.preventDefault(); addFiles([...e.dataTransfer.files]); });
    const need = () => { const s = pickedPkgs(); if (!s.length) { toast('견적을 하나 이상 고르세요'); return null; } return s; };
    $m('#estApply').onclick = () => { const s = need(); if (s) { estApply(estSummary(s)); closeModal(); } };
    $m('#estDoc').onclick = () => { const s = need(); if (s) runProposal('docx', estSummary(s)); };
    $m('#estPpt').onclick = () => { const s = need(); if (s) runProposal('pptx', estSummary(s)); };
    $m('#estPdf').onclick = () => { const s = need(); if (s) runProposal('pdf', estSummary(s)); };
    load(true);
  });
}
/* 견적 → 작성 정보 */
function estApply(E) {
  PROP.applied = E;
  const st = E.client && SITES.find(s => { const a = s.name.replace(/\s|주식회사|\(주\)|㈜/g, ''), b = E.client.replace(/\s|주식회사|\(주\)|㈜/g, ''); return a && b && (a.includes(b) || b.includes(a)); });
  if (st) selectSite(st, true);
  if (E.jobs[0] && JOB[E.jobs[0]]) setJob(E.jobs[0]);
  if (!st && E.client) { $('#f_client').value = E.client; }
  const sh = (E.rows.find(r => r.shift) || {}).shift || '';
  const lines = [`[견적 연동] ${E.client || ''} ${E.svc || ''} — 총 ${E.heads}명${E.monthly ? ` · 월 ${wonL(E.monthly)}원(VAT 별도)` : ''}${E.period.from ? ` · 기간 ${E.period.from} ~ ${E.period.to}` : ''}`]
    .concat(E.rows.slice(0, 8).map(r => `- ${r.job || ''} ${r.title || ''} ${r.count}명${r.shift ? ' · ' + r.shift : ''}`));
  const sp = $('#f_special'); if (sp && !sp.value.includes('[견적 연동]')) sp.value = (sp.value ? sp.value + '\n' : '') + lines.join('\n');
  if (typeof autoTitle === 'function') autoTitle();
  toast(`견적을 반영했습니다 — ${st ? st.name : E.client || '고객사'} · ${JOB[E.jobs[0]] ? JOB[E.jobs[0]].n : ''} · ${E.heads}명${sh ? ' · ' + sh : ''}`, 4500);
}

/* ---------- 제안서 내용 ---------- */
function propCtx(E) {
  const f = readForm(), st = f.siteObj, c = pkCtx(Object.assign({}, f, { client: E.client || f.client }));
  const client = E.client || (st ? st.name : f.client) || '고객사';
  return { E, f, c, client, svc: E.svc || `${client} ${E.jobs.map(j => JOB[j] ? JOB[j].n : j).join('·')} 용역`, org: c.org, internal: PROP.mode === 'internal', date: c.date };
}
const PROP_TOC = ['제안 개요', '회사 소개', '현황 분석 및 요구사항', '인력 운영 계획', '업무 수행 방안(업무표준·작업표준)', '교육 · 훈련 계획', '안전보건 · 법규 준수', '품질관리 · Complaint 대응', '운영 개시 · 인수인계', '가격 제안', '기대 효과'];
function propSections(X) {
  const E = X.E, J = E.jobs.filter(j => JOB[j]), jn = J.map(j => JOB[j].n).join(' · ') || JOB[state.job].n;
  const per = E.period.from ? `${E.period.from} ~ ${E.period.to}${E.period.months ? ` (${E.period.months}개월)` : ''}` : '협의';
  const S = [];
  S.push({ h: '제안 개요', lines: [`사업명: ${X.svc}`, `발주처: ${X.client}`, `용역 범위: ${jn}`, `계약 기간: ${per}`, `투입 인원: ${E.heads}명`, E.monthly ? `월 용역비: ${wonL(E.monthly)}원 (부가세 별도)` : '월 용역비: 견적서 기준', `제안사: ${X.org} (에스텍 그룹)`],
    tip: `${X.client}의 ${jn} 업무를 「업무표준서 · 작업표준(SOP) · 현장 근무지침」으로 표준화해, 누가 근무해도 같은 품질로 운영하는 것을 제안합니다.` });
  S.push({ h: '회사 소개', lines: [`에스텍 그룹 — 보안·미화·주차·시설·안내·조리·방역 종합 용역`, `에스텍베스트 ${BRANCHES.length}개 지사(${BRANCHES.map(b => b.key).join('·')}) · 운영 사업장 ${SITES.length}곳`, '9개 업무 프로그램(근태관리·사업장 현황·견적 3종·업무표준·Complaint 대응·법률 대응·제안서)으로 현장을 관리', '모든 현장에 업무표준서·작업표준·서식·교육 자료를 같은 체계로 비치'] });
  S.push({ h: '현황 분석 및 요구사항', lines: [`대상: ${X.client}${E.addr ? ` (${E.addr})` : X.c.addr ? ` (${X.c.addr})` : ''}`, `요구 직종: ${jn}`, ...E.notes.filter(n => /조건|전년|대안/.test(n)).slice(0, 5), '현장 조사(면적·구역·동선·위험요인)를 운영 개시 전 다시 확인해 작업표준과 인원 배치를 확정합니다'] });
  return { S, jn, per };
}
function sopHighlights(job, n = 4) {
  const A = SOP[job] ? SOP[job].areas : []; const out = [];
  A.forEach(a => { if (out.length < n && a.tasks[0]) out.push({ a: a.n, t: a.tasks[0] }); });
  return out;
}

/* ---------- Word ---------- */
async function makeProposalDocx(E) {
  const X = propCtx(E), { S, jn, per } = propSections(X), ch = [], AC = docx.AlignmentType.CENTER, J = E.jobs.filter(j => JOB[j]);
  R.raw = false;
  ch.push(P([R(`${X.org} · ${X.internal ? '내부 검토용' : '대외 제출용'}`, { size: 18, bold: true, color: C.green })], { align: docx.AlignmentType.RIGHT, after: 200 }));
  ch.push(P([R(X.client, { size: 30, bold: true, color: C.gray })], { align: AC, before: 400, after: 80 }));
  ch.push(P([R(X.svc, { size: 44, bold: true, color: C.navy })], { align: AC, after: 60, line: 460 }));
  ch.push(P([R('운 영 제 안 서', { size: 36, bold: true, color: C.navy })], { align: AC, after: 240 }));
  ch.push(new docx.Paragraph({ alignment: AC, children: [new docx.ImageRun({ type: 'png', data: b64ToU8(dataUrlB64(ASSET.osi)), transformation: { width: 170, height: 170 } })] }));
  ch.push(P([R(`${X.date}   ${X.org}`, { size: 22, bold: true })], { align: AC, before: 300, after: 80 }));
  ch.push(boxPara([P([R('□ 목차', { size: 22, bold: true, color: C.greenD })], { after: 60 })].concat(PROP_TOC.map((t, i) => P([R(`${i + 1}. ${t}`, { size: 20 })], { indent: { left: 240 }, after: 10 })))));
  let no = 0;
  const H = t => ch.push(H1(`${++no}. ${t}`));
  const lines = ls => ls.filter(Boolean).forEach(l => ch.push(P([R('• ', { bold: true, color: C.green }), R(l, { size: 21 })], { after: 50, indent: { left: 300, hanging: 220 } })));
  S.forEach(s => { H(s.h); lines(s.lines); if (s.tip) ch.push(boxPara([P([R(s.tip, { size: 20, bold: true, color: C.greenD })], { after: 0 })])); });
  /* 4. 인력 운영 계획 */
  H('인력 운영 계획');
  const w = [1500, 2700, 900, 2238, 1150, 1150];
  ch.push(table([[th('직종', w[0]), th('직책 · 업무', w[1]), th('인원', w[2]), th('근무형태', w[3]), th('1인 단가', w[4]), th('월 금액', w[5])]].concat(E.rows.map(r => [td(r.job || '', w[0], { bold: true }), td(r.title || '', w[1]), td(`${r.count}명`, w[2], { align: AC }), td(r.shift || '-', w[3]), td(r.unit != null ? wonL(r.unit) : '-', w[4], { align: docx.AlignmentType.RIGHT }), td(r.amount != null ? wonL(r.amount) : '-', w[5], { align: docx.AlignmentType.RIGHT })]))
    .concat([[td('합계', w[0], { bold: true, fill: 'EEF1F5' }), td('', w[1], { fill: 'EEF1F5' }), td(`${E.heads}명`, w[2], { align: AC, bold: true, fill: 'EEF1F5' }), td('', w[3], { fill: 'EEF1F5' }), td('', w[4], { fill: 'EEF1F5' }), td(E.monthly ? wonL(E.monthly) : '-', w[5], { align: docx.AlignmentType.RIGHT, bold: true, fill: 'EEF1F5' })]]), w, { header: true }));
  const code = AMS_CODES.find(c => c.id === X.f.code);
  if (code) { const m = shiftMetrics(code); lines([`기준 근무형태: ${code.name} — 월 근로시간 약 ${Math.round(m.hours)}시간 · 주 평균 ${m.week.toFixed(1)}시간 · 24시간 운영 최소 ${m.crews}조`]); }
  lines(['결원 시 지사 대체 인력 24시간 이내 투입 · 근태관리 프로그램으로 출퇴근·대체근무 실시간 관리', '현장 책임자(현장대리인)가 고객사 요청을 받아 근무자에게 전달 — 고객사 직원의 직접 지시 없이 운영(도급 원칙)']);
  /* 5. 업무 수행 방안 */
  H('업무 수행 방안 (업무표준 · 작업표준)');
  lines([`${jn} 업무를 「업무표준서 → 작업표준(SOP) → 현장 근무지침 → 서식」 4단계로 문서화해 운영합니다.`, '작업표준은 작업마다 주기·소요시간·도구·약품(희석)·보호구·단계별 동작과 요령·완료 기준·금지 사항·기록 양식을 정합니다.']);
  J.forEach(j => {
    const A = SOP[j] ? SOP[j].areas : []; if (!A.length) return;
    ch.push(P([R(`■ ${JOB[j].n} — 작업표준 ${A.reduce((a, x) => a + x.tasks.length, 0)}건 (${A.length}개 구역)`, { size: 22, bold: true, color: C.navy })], { before: 120, after: 60 }));
    const w2 = [2200, 5238, 2200];
    ch.push(table([[th('구역', w2[0]), th('작업 (주기)', w2[1]), th('기록', w2[2])]].concat(A.map(a => [td(a.n, w2[0], { bold: true }), td(a.tasks.map(t => `${t.n} (${t.f})`).join('\n'), w2[1], { size: 17 }), td([...new Set(a.tasks.map(t => t.r).filter(Boolean))].join(', '), w2[2], { size: 16 })])), w2, { header: true }));
    sopHighlights(j, 2).forEach(({ a, t }) => {
      ch.push(P([R(`예시 작업표준 — ${a} · ${t.n}`, { size: 20, bold: true, color: C.greenD })], { before: 100, after: 40 }));
      (t.s || []).slice(0, 8).forEach((s, k) => ch.push(P([R(`${k + 1}. ${s[0]}`, { size: 19 }), R(s[1] ? `  — ${s[1]}` : '', { size: 17, color: C.gray })], { after: 20, indent: { left: 300 } })));
    });
  });
  /* 6. 교육 */
  H('교육 · 훈련 계획');
  const w3 = [1000, 3000, 5638];
  ch.push(table([[th('월', w3[0]), th('안전보건교육 주제', w3[1]), th('주요 내용', w3[2])]].concat(EDU_MONTH.map((e, i) => [td(`${i + 1}월`, w3[0], { align: AC, bold: true }), td(e[0], w3[1], { bold: true }), td(e[1], w3[2], { size: 17 })])), w3, { header: true }));
  J.forEach(j => (EDU_JOB[j] || []).length && lines([`${JOB[j].n} 직무교육: ` + EDU_JOB[j].map(e => e[0]).join(' · ')]));
  lines(EDU_LAW.map(e => `${e[0]} — ${e[1]}`));
  /* 7. 안전보건 */
  H('안전보건 · 법규 준수');
  lines(['근무 시작 TBM(5분) — 오늘의 작업·위험요인·보호구 확인', '위험성평가(연 1회 정기 + 작업 변경 시 수시) · 아차사고 보고', '관리감독자 지정 · 연 16시간 교육 · 약품 MSDS·경고표지 비치', '중대재해 발생 시 즉시 보고 체계(현장 → 지사 → 본사 → 관할 노동관서)']);
  const lawIds = uniq(J.flatMap(j => SOP_LAWS[j] || [])).filter(id => LAWS[id]).slice(0, 10);
  if (lawIds.length) lines(lawIds.map(id => `${LAWS[id].law} ${LAWS[id].art} ${LAWS[id].title} — ${LAWS[id].sum}`));
  /* 8. 품질 */
  H('품질관리 · Complaint 대응');
  lines(['월 1회 자체 품질평가(일반·위험·품질관리부문 체크리스트, 배점 100점) — 결과와 개선 계획을 월 주요업무실적으로 보고', '화장실·순찰 등 시간대별 점검표로 실시 여부를 기록', 'Complaint 접수 → 즉시 조치 → 원인 분석 → 재발 방지 교육 → 결과 회신(S-Tec Complaint Response System)', '분기 1회 고객사 만족도 면담 · 연 1회 운영 결과 보고']);
  /* 9. 인수인계 */
  H('운영 개시 · 인수인계');
  const AP = [['D-30', '계약 조건·과업 범위 확인'], ['D-28', '현장 조사(면적·구역·동선·장비)'], ['D-21', '채용·기존 근무자 승계 면담'], ['D-14', '장비·용품 인수, 초도 발주'], ['D-10', '채용 시 교육·직무교육 계획'], ['D-7', '업무표준서·작업표준·근무지침 확정'], ['D-3', '기존 업체와 대면 인수인계'], ['D-Day', '운영 개시 · TBM · 고객사 보고'], ['D+7', '1주 품질 점검·고객사 면담'], ['D+30', '1개월 보고·개선 계획']];
  const w4 = [1400, 8238];
  ch.push(table([[th('일정', w4[0]), th('실행 내용', w4[1])]].concat(AP.map(a => [td(a[0], w4[0], { align: AC, bold: true }), td(a[1], w4[1])])), w4, { header: true }));
  lines(['운영 개시와 함께 「사업장 자료 패키지」(관리서류 40여 종: 계획표·일지·교육·품질평가·대장·약품 경고표지)를 현장에 비치합니다.']);
  /* 10. 가격 */
  H('가격 제안');
  const w5 = [3600, 6038];
  const money = [['월 용역비 (공급가액)', E.monthly ? `${wonL(E.monthly)}원` : '견적서 기준'], ['부가가치세', E.vat ? `${wonL(E.vat)}원` : '-'], ['월 합계 (VAT 포함)', E.monthly ? `${wonL(E.monthly + (E.vat || 0))}원` : '-'], ['계약 기간 총액 (VAT 별도)', E.yearly ? `${wonL(E.yearly)}원 (${E.months}개월)` : '-']];
  if (E.once) money.push(['단기·행사 용역 (공급가액)', `${wonL(E.once)}원 (VAT ${wonL(E.onceVat)}원 별도)`]);
  if (E.monthly) money.push(['금액 (한글)', `금 ${korWon(E.monthly)}원정 (월, 부가세 별도)`]);
  ch.push(table(money.map(r => [td(r[0], w5[0], { bold: true, fill: 'EEF1F5' }), td(r[1], w5[1], { bold: true, color: C.navy })]), w5));
  if (X.internal && E.mix) { const t = (E.mix.labor || 0) + (E.mix.expense || 0) + (E.mix.marg || 0) + (E.mix.addon || 0); ch.push(P([R('원가 구성 (내부 검토용)', { size: 20, bold: true, color: C.brick })], { before: 120, after: 40 }));
    lines([`인건비(복리후생 포함): ${wonL(E.mix.labor)}원`, `제비용·경비: ${wonL(E.mix.expense)}원`, `일반관리비·이윤: ${wonL(E.mix.marg)}원`, t ? `합계 ${wonL(t)}원` : '']); }
  if (E.need) lines(['※ 일부 견적은 금액이 확정되지 않았습니다 — 견적 프로그램에서 「📑 제안서로 보내기」 후 다시 만드세요.']);
  lines(E.notes.slice(0, 6).map(n => '참고: ' + n));
  /* 11. 기대 효과 */
  H('기대 효과');
  lines(['표준화: 근무자가 바뀌어도 같은 순서·같은 품질 — 신규 근무자 교육 기간 단축', '투명성: 일지·점검표·품질평가·월 보고로 운영 상태를 숫자로 확인', '안전: 작업표준·TBM·MSDS·보호구로 산업재해 예방', '대응력: 상황별 대처 매뉴얼과 Complaint 처리 절차로 신속 대응']);
  ch.push(P([R('- 끝 -', { size: 20, bold: true })], { align: AC, before: 240, after: 80 }));
  ch.push(P([R(`${APP.name} ${APP.version} · 견적 연동 운영 제안서 · Designed & Developed by Rat Rae Choi`, { size: 15, color: '8A93A3' })], { align: AC }));
  return await packDocx(ch, `${X.client} 운영 제안서`);
}

/* ---------- PPT · PDF (슬라이드 모델) ---------- */
function buildProposalSlides(E) {
  const X = propCtx(E), { S: SEC, jn, per } = propSections(X), J = E.jobs.filter(j => JOB[j]), p = { f: { client: X.client, mode: 'client' }, title: `${X.client} 운영 제안서` };
  const S = []; let no = 1;
  S.push(coverSlide({ eyebrow: `${X.org} · ${X.internal ? '내부 검토용' : '대외 제출용'} · 운영 제안서`, title: X.svc, lines: [X.client, `${jn} · ${E.heads}명 · ${per}`], meta: `${X.date}   |   견적 연동 ${E.srcs.map(s => SRC[s] ? SRC[s].n : s).join(' · ')}`, badge: '운영 제안서', badgeColor: C.green, fig: J[0] === 'cln' ? 'team_dio' : 'mgr' })); no++;
  const sl = (t, sub, groups, vid) => { const o = frame(t, sub, no, p); const w = vid ? 6.2 : SW - 1.2;
    o.push(T(0.6, 1.6, w, 5.2, listParas(groups), { max: 16, min: 11 }));
    if (vid) { o.push(Rc(7.05, 1.62, 5.7, 3.3, '0F1530')); o.push(Vd(7.1, 1.67, 5.6, 3.2, vid)); o.push(T(7.1, 4.95, 5.6, 0.4, '▶ 현장 영상 — PPT에서 누르면 재생', { pt: 11, color: K.mute })); }
    S.push(o); no++; };
  const vid = VIDEO_OF[J[0]] || 'sec1';
  sl('01  제안 개요', X.svc, [{ title: '사업 개요', lines: SEC[0].lines }, { title: '제안 방향', lines: [SEC[0].tip] }], vid);
  sl('02  회사 소개', '에스텍 그룹', [{ title: '', lines: SEC[1].lines }]);
  sl('03  현황 분석 및 요구사항', X.client, [{ title: '', lines: SEC[2].lines }]);
  { const o = frame('04  인력 운영 계획', `총 ${E.heads}명 · ${per}`, no, p);
    const rows = E.rows.slice(0, 11).map(r => [r.job || '', r.title || '', `${r.count}명`, r.shift || '-', r.unit != null ? wonL(r.unit) : '-', r.amount != null ? wonL(r.amount) : '-']);
    rows.push({ 0: '합계', 1: '', 2: `${E.heads}명`, 3: '', 4: '', 5: E.monthly ? wonL(E.monthly) : '-', length: 6, _fill: 'EEF1F5' });
    tbl(o, 0.6, 1.6, [{ t: '직종', w: 1.6, b: 1 }, { t: '직책 · 업무', w: 3.9 }, { t: '인원', w: 1.0, al: 'center' }, { t: '근무형태', w: 2.6 }, { t: '1인 단가', w: 1.5, al: 'right' }, { t: '월 금액', w: 1.5, al: 'right', b: 1 }], rows, { rh: 0.38, pt: 11 });
    S.push(o); no++; }
  J.forEach(j => { const A = SOP[j] ? SOP[j].areas : []; if (!A.length) return;
    const o = frame(`05  업무 수행 방안 — ${JOB[j].n}`, `작업표준(SOP) ${A.reduce((a, x) => a + x.tasks.length, 0)}건 · ${A.length}개 구역`, no, p);
    tbl(o, 0.6, 1.6, [{ t: '구역', w: 2.4, b: 1 }, { t: '작업 (주기)', w: 9.7 }], A.slice(0, 12).map(a => [a.n, a.tasks.map(t => t.n).join(' · ')]), { rh: 0.4, pt: 10.5 });
    S.push(o); no++;
    sopHighlights(j, 2).forEach(({ a, t }) => sl(`05  작업표준 예시 — ${t.n}`, `${JOB[j].n} · ${a} · ${t.f}`, [{ title: '작업 순서', lines: (t.s || []).slice(0, 7).map((s, k) => `${k + 1}. ${s[0]}`) }, { title: '완료 기준', lines: (t.q || []).slice(0, 3) }], SOP_VID[j])); });
  sl('06  교육 · 훈련 계획', '월별 안전보건교육 + 직무교육 + 법정교육', [{ title: '월별 안전보건교육 (매월 2시간)', lines: EDU_MONTH.map((e, i) => `${i + 1}월 ${e[0]}`) }, { title: '법정교육', lines: EDU_LAW.slice(0, 5).map(e => `${e[0]} — ${e[2]}`) }]);
  sl('07  안전보건 · 법규 준수', '산업재해 예방 체계', [{ title: '', lines: ['근무 시작 TBM(5분)', '위험성평가 · 아차사고 보고', '관리감독자 지정 · 연 16시간 교육', 'MSDS·경고표지 비치 · 보호구 지급', '중대재해 즉시 보고 체계'] }], 'sig');
  sl('08  품질관리 · Complaint 대응', '측정 → 보고 → 개선', [{ title: '', lines: ['월 1회 자체 품질평가(배점 100점)', '시간대별 점검표 · 업무일지 · 월 주요업무실적 보고', 'Complaint 접수 → 즉시 조치 → 원인 분석 → 재발 방지 → 결과 회신', '분기 1회 고객사 만족도 면담'] }], 'cases/cmp1');
  sl('09  운영 개시 · 인수인계', 'D-30 ~ D+30', [{ title: '', lines: ['D-30 계약 조건·과업 범위 확인', 'D-28 현장 조사', 'D-21 채용·승계 면담', 'D-14 장비·용품 인수', 'D-7 업무표준·작업표준·근무지침 확정', 'D-3 대면 인수인계', 'D-Day 운영 개시', 'D+30 1개월 보고·개선 계획'] }]);
  { const o = frame('10  가격 제안', X.internal ? '내부 검토용 — 원가 구성 포함' : '부가가치세 별도', no, p);
    const rows = [['월 용역비 (공급가액)', E.monthly ? `${wonL(E.monthly)}원` : '견적서 기준'], ['부가가치세', E.vat ? `${wonL(E.vat)}원` : '-'], ['월 합계 (VAT 포함)', E.monthly ? `${wonL(E.monthly + (E.vat || 0))}원` : '-'], ['계약 기간 총액 (VAT 별도)', E.yearly ? `${wonL(E.yearly)}원 (${E.months}개월)` : '-']];
    if (E.once) rows.push(['단기·행사 용역', `${wonL(E.once)}원`]);
    if (X.internal && E.mix) rows.push(['원가 — 인건비', `${wonL(E.mix.labor)}원`], ['원가 — 제비용', `${wonL(E.mix.expense)}원`], ['원가 — 관리비·이윤', `${wonL(E.mix.marg)}원`]);
    tbl(o, 1.6, 1.8, [{ t: '구분', w: 4.4, b: 1 }, { t: '금액', w: 5.6, al: 'right', b: 1, color: C.navy }], rows, { rh: 0.52, pt: 15 });
    S.push(o); no++; }
  sl('11  기대 효과', '', [{ title: '', lines: ['표준화 — 누가 근무해도 같은 품질', '투명성 — 일지·점검표·품질평가로 숫자 관리', '안전 — 작업표준·TBM·MSDS로 재해 예방', '대응력 — 상황별 대처·Complaint 처리 절차'] }]);
  S.push(closingSlide({ tag: `${X.client} ${jn} 운영 제안 — 감사합니다`, org: `${X.org} · ${APP.org}` }));
  return { slides: S, title: `${X.client} 운영 제안서` };
}
async function runProposal(kind, E) {
  const X = propCtx(E), base = `${String(kstNow().getFullYear()).slice(2)}${pad(kstNow().getMonth() + 1)}${pad(kstNow().getDate())}_${safeName(X.client)}_운영제안서${X.internal ? '(내부)' : ''}`;
  try {
    if (kind === 'docx') { busy(true, '제안서 Word 만드는 중…'); await download(await makeProposalDocx(E), base + '.docx'); }
    else { const B = buildProposalSlides(E);
      if (kind === 'pptx') { busy(true, '제안서 PPT 만드는 중… (현장 영상 포함)'); await download(await makePptx({ f: { client: X.client, mode: 'client' }, title: B.title, kind: 'prop' }, B.slides, B.title), base + '.pptx'); }
      else { await download(await makePdf({ f: { client: X.client, mode: 'client' }, title: B.title, kind: 'prop' }, (i, n) => busy(true, `제안서 PDF ${i}/${n}`), B.slides, B.title), base + '.pdf'); } }
    toast('제안서를 만들었습니다 — 다운로드 폴더를 확인하세요.');
  } catch (e) { console.error(e); toast('제안서 생성 오류: ' + e.message, 5000); }
  finally { busy(false); }
}
