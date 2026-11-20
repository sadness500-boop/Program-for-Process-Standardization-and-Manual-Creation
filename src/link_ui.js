/* =====================================================================
 * 견적 연동 · RFP 화면 — 에스텍 제안서 제작시스템 ①견적 연동 · 엑셀/파일 불러오기 · RFP 불러오기와 같은 구성
 *  · 체크한 견적 → 작성 정보(고객사·사업장·직종·근무형태) 자동 반영 + 출력물 「인력 운영 기준(견적 연동)」
 *  · RFP 요구사항 → 관련 표준 항목·매뉴얼 장 추천 선택 + 출력물 「과업 요구사항 대응표」
 *  Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const LUI = { tab: 'all' };
function jobFromText(t) {
  t = String(t || '');
  return /보안|경비|경호/.test(t) ? 'sec' : /미화|청소|환경/.test(t) ? 'cln' : /주차/.test(t) ? 'prk' : /시설|설비|기전|전기|영선/.test(t) ? 'fac' : /안내|리셉|데스크|프론트/.test(t) ? 'info' : /조리|식당|급식|주방/.test(t) ? 'cook' : /방역|소독|해충/.test(t) ? 'san' : null;
}
function estSummary(pkgs) {
  const m = moneyOf(pkgs), first = pkgs[0] || {}, jobs = [];
  m.rows.forEach(r => { const j = jobFromText(r.job + ' ' + r.title); if (j && !jobs.includes(j)) jobs.push(j); });
  return { pkgs, client: (pkgs.find(p => p.client) || first).client || '', svc: (pkgs.find(p => p.svc) || {}).svc || '', addr: (pkgs.find(p => p.addr) || {}).addr || '',
    period: (pkgs.find(p => p.period && p.period.from) || first).period || { from: '', to: '', months: null }, heads: m.heads, monthly: m.monthly, vat: m.vat, yearly: m.yearly, once: m.once, onceVat: m.onceVat,
    months: m.months, need: m.need, rows: m.rows, jobs, mix: (pkgs.find(p => p.mix) || {}).mix || null, notes: pkgs.flatMap(p => p.notes || []), tasks: pkgs.flatMap(p => p.tasks || []), srcs: [...new Set(pkgs.map(p => p.src))] };
}
function curEst() { const s = (typeof LINK !== 'undefined') ? pickedPkgs() : []; return s.length ? estSummary(s) : null; }
function curRfp() { return (typeof RFP !== 'undefined' && RFP.res && RFP.res.rows && RFP.res.rows.length) ? RFP.res : null; }

/* ---------- ① 견적 연동 목록 ---------- */
function srcBadge(p) { const s = SRC[p.src] || SRC.manual; return `<span class="sb" style="--c:#${s.color}">${s.ic} ${esc(s.n)}</span>`; }
function pkgAmt(p) {
  if (p.unit === '건') { const sup = p.supply ?? (p.total != null ? Math.round(p.total / 1.1) : null); return sup != null ? `${wonL(sup)}원 <small>(건·VAT 별도)</small>` : '<em class="need">금액 연동 필요</em>'; }
  return p.monthly != null ? `월 ${wonL(p.monthly)}원 <small>(VAT 별도)</small>` : '<em class="need">금액 연동 필요</em>';
}
const isManualSrc = p => p.src === 'manual' || p.origin === 'file' || p.origin === 'excel';
function renderLinks() {
  const tabs = [['all', '전체'], ['stqs', SRC.stqs.ic + ' 용역인력'], ['wbe', SRC.wbe.ic + ' 업무량'], ['stse', SRC.stse.ic + ' 단기'], ['manual', '✍ 직접·엑셀·파일']];
  const cnt = k => k === 'all' ? LINK.items.length : LINK.items.filter(p => k === 'manual' ? isManualSrc(p) : p.src === k).length;
  $('#linkTabs').innerHTML = tabs.map(([k, n]) => `<button type="button" data-tab="${k}" aria-pressed="${LUI.tab === k}">${n}<i>${cnt(k)}</i></button>`).join('');
  const list = LINK.items.filter(p => LUI.tab === 'all' || (LUI.tab === 'manual' ? isManualSrc(p) : p.src === LUI.tab));
  $('#linkList').innerHTML = list.length ? list.map(p => `<li class="lk ${LINK.picked.has(p.id) ? 'on' : ''}" data-id="${esc(p.id)}">
      <input type="checkbox" ${LINK.picked.has(p.id) ? 'checked' : ''} aria-label="업무표준·매뉴얼에 반영">
      <div class="lb">${srcBadge(p)}${p.origin === 'raw' ? '<span class="sb raw">보관함</span>' : p.origin === 'file' ? '<span class="sb raw">파일</span>' : p.origin === 'excel' ? '<span class="sb xl">엑셀</span>' : p.origin === 'manual' ? '' : '<span class="sb ok">연동</span>'}
        <b>${esc(p.title)}</b><small>${esc(p.client || '')}${p.heads ? ` · ${p.heads}명` : ''}${p.rows.length ? ` · ${p.rows.length}개 직책` : ''}${p.at ? ` · ${esc(String(p.at).slice(0, 10))}` : ''}</small><span class="amt">${pkgAmt(p)}</span></div>
      <button type="button" class="lx" data-x="${esc(p.id)}" title="목록에서 빼기">✕</button></li>`).join('')
    : `<li class="empty">${LUI.tab === 'all' ? '연동된 견적이 없습니다.<br>아래 견적 프로그램에서 견적을 만든 뒤 <b>「📑 제안서로 보내기」</b>를 누르거나, 직접 입력하세요.' : '이 프로그램에서 보낸 견적이 없습니다.'}</li>`;
  $('#linkMsg').textContent = LINK.serverMsg || '';
  const m = moneyOf(pickedPkgs());
  $('#linkSum').innerHTML = LINK.picked.size ? `<b>선택 ${LINK.picked.size}건</b> · 인원 ${m.heads}명${m.monthly ? ` · 월 ${wonL(m.monthly)}원` : ''}${m.once ? ` · 단기 ${wonL(m.once)}원` : ''}${m.need ? ' · <em class="need">금액 확인 필요</em>' : ''}<button type="button" class="btn l" id="btnEstApply">⤵ 작성 정보에 반영</button>`
    : '업무표준·매뉴얼에 넣을 견적을 체크하세요 (여러 건 합산 가능)';
  const ap = $('#btnEstApply'); if (ap) ap.onclick = () => { const E = curEst(); if (E) estApplyForm(E, false); };
}
async function refreshLinks(server) { $('#linkMsg').textContent = '불러오는 중…'; try { await loadLinks(server); } catch (e) { LINK.serverMsg = '불러오기 오류'; } renderLinks(); }
/* 견적 → 작성 정보 */
function estCodeForShift(job, shift) {
  const list = codesFor(job); if (!shift || !list.length) return null;
  const s = String(shift).replace(/\s/g, ''), keys = ['격일', '24h', '5조2교대', '4조3교대', '4조2교대', '3조2교대', '2조2교대', '주5일', '주6일', '야간', '주간'];
  const k = keys.find(x => s.includes(x)); if (!k) return null;
  return list.find(c => c.name.replace(/\s/g, '').includes(k)) || null;
}
function estApplyForm(E, quiet) {
  const nm = s => String(s || '').replace(/\s|주식회사|\(주\)|㈜/g, '');
  const st = E.client && SITES.find(s => { const a = nm(s.name), b = nm(E.client); return a && b && (a.includes(b) || b.includes(a)); });
  if (st && state.site !== st) selectSite(st, true);
  const j = E.jobs.find(x => JOB[x]); if (j && j !== state.job) setJob(j, true);
  if (!st && E.client) { $('#f_client').value = E.client; renderSiteInfo(); }
  const sh = (E.rows.find(r => jobFromText(r.job + ' ' + r.title) === state.job && r.shift) || E.rows.find(r => r.shift) || {}).shift;
  const cd = estCodeForShift(state.job, sh); if (cd) { state.code = cd.id; renderCodes(); }
  autoTitle();
  if (!quiet) toast(`견적을 반영했습니다 — ${st ? st.name : E.client || '고객사'} · ${JOB[state.job].n} · ${E.heads}명${cd ? ' · ' + cd.name.replace(/^\S+\s/, '') : sh ? ' · ' + sh : ''} → 출력물 「인력 운영 기준(견적 연동)」에 들어갑니다`, 5000);
}
function openManualEst(edit) {
  const p = edit || { title: '', client: $('#f_client').value, rows: [{ job: JOB[state.job].n, title: '근무원', count: 1, shift: '', unit: null, amount: null }], monthly: null };
  const rowHtml = (r, i) => `<tr data-i="${i}"><td><input data-k="job" value="${esc(r.job)}" list="jobDl"></td><td><input data-k="title" value="${esc(r.title)}"></td><td><input data-k="count" type="number" min="0" value="${r.count ?? ''}"></td><td><input data-k="shift" value="${esc(r.shift)}" placeholder="예: 격일제, 3조2교대"></td><td><input data-k="unit" type="number" min="0" value="${r.unit ?? ''}" placeholder="1인 월 단가"></td><td><button type="button" class="btn l" data-del="${i}">✕</button></td></tr>`;
  openModal(`<h2>✍ 견적 직접 입력</h2><div class="sub">견적 프로그램 없이 인력 구성을 넣을 때 사용합니다. 1인 월 단가를 넣으면 월 금액이 자동 합산됩니다(VAT 별도).</div>
    <div class="grid2"><div class="field"><label>견적 이름</label><input id="meTitle" value="${esc(p.title)}" placeholder="예: ○○공장 보안·미화 2027"></div><div class="field"><label>고객사</label><input id="meClient" value="${esc(p.client)}"></div></div>
    <datalist id="jobDl">${JOB_ORDER.map(k => `<option value="${JOB[k].n}">`).join('')}</datalist>
    <div class="tblw"><table class="me"><thead><tr><th>직종</th><th>직책</th><th>인원</th><th>근무형태</th><th>1인 월 단가(원)</th><th></th></tr></thead><tbody id="meRows">${p.rows.map(rowHtml).join('')}</tbody></table></div>
    <button type="button" class="btn l" id="meAdd" style="margin-top:6px">＋ 행 추가</button>
    <div class="grid2" style="margin-top:10px"><div class="field"><label>월 도급비 합계 (비우면 단가×인원 합계)</label><input id="meMonthly" type="number" value="${p.monthly ?? ''}"></div><div class="field"><label>계약 개월 수</label><input id="meMonths" type="number" value="${(p.period && p.period.months) || 12}"></div></div>
    <div class="mrow"><button class="btn" id="mClose">취소</button><button class="btn pri" id="meOk">저장하고 선택</button></div>`, md => {
    md.classList.add('wide');
    const rows = () => [...md.querySelectorAll('#meRows tr')].map(tr => { const o = {}; tr.querySelectorAll('[data-k]').forEach(i => o[i.dataset.k] = i.value); o.count = +o.count || 0; o.unit = o.unit ? +o.unit : null; o.amount = o.unit != null ? o.unit * o.count : null; return o; });
    md.querySelector('#meAdd').onclick = () => { const tb = md.querySelector('#meRows'); tb.insertAdjacentHTML('beforeend', rowHtml({ job: '', title: '', count: 1, shift: '' }, tb.children.length)); };
    md.querySelector('#meRows').onclick = e => { const b = e.target.closest('[data-del]'); if (b) b.closest('tr').remove(); };
    md.querySelector('#mClose').onclick = closeModal;
    md.querySelector('#meOk').onclick = () => {
      const rs = rows().filter(r => r.job || r.title || r.count); const sum = rs.reduce((a, r) => a + (r.amount || 0), 0);
      const mm = md.querySelector('#meMonthly').value, months = +md.querySelector('#meMonths').value || 12, monthly = mm ? +mm : (sum || null);
      const pkg = saveManual({ id: (edit && edit.id) || 'm-' + Date.now(), title: md.querySelector('#meTitle').value.trim() || '직접 입력 견적', client: md.querySelector('#meClient').value.trim(), rows: rs, monthly, vat: monthly != null ? Math.round(monthly * 0.1) : null, yearly: monthly != null ? monthly * months : null, period: { months } });
      closeModal(); LINK.picked.add(pkg.id); refreshLinks(false).then(() => { const E = curEst(); if (E) estApplyForm(E, true); }); toast('직접 입력 견적을 저장했습니다');
    };
  });
}
function openSrcMenu() {
  openModal(`<h2>견적 프로그램 열기</h2><div class="sub">견적을 만든 뒤 각 프로그램 화면 아래쪽의 <b>「📑 제안서로 보내기」</b>를 누르면 이 목록에 들어옵니다. (같은 계정으로 로그인하면 다른 기기에서 보낸 견적도 들어옵니다)</div>
    <div class="srcs">${['stqs', 'wbe', 'stse'].map(k => `<a class="srcbtn" href="${SRC[k].url}" target="_blank" rel="noopener" style="--c:#${SRC[k].color}"><span class="ic">${SRC[k].ic}</span><span><b>${esc(SRC[k].n)}</b><small>${esc(SRC[k].full)}</small></span><i>↗</i></a>`).join('')}</div>
    <div class="mrow"><button class="btn pri" id="mClose">닫기</button></div>`, md => { md.querySelector('#mClose').onclick = closeModal; });
}

