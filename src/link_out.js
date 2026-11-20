/* =====================================================================
 * 출력물 연동 섹션 — 업무표준서 · 업무매뉴얼 (Word · PPT · PDF)
 *  ① 인력 운영 기준(견적 연동): 직종·직책·인원·근무형태 → 근무조 코드 지표 · 배치 기준 · (사내용) 월 금액
 *  ② 과업 요구사항 대응표(RFP): 요구사항 → 관련 표준 항목/매뉴얼 장 · 이행 방법
 *  Designed & Developed by Rat Rae Choi
 * ===================================================================== */
function linkData(p) {
  if (!p.link) p.link = { E: curEst(), R: curRfp() };
  return p.link;
}
function estRowsFor(E) { return E.rows.map(r => ({ job: r.job || '', title: r.title || '', count: r.count || 0, shift: r.shift || '', unit: r.unit, amount: r.amount, code: estCodeForShift(jobFromText(r.job + ' ' + r.title) || state.job, r.shift) })); }
function refName(code) { const x = findSmall(code); return x ? `${code} ${x.S.n.replace(/\s*\(.*\)$/, '')}` : code; }
/* ---------- Word ---------- */
function linkDocx(ch, p, n) {
  const { E, R: RQ } = linkData(p), internal = p.f.mode !== 'client', AC = docx.AlignmentType.CENTER;
  const head = t => ch.push(H1(n != null ? `${ROMAN[n++]}. ${t}` : t));
  if (E) {
    head('인력 운영 기준 (견적 연동)');
    ch.push(P([R(`출처: ${E.srcs.map(s => SRC[s] ? SRC[s].full : s).join(' · ')} — ${E.client || p.f.client} · 총 ${E.heads}명${E.period.from ? ` · 계약 기간 ${E.period.from} ~ ${E.period.to}` : ''}`, { size: 18, color: C.gray })], { after: 60 }));
    const rows = estRowsFor(E), w = internal ? [1300, 2100, 800, 2438, 1400, 1600] : [1500, 3000, 900, 4238];
    ch.push(table([(internal ? ['직종', '직책 · 업무', '인원', '근무형태 (근무조 코드)', '1인 단가', '월 금액'] : ['직종', '직책 · 업무', '인원', '근무형태 (근무조 코드)']).map((h, i) => th(h, w[i]))].concat(rows.map(r => {
      const base = [td(r.job, w[0], { bold: true }), td(r.title, w[1]), td(`${r.count}명`, w[2], { align: AC }), td(`${r.shift || '-'}${r.code ? `\n${r.code.id} · ${r.code.name.replace(/^\S+\s/, '')}` : ''}`, w[3], { size: 17 })];
      return internal ? base.concat([td(r.unit != null ? wonL(r.unit) : '-', w[4], { align: docx.AlignmentType.RIGHT }), td(r.amount != null ? wonL(r.amount) : '-', w[5], { align: docx.AlignmentType.RIGHT })]) : base;
    })).concat([[td('합계', w[0], { bold: true, fill: 'EEF1F5' }), td('', w[1], { fill: 'EEF1F5' }), td(`${E.heads}명`, w[2], { align: AC, bold: true, fill: 'EEF1F5' }), td('', w[3], { fill: 'EEF1F5' })].concat(internal ? [td('', w[4], { fill: 'EEF1F5' }), td(E.monthly ? wonL(E.monthly) : '-', w[5], { align: docx.AlignmentType.RIGHT, bold: true, fill: 'EEF1F5' })] : [])]), w, { header: true }));
    const L = [];
    uniq(rows.map(r => r.code && r.code.id)).forEach(id => { const c = AMS_CODES.find(x => x.id === id); if (!c) return; const m = shiftMetrics(c); L.push(`${c.id} ${c.name.replace(/^\S+\s/, '')} — 순환 ${c.seq.split('').join(' ')} · 월 근무 ${m.days.toFixed(1)}일 · 월 실근로 약 ${Math.round(m.hours)}시간 · 주 평균 ${m.week.toFixed(1)}시간 · 24시간 초소 최소 ${m.crews}조${c.ltype === '감시단속' ? ' · 감시·단속적 근로 승인 필요(근로기준법 제63조)' : ''}`); });
    L.push(`배치 기준: 견적 인원 ${E.heads}명을 근무 편성표(근태관리 근무조 코드)로 편성하고, 결원 시 지사 대체 인력을 24시간 이내 투입한다.`);
    L.push('근무시간·휴게·연장·야간·휴일근로는 견적 산출 조건과 같게 운영하고, 바뀌면 견적과 이 표준을 함께 개정한다.');
    if (internal && E.monthly) L.push(`월 도급비 ${wonL(E.monthly)}원 (VAT 별도${E.yearly ? ` · 계약 기간 ${wonL(E.yearly)}원` : ''}) — 사내 관리용, 고객사 제출본에는 금액이 빠집니다.`);
    if (internal && E.mix) L.push(`원가 구성(사내): 인건비 ${wonL(E.mix.labor)}원 · 제비용 ${wonL(E.mix.expense)}원 · 일반관리비·이윤 ${wonL(E.mix.marg)}원`);
    ch.push(...bullets([{ title: '운영 기준', lines: L }]));
  }
  if (RQ) {
    head('과업 요구사항 대응표 (제안요청서 · 과업지시서)');
    ch.push(P([R(`${RQ.title ? `사업명: ${RQ.title} · ` : ''}${RQ.client ? `발주처: ${RQ.client} · ` : ''}요구사항 ${RQ.rows.length}건 — 요구사항마다 관련 업무표준·매뉴얼과 이행 방법을 정한다.`, { size: 18, color: C.gray })], { after: 60 }));
    const w = [600, 1300, 3600, 2200, 1938], T0 = p.kind === 'man' ? 'man' : 'std';
    ch.push(table([['No', '구분', '요구사항', '관련 표준 · 매뉴얼', '이행 방법'].map((h, i) => th(h, w[i]))].concat(RQ.rows.map((x, i) => [td(String(i + 1), w[0], { align: AC, size: 16 }), td(x.cat, w[1], { bold: true, size: 16 }), td(x.req, w[2], { size: 16 }),
      td((x[T0] || []).filter(c => findSmall(c)).map(refName).join('\n') || '-', w[3], { size: 15 }), td(x.how || '', w[4], { size: 15 })])), w, { header: true }));
    if (RQ.subm && RQ.subm.length) ch.push(...bullets([{ title: '제출 서류 요구', lines: RQ.subm.slice(0, 10) }]));
  }
  return n;
}
/* ---------- PPT · PDF ---------- */
function linkSlides(p, S, no, label) {
  const { E, R: RQ } = linkData(p), internal = p.f.mode !== 'client';
  if (E) {
    const rows = estRowsFor(E), per = 11;
    for (let i = 0; i < Math.max(1, rows.length); i += per) {
      const o = frame(label('인력 운영 기준 (견적 연동)') + (rows.length > per ? ` (${i / per + 1})` : ''), `${E.client || p.f.client} · 총 ${E.heads}명${E.period.from ? ` · ${E.period.from} ~ ${E.period.to}` : ''}`, no, p);
      const cols = internal ? [{ t: '직종', w: 1.5, b: 1 }, { t: '직책 · 업무', w: 3.2 }, { t: '인원', w: 0.9, al: 'center' }, { t: '근무형태 · 근무조 코드', w: 3.9 }, { t: '1인 단가', w: 1.3, al: 'right' }, { t: '월 금액', w: 1.35, al: 'right', b: 1 }]
        : [{ t: '직종', w: 1.8, b: 1 }, { t: '직책 · 업무', w: 4.0 }, { t: '인원', w: 1.0, al: 'center' }, { t: '근무형태 · 근무조 코드', w: 5.35 }];
      const body = rows.slice(i, i + per).map(r => { const a = [r.job, r.title, `${r.count}명`, `${r.shift || '-'}${r.code ? ` (${r.code.id})` : ''}`]; return internal ? a.concat([r.unit != null ? wonL(r.unit) : '-', r.amount != null ? wonL(r.amount) : '-']) : a; });
      if (i + per >= rows.length) { const t = ['합계', '', `${E.heads}명`, '']; const rr = internal ? t.concat(['', E.monthly ? wonL(E.monthly) : '-']) : t; rr._fill = 'EEF1F5'; body.push(rr); }
      const y = tbl(o, 0.6, 1.6, cols, body, { rh: 0.38, pt: 11 });
      const codes = uniq(rows.map(r => r.code && r.code.id)).map(id => AMS_CODES.find(x => x.id === id)).filter(Boolean);
      if (codes.length && y < 6.2) o.push(T(0.6, y + 0.15, 12.1, SH - y - 0.75, listParas([{ title: '근무형태 지표 (근태관리 근무조 코드)', lines: codes.map(c => { const m = shiftMetrics(c); return `${c.id} ${c.name.replace(/^\S+\s/, '')} — 월 근무 ${m.days.toFixed(1)}일 · 월 실근로 ${Math.round(m.hours)}h · 주 ${m.week.toFixed(1)}h · 24시간 최소 ${m.crews}조`; }) }]), { max: 13, min: 9.5 }));
      S.push(o); no++;
    }
  }
  if (RQ) {
    const T0 = p.kind === 'man' ? 'man' : 'std', per = 9;
    for (let i = 0; i < RQ.rows.length; i += per) {
      const o = frame(label('과업 요구사항 대응표') + (RQ.rows.length > per ? ` (${i / per + 1}/${Math.ceil(RQ.rows.length / per)})` : ''), `${RQ.title || RQ.client || '제안요청서 · 과업지시서'} · 요구사항 ${RQ.rows.length}건`, no, p);
      tbl(o, 0.6, 1.6, [{ t: 'No', w: 0.6, al: 'center' }, { t: '구분', w: 1.4, b: 1 }, { t: '요구사항', w: 5.2 }, { t: '관련 표준 · 매뉴얼', w: 2.6 }, { t: '이행 방법', w: 2.35 }],
        RQ.rows.slice(i, i + per).map((x, k) => [String(i + k + 1), x.cat, x.req, (x[T0] || []).filter(c => findSmall(c)).map(c => c).join(', ') || '-', x.how || '']), { rh: 0.54, pt: 10 });
      S.push(o); no++;
    }
  }
  return no;
}
