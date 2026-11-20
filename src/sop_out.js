/* =====================================================================
 * 세부 작업표준(SOP) 출력 — 업무표준서 「T. 세부 작업표준」 · 업무매뉴얼 「직무 상세 작업표준」 장
 *  · 작업 1건마다: 작업 정보표(주기·소요·담당·도구·약품·보호구) → 단계별 작업 순서(동작 + 요령·이유) → 완료 기준 / 금지·주의 → 기록
 *  · 구역(장소)마다 현장 영상(PPT 재생 · Word/PDF 클릭 재생 · QR)
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const SOP_JL = { sec: 'S', cln: 'C', prk: 'P', fac: 'F', info: 'I', cook: 'K', san: 'D' };
const SOP_LAWS = { sec: ['SSA7', 'SSA15', 'SSA16', 'PIPA25', 'FSA16', 'OSH38'], cln: ['OSH38', 'OSH39', 'OSH114', 'OSH29', 'WMA15'], prk: ['PKA17', 'ROAD', 'OSH38', 'CIV750'], fac: ['ESMA22', 'MEA19', 'FSA16', 'OSH38', 'ELV'], info: ['PIPA25', 'PIPA29', 'OSH38'], cook: ['FHA40', 'FHA88', 'OSH38'], san: ['IDA51', 'IDA52', 'OSH114'] };
const SOP_VID = { sec: 'sec1', cln: 'cln', prk: 'prk', fac: 'fac', info: 'off', cook: 'off2', san: 'san1' };
function sopCodes(pre, job) { return (SOP[job] ? SOP[job].areas.map((A, i) => `${pre}${SOP_JL[job]}-${pad(i + 1)}`) : []); }
function sopTaxInit() {
  if (STD.find(L => L.c === 'T')) return;
  const mk = pre => JOB_ORDER.filter(j => SOP[j]).map(job => ({ c: pre + SOP_JL[job], n: `${SOP[job].n} 세부 작업표준`, smalls: SOP[job].areas.map((A, i) => ({
    c: `${pre}${SOP_JL[job]}-${pad(i + 1)}`, n: `${A.n} 작업표준 (${A.tasks.length}건)`, g: /SPC|MGR|ETC/.test(A.a) ? 'R' : 'C', gen: 'task', job, area: A.a, jobs: [job], sop: true,
    k: ['작업표준', 'SOP', '절차', '방법', A.n].concat(A.tasks.map(t => t.n)),
    pur: A.intro || `${A.n}에서 하는 ${SOP[job].n} 작업을 누가 하더라도 같은 순서·같은 품질로 하도록 작업 단계·요령·완료 기준을 정한다.`,
    st: [], ck: A.tasks.map(t => `${t.n} — ${t.q[0]}`), rec: uniq(A.tasks.map(t => t.r).filter(r => r && r !== '-')), kpi: ['작업표준 준수율 100%', '재작업(불량) 0건'], l: SOP_LAWS[job] || [] })) }));
  STD.push({ c: 'T', n: '세부 작업표준(SOP)', e: '🧭', mids: mk('T') });
  const iMD = MAN.findIndex(L => L.c === 'MD');
  MAN.splice(iMD + 1, 0, { c: 'MT', n: '직무 상세 작업표준', e: '🧭', mids: mk('MT') });
  JOB_ORDER.forEach(j => { PACK[j] = uniq((PACK[j] || []).concat(sopCodes('T', j))); });
  Object.keys(MAN_PACK).forEach(lv => { if (lv !== 'L1' && !MAN_PACK[lv].includes('MT-*')) MAN_PACK[lv].splice(MAN_PACK[lv].indexOf('MD-03') + 1, 0, 'MT-*'); });
}
function sopAreaOf(S) { return sopArea(S.job, S.area); }
function sopLine(t) { return `[${t.id}] ${t.n} — ${t.f}`; }
function sopGroups(S) {
  const A = sopAreaOf(S); if (!A) return [];
  return [{ title: '목적', lines: [S.pur] }, { title: '작업 목록 (줄을 지우면 그 작업은 빠집니다)', lines: A.tasks.map(sopLine) }, { title: '점검 항목', lines: S.ck.slice() }, { title: '기록·양식', lines: S.rec.length ? S.rec.slice() : ['업무일지'] }, { title: '관리 지표(KPI)', lines: S.kpi.slice() }];
}
function sopPicked(S, text) {
  const A = sopAreaOf(S); if (!A) return { A: null, tasks: [], extra: [] };
  const G = parseGrp(text), list = (G.find(g => /^작업 목록/.test(g.title)) || { lines: [] }).lines;
  const tasks = [], extra = [];
  list.forEach(l => { const m = /^\[([A-Z]+-[A-Z]+-\d+)\]/.exec(l); const t = m && A.tasks.find(x => x.id === m[1]); if (t) tasks.push(t); else if (l.trim()) extra.push(l); });
  return { A, tasks, extra, G };
}

/* ---------- Word ---------- */
function vidLink(key, children) { try { return new docx.ExternalHyperlink({ link: vidUrl(key), children }); } catch (e) { return children[0]; } }
function sopMediaRow(job, A, tasks) {
  const AC = docx.AlignmentType.CENTER, v = A.vid || SOP_VID[job] || 'sec1', w1 = 3600, w2 = CW - w1;
  const q = qrPng(vidUrl(v), 150);
  const left = new docx.TableCell({ width: { size: w1, type: docx.WidthType.DXA }, borders: noB(), verticalAlign: docx.VerticalAlign.CENTER, margins: { top: 40, bottom: 40, left: 40, right: 80 }, children: [
    new docx.Paragraph({ alignment: AC, spacing: { after: 30 }, children: [vidLink(v, [imgRun(posterOf(v), 230, [16, 9])])] }),
    new docx.Paragraph({ alignment: AC, spacing: { after: 0 }, children: [vidLink(v, [new docx.TextRun({ text: '▶ 영상 재생 (누르면 웹에서 재생)', font: W_FONT, size: 19, bold: true, color: '1155CC', underline: {} })])] })] });
  const right = new docx.TableCell({ width: { size: w2, type: docx.WidthType.DXA }, borders: noB(), verticalAlign: docx.VerticalAlign.CENTER, margins: { top: 40, bottom: 40, left: 120, right: 40 }, children: [
    P([R(`${A.e || ''} ${A.n} — 현장 영상 · 작업 기준`, { size: 23, bold: true, color: C.navy })], { after: 60 }),
    P([R(`이 구역 작업 ${(tasks || A.tasks).length}건`, { size: 20, bold: true, color: C.greenD })], { after: 30 }),
    ...(tasks || A.tasks).map((t, i) => P([R(`${i + 1}) ${t.n}`, { size: 20 }), R(`  ${t.f}`, { size: 17, color: C.gray })], { after: 10, line: 280 })),
    new docx.Paragraph({ spacing: { after: 0 }, children: (q ? [imgRun(q, 72, [1, 1], 'png')] : []).concat([R(`   휴대폰 카메라로 QR을 비추면 ${VIDEO_TITLE[v] || '현장 영상'}이 재생됩니다 · PPT 파일에서는 바로 재생`, { size: 18, color: C.greenD, bold: true })]) })] });
  return new docx.Table({ width: { size: CW, type: docx.WidthType.DXA }, columnWidths: [w1, w2], rows: [new docx.TableRow({ cantSplit: true, children: [left, right] })] });
}
function sopTaskDocx(t, k) {
  const out = [], AC = docx.AlignmentType.CENTER, W = CW;
  out.push(P([R(`작업 ${k}  `, { size: 22, bold: true, color: C.white }), R(`${t.n}`, { size: 25, bold: true, color: C.white }), R(`    ${t.id}`, { size: 18, color: 'D8E2FF' })],
    { before: 220, after: 0, keepNext: true, shading: { type: docx.ShadingType.CLEAR, color: 'auto', fill: C.navy }, border: { left: { style: docx.BorderStyle.SINGLE, size: 36, color: C.green, space: 6 } } }));
  const iw = [1500, 3319, 1500, 3319];
  const lab = (s, w) => cell([P([R(s, { size: 19, bold: true, color: C.greenD })], { align: AC, after: 0 })], { w, fill: 'EAF5EE' });
  const val = (s, w, span) => cell([P([R(s || '-', { size: 20 })], { after: 0, line: 300 })], { w, span });
  out.push(new docx.Table({ width: { size: W, type: docx.WidthType.DXA }, columnWidths: iw, rows: [
    new docx.TableRow({ cantSplit: true, children: [lab('작업 주기', iw[0]), val(t.f, iw[1]), lab('소요 시간', iw[2]), val(t.t, iw[3])] }),
    new docx.TableRow({ cantSplit: true, children: [lab('담 당', iw[0]), val(t.who, iw[1]), lab('보호구', iw[2]), val((t.ppe || []).join(', ') || '-', iw[3])] }),
    new docx.TableRow({ cantSplit: true, children: [lab('도구·장비', iw[0]), val((t.tool || []).join(', '), W - iw[0], 3)] })
  ].concat((t.chem && t.chem.length) ? [new docx.TableRow({ cantSplit: true, children: [lab('약품·희석', iw[0]), val(t.chem.join(' / '), W - iw[0], 3)] })] : []) }));
  const sw = [700, 4600, W - 5300];
  const hdr = new docx.TableRow({ tableHeader: true, cantSplit: true, children: [th('순서', sw[0]), th('작업 동작 (이렇게 합니다)', sw[1]), th('요령 · 이유 · 기준', sw[2])] });
  const rows = t.s.map((s, i) => new docx.TableRow({ cantSplit: true, children: [
    cell([P([R(String(i + 1), { size: 26, bold: true, color: C.white })], { align: AC, after: 0 })], { w: sw[0], fill: i % 2 ? '2B4C9B' : C.green }),
    cell([P([R(s[0], { size: 21, bold: true, color: '111827' })], { after: 0, line: 310 })], { w: sw[1], fill: i % 2 ? 'F7F9FC' : undefined }),
    cell([P([R(s[1] || '', { size: 19, color: '374151' })], { after: 0, line: 300 })], { w: sw[2], fill: i % 2 ? 'F7F9FC' : undefined })] }));
  out.push(P([R('')], { after: 0, line: 120 }));
  out.push(new docx.Table({ width: { size: W, type: docx.WidthType.DXA }, columnWidths: sw, rows: [hdr].concat(rows) }));
  const half = Math.floor(W / 2);
  const qx = new docx.TableRow({ cantSplit: true, children: [
    cell([P([R('✅ 완료 기준 — 이 상태면 끝', { size: 20, bold: true, color: C.greenD })], { after: 30 })].concat(t.q.map(x => P([R('□ ' + x, { size: 20 })], { after: 20, line: 300 }))), { w: half, fill: 'F1F8F3', va: docx.VerticalAlign.TOP }),
    cell([P([R('⛔ 금지 · 주의', { size: 20, bold: true, color: 'B42318' })], { after: 30 })].concat((t.x.length ? t.x : ['-']).map(x => P([R('• ' + x, { size: 20 })], { after: 20, line: 300 }))), { w: W - half, fill: 'FDF2F1', va: docx.VerticalAlign.TOP })] });
  out.push(P([R('')], { after: 0, line: 120 }));
  out.push(new docx.Table({ width: { size: W, type: docx.WidthType.DXA }, columnWidths: [half, W - half], rows: [qx] }));
  if (t.r && t.r !== '-') out.push(P([R('📝 기록  ', { size: 19, bold: true, color: C.navy }), R(t.r, { size: 19 })], { before: 60, after: 40 }));
  return out;
}
function sopDocx(S, p) {
  const { A, tasks, extra } = sopPicked(S, p.text[S.c]); if (!A) return [];
  const out = [], J = SOP[S.job];
  out.push(sopMediaRow(S.job, A, tasks));
  if (A === J.areas[0] || !p._sopIntro) { p._sopIntro = true; out.push(boxPara([P([R(`${J.n} 작업의 기본 원칙`, { size: 21, bold: true, color: C.greenD })], { after: 40 })].concat(J.intro.map(t => P([R('• ' + t, { size: 20 })], { after: 20, line: 300 }))))); }
  tasks.forEach((t, i) => out.push(...sopTaskDocx(t, i + 1)));
  if (extra.length) { out.push(H2('현장 추가 기준')); extra.forEach(l => out.push(P([R('• ' + l, { size: 20 })], { after: 30 }))); }
  if (S.job === 'cln' && A.a === 'EQP') out.push(...chemDocx());
  return out;
}
function chemDocx() {
  const out = [], AC = docx.AlignmentType.CENTER;
  out.push(H2('청소약품 용도 · 희석비율 (에스텍 표준)'));
  const w = [1100, 1900, 1800, 3038, 1800];
  out.push(table([[th('구분', w[0]), th('약품', w[1]), th('제품', w[2]), th('용도', w[3]), th('희석 · pH', w[4])]].concat(CHEM_DIL.map(c => [td(c.g, w[0], { align: AC, size: 18 }), td(c.n, w[1], { bold: true, size: 19 }), td(c.p, w[2], { size: 18 }), td(c.use, w[3], { size: 18 }), td(`${c.dil}\n${c.ph}`, w[4], { size: 18, color: C.navy })])), w, { header: true }));
  out.push(H2('약품 사용 원칙 (pH)'));
  PH_RULE.forEach(t => out.push(P([R('• ' + t, { size: 20 })], { after: 20 })));
  out.push(H2('미화 장비 제원 · 용도'));
  const ew = [2300, 1500, 2800, 1900, 1138];
  out.push(table([[th('장비', ew[0]), th('모델', ew[1]), th('제원', ew[2]), th('용도', ew[3]), th('주의', ew[4])]].concat(EQUIP.map(e => [td(e.n, ew[0], { bold: true, size: 18 }), td(e.m, ew[1], { size: 17 }), td(e.spec, ew[2], { size: 17 }), td(e.use, ew[3], { size: 17 }), td(e.note, ew[4], { size: 17 })])), ew, { header: true }));
  return out;
}