/* ---------- ③ RFP 분석 ---------- */
function rfpPicks(r) {
  const T = state.kind === 'man' ? 'man' : 'std', s = new Set();
  r.rows.forEach(x => (x[T] || []).forEach(c => s.add(c)));
  return [...s].filter(c => findSmall(c));
}
function runRfp(auto) {
  const t = $('#f_rfp').value.trim(); if (!t) { if (!auto) toast('RFP·과업지시서 내용을 붙여넣거나 파일을 올려 주세요.'); renderRfp(null); return; }
  const r = analyzeRFP(t); renderRfp(r);
  if (auto) applyRfp(r, true);
  toast(`요구사항 ${r.rows.length}건을 찾았습니다${r.ind ? ' · 업종 ' + IND[r.ind].n : ''} — 출력물 「과업 요구사항 대응표」에 들어갑니다.`, 4200);
}
function renderRfp(r) {
  const box = $('#rfpRes'); if (!r) { box.innerHTML = ''; return; }
  const cats = {}; r.rows.forEach(x => cats[x.cat] = (cats[x.cat] || 0) + 1);
  const pk = rfpPicks(r);
  box.innerHTML = `<div class="rfp-h"><b>요구사항 ${r.rows.length}건</b>${Object.entries(cats).map(([k, n]) => `<span class="tg">${esc(k)} ${n}</span>`).join('')}</div>
    <div class="rfp-hint">${[r.title ? `사업명: <b>${esc(r.title)}</b>` : '', r.client ? `발주처: <b>${esc(r.client)}</b>` : '', r.ind ? `업종 추정: <b>${esc(IND[r.ind].n)}</b>` : '', r.jobs.length ? `직종: <b>${r.jobs.map(j => JOB[j] ? JOB[j].n : j).join('·')}</b>` : '', r.period ? `기간: <b>${r.period.from} ~ ${r.period.to}</b>` : '', r.heads.length ? `인원: <b>${r.heads.map(h => `${h.job} ${h.count}명`).join(', ')}</b>` : ''].filter(Boolean).join(' · ')}<br>
    <button type="button" class="btn l" id="rfpApply">↧ 작성 정보에 반영</button><button type="button" class="btn l" id="rfpPick">★ 관련 ${state.kind === 'man' ? '매뉴얼 장·절' : '표준 항목'} ${pk.length}개 선택</button></div>
    <ol class="rfp-list">${r.rows.slice(0, 12).map(x => `<li><span class="tg">${esc(x.cat)}</span>${esc(x.req)}</li>`).join('')}${r.rows.length > 12 ? `<li class="more">… 외 ${r.rows.length - 12}건 (출력물 「과업 요구사항 대응표」에 모두 들어갑니다)</li>` : ''}</ol>`;
  $('#rfpApply').onclick = () => applyRfp(r, false);
  $('#rfpPick').onclick = () => { const add = rfpPicks(r).filter(c => !state.picked.includes(c)); add.forEach(c => { if (state.picked.length < MAX_PICK) state.picked.push(c); }); sortPicked(); renderTree($('#q').value); renderPicked(); toast(`관련 항목 ${add.length}개를 선택했습니다.`); };
}
function applyRfp(r, quiet) {
  if (r.client && !$('#f_client').value) { $('#f_client').value = r.client; renderSiteInfo(); }
  if (r.ind && IND[r.ind] && !$('#f_ind').dataset.touched) $('#f_ind').value = r.ind;
  const j = r.jobs.find(x => JOB[x]); if (j && j !== state.job) setJob(j, true);
  const sp = $('#f_special'); if (sp && r.rows.length && !sp.value.includes('[과업 요구사항]')) sp.value = (sp.value ? sp.value + '\n' : '') + '[과업 요구사항] ' + r.rows.slice(0, 5).map(x => x.req).join(' / ');
  autoTitle();
  if (!quiet) toast('RFP 분석 결과를 작성 정보에 반영했습니다.');
}