/* ---------- PPT ---------- */
function sopStepParas(steps, from) { return steps.map((s, i) => [{ text: `${from + i + 1}.  ${s[0]}`, bold: true }].concat(s[1] ? [{ text: '      ' + s[1], size: 0.86, color: '4B5563', gap: 4 }] : [])).flat(); }
function sopSlides(S, p, Sl, no, secLabel) {
  const { A, tasks } = sopPicked(S, p.text[S.c]); if (!A) return no;
  const J = SOP[S.job], v = A.vid || SOP_VID[S.job] || 'sec1';
  /* 구역 표지 — 영상 재생 */
  { const o = frame(`${secLabel}  ${A.e || ''} ${A.n} — ${J.n} 작업표준`, `작업 ${tasks.length}건 · 영상은 PPT에서 바로 재생`, no, p);
    o.push(Rc(0.6, 1.6, 7.3, 4.15, '0F1530')); o.push(Vd(0.65, 1.65, 7.2, 4.05, v));
    o.push(T(0.6, 5.85, 7.3, 0.4, `▶ ${VIDEO_TITLE[v] || '현장 근무 영상'} — 화면을 누르면 재생됩니다`, { pt: 12, color: K.navy, bold: true }));
    o.push(Rc(8.15, 1.6, 4.6, 4.85, 'FAFBFC', { line: K.line })); o.push(Rc(8.15, 1.6, 4.6, 0.07, C.green));
    o.push(T(8.35, 1.75, 4.25, 1.45, [{ text: A.intro || `${A.n} 작업 표준`, color: '1F2937' }], { max: 14, min: 11, lh: 1.3 }));
    o.push(Rc(8.35, 3.25, 4.2, 0.02, K.line));
    o.push(T(8.35, 3.35, 4.25, 3.0, tasks.map((t, i) => ({ text: `${i + 1}. ${t.n}`, bold: i < 0 })), { max: 14, min: 10.5, gap: 2 }));
    Sl.push(o); no++; }
  /* 작업별 */
  tasks.forEach((t, k) => {
    const all = t.s; let pages = [all];
    const fitAll = fit(sopStepParas(all, 0), 7.55, 3.55, 15, 11.5, 1.2, 3);
    if (!fitAll.ok) { const h = Math.ceil(all.length / 2); pages = [all.slice(0, h), all.slice(h)]; }
    let from = 0;
    pages.forEach((st, pi) => {
      const last = pi === pages.length - 1;
      const o = frame(`${secLabel}  ${A.n} · 작업 ${k + 1}. ${t.n}${pages.length > 1 ? ` (${pi + 1}/${pages.length})` : ''}`, `${t.id}  ·  주기 ${t.f}  ·  소요 ${t.t}  ·  담당 ${t.who}`, no, p);
      // 왼쪽: 준비물
      o.push(Rc(0.6, 1.6, 4.1, last ? 3.55 : 4.85, 'F4F6FB', { line: K.line })); o.push(Rc(0.6, 1.6, 4.1, 0.07, K.navy));
      const prep = [{ text: '준비물', bold: true, color: K.navy }].concat((t.tool || []).map(x => ({ text: '•  ' + x }))).concat(t.chem && t.chem.length ? [{ text: '약품 · 희석', bold: true, color: C.greenD, gap: 2 }].concat(t.chem.map(x => ({ text: '•  ' + x }))) : []).concat(t.ppe && t.ppe.length ? [{ text: '보호구', bold: true, color: 'B45309' }].concat([{ text: '•  ' + t.ppe.join(', ') }]) : []);
      o.push(T(0.75, 1.72, 3.85, last ? 3.35 : 4.65, prep, { max: 13.5, min: 10, gap: 2 }));
      // 오른쪽: 단계
      o.push(T(4.95, 1.58, 7.8, 0.36, [{ text: `작업 순서${pages.length > 1 ? ` (${from + 1}~${from + st.length}단계)` : ''}`, bold: true }], { pt: 14, color: K.navy }));
      o.push(Rc(4.95, 1.95, 7.8, 0.03, C.green));
      o.push(T(5.0, 2.05, 7.7, last ? 3.1 : 4.4, sopStepParas(st, from), { max: 15, min: 11, lh: 1.2, gap: 3 }));
      from += st.length;
      if (last) {
        o.push(Rc(0.6, 5.28, 6.0, 1.18, 'EEF7F1', { line: 'CFE6D7' })); o.push(Rc(0.6, 5.28, 0.08, 1.18, C.green));
        o.push(T(0.8, 5.32, 5.7, 1.1, [{ text: '✅ 완료 기준', bold: true, color: C.greenD }].concat(t.q.map(x => ({ text: '□ ' + x }))), { max: 13, min: 10, gap: 1 }));
        o.push(Rc(6.75, 5.28, 6.0, 1.18, 'FDF2F1', { line: 'F3C7C1' })); o.push(Rc(6.75, 5.28, 0.08, 1.18, 'C8553D'));
        o.push(T(6.95, 5.32, 5.7, 1.1, [{ text: '⛔ 금지 · 주의', bold: true, color: 'B42318' }].concat((t.x.length ? t.x : ['-']).map(x => ({ text: '• ' + x }))), { max: 13, min: 10, gap: 1 }));
      }
      Sl.push(o); no++;
    });
  });
  if (S.job === 'cln' && A.a === 'EQP') {
    const rows = CHEM_DIL, half = Math.ceil(rows.length / 2);
    [rows.slice(0, half), rows.slice(half)].forEach((part, pi) => {
      const o = frame(`${secLabel}  청소약품 용도 · 희석비율 (${pi + 1}/2)`, '희석비율을 지키면 깨끗하고 안전합니다 — 진하게 쓰지 않습니다', no, p);
      part.forEach((c, i) => { const y = 1.62 + i * 0.68;
        o.push(Rc(0.6, y, 12.15, 0.62, i % 2 ? 'F7F9FC' : C.white, { line: K.line })); o.push(Rc(0.6, y, 0.08, 0.62, c.g === '바닥관리' ? K.blu : C.green));
        o.push(T(0.8, y, 3.1, 0.62, [{ text: c.n, bold: true }, { text: c.p, size: 0.85, color: K.mute }], { max: 13, min: 10, valign: 'middle', gap: 0 }));
        o.push(T(3.95, y, 4.6, 0.62, c.use, { max: 12, min: 9.5, valign: 'middle' }));
        o.push(T(8.6, y, 4.1, 0.62, [{ text: c.dil, bold: true, color: K.navy }, { text: c.ph, size: 0.85, color: K.mute }], { max: 12, min: 9.5, valign: 'middle', gap: 0 })); });
      Sl.push(o); no++;
    });
  }
  return no;
}