/* ---------- 연결 ---------- */
function initLinkUI() {
  $('#linkTabs').onclick = e => { const b = e.target.closest('[data-tab]'); if (b) { LUI.tab = b.dataset.tab; renderLinks(); } };
  $('#linkList').onclick = e => {
    const x = e.target.closest('[data-x]'); if (x) { e.stopPropagation(); const id = x.dataset.x; confirmDel('이 견적을 목록에서 뺄까요? (견적 프로그램의 원본은 그대로 남습니다)', () => { removeLocalPkg(id); LINK.picked.delete(id); refreshLinks(false); }); return; }
    const li = e.target.closest('li.lk'); if (!li) return; const id = li.dataset.id;
    if (LINK.picked.has(id)) LINK.picked.delete(id); else { LINK.picked.add(id); const E = curEst(); if (E) estApplyForm(E, false); }
    renderLinks();
  };
  $('#btnLinkRefresh').onclick = () => refreshLinks(true).then(() => toast('견적 목록을 새로 불러왔습니다.'));
  $('#btnLinkOpen').onclick = openSrcMenu;
  $('#btnLinkManual').onclick = () => openManualEst();
  $('#btnLinkFile').onclick = () => $('#linkFile').click();
  $('#linkFile').onchange = async e => { const fl = e.target.files[0]; e.target.value = ''; if (!fl) return; try { const arr = await importLinkFile(fl); arr.forEach(p => LINK.picked.add(p.id)); await refreshLinks(false); const E = curEst(); if (E) estApplyForm(E, true); toast(`연동 파일에서 견적 ${arr.length}건을 불러왔습니다.`); } catch (er) { toast(er.message, 5000); } };
  $('#btnLinkXl').onclick = () => $('#xlFile').click();
  const takeXl = async files => { let ok = 0, last = null; busy(true, '견적서 읽는 중…');
    try { for (const fl of files) { try { const p = await importEstimateFile(fl); LINK.picked.add(p.id); last = p; ok++; } catch (er) { toast(`「${fl.name}」 — ${er.message}`, 6000); } }
      if (ok) { LUI.tab = 'manual'; await refreshLinks(false); const E = curEst(); if (E) estApplyForm(E, true); toast(`견적서 ${ok}건을 불러왔습니다 — 월 ${wonL(last.monthly)}원 · ${last.heads}명${last.mix ? ' · 원가 구성 포함' : ''}`, 4500); } } finally { busy(false); } };
  $('#xlFile').onchange = e => { const fs = [...e.target.files]; e.target.value = ''; if (fs.length) takeXl(fs); };
  const lc = $('#linkCard'); ['dragover', 'dragenter'].forEach(ev => lc.addEventListener(ev, e => { if ([...(e.dataTransfer.items || [])].some(i => i.kind === 'file')) { e.preventDefault(); lc.classList.add('drag'); } }));
  ['dragleave', 'drop'].forEach(ev => lc.addEventListener(ev, () => lc.classList.remove('drag')));
  lc.addEventListener('drop', e => { const fs = [...(e.dataTransfer.files || [])]; if (!fs.length) return; e.preventDefault(); const xs = fs.filter(f => !/\.json$/i.test(f.name)); if (xs.length) takeXl(xs); });
  $('#btnLinkExport').onclick = e => { e.preventDefault(); const ps = pickedPkgs(); if (!ps.length) return toast('내보낼 견적을 체크하세요.'); download(exportLinkFile(ps), `견적연동_${safeName($('#f_client').value || 'export')}.json`); };
  initRfp();
  $('#btnRfp').onclick = () => runRfp(false);
  $('#btnRfpClear').onclick = () => { $('#f_rfp').value = ''; RFP.att = []; RFP.res = null; renderRfpFiles(); renderRfp(null); };
  refreshLinks(true);
}
