/* =====================================================================
 * 📦 사업장 자료 패키지 — 한 사업장에 필요한 관리서류 일체를 한 번에 생성 (ZIP)
 *  기준: 에스텍 「미화사업장 관리(관련)서류 종합 LIST」 36종 + 약품 MSDS 경고표지·희석비율·중량물 게시물
 *        보안·주차·시설·안내·조리·소독방역은 같은 체계에 직종별 대장·점검표·품질평가를 맞춤
 *  · 모든 서류에 사업장명·소속 지사·소재지·직종·작성자·연도를 미리 기재
 *  · Word(docx) = stec 머리글·바닥글(바닥글 서명 날짜 제외) / Excel(xlsx) = 인쇄 설정·머리글·바닥글
 *  Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const PKG_VER = 'stos-pkg-1';

/* ---------- 사업장 정보 ---------- */
function pkCtx(f) {
  const st = f.siteObj, J = JOB[f.job], code = AMS_CODES.find(c => c.id === f.code) || null, t = kstNow(), mg = (UI && UI.manager) || {};
  const br = st ? st.br : ((mg.br || '동부').replace('지사', ''));
  const cnt = st ? (({ sec: st.sec, cln: st.cln })[f.job] ?? st.etc) || st.total : 0;
  return {
    f, st, J, job: f.job, code,
    site: st ? st.name : (f.client || ''), org: st ? `에스텍베스트 ${st.br}지사` : (f.dept || APP.branch), br,
    addr: st ? st.addr : '', type: st ? st.type : '', total: st ? st.total : '', m: st ? st.m : '', w: st ? st.f : '', cnt: cnt || '',
    shift: code ? code.name.replace(/^\S+\s/, '') : (st && st.shift) || '', mgrSite: st && st.mgr ? `${st.pos || ''} ${st.mgr}`.trim() : '',
    author: f.author || mg.name || '', authorT: mg.title || '', year: t.getFullYear(), ym: `${t.getFullYear()}. ${pad(t.getMonth() + 1)}.`,
    date: `${t.getFullYear()}. ${pad(t.getMonth() + 1)}. ${pad(t.getDate())}.`, head: ({ cln: '미화소장', sec: '보안반장', prk: '주차반장', fac: '시설과장', info: '안내 팀장', cook: '조리실장', san: '방역팀장' })[f.job] || '현장대리인'
  };
}
const PJ = c => ({ cln: '미화', sec: '보안', prk: '주차', fac: '시설', info: '안내', cook: '조리', san: '방역' })[c.job] || c.J.n;

/* =====================================================================
 * Word 부품
 * ===================================================================== */
const PW = 9638, PWL = 14570;
function pR(t, o = {}) { return new docx.TextRun({ text: String(t ?? ''), font: W_FONT, size: o.size || 19, bold: o.bold, color: o.color || '1C2333', italics: o.it }); }
function pP(t, o = {}) { const runs = Array.isArray(t) ? t : [pR(t, o)]; return new docx.Paragraph({ children: runs, alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 40, line: o.line || 276 }, indent: o.indent, keepNext: o.keepNext, pageBreakBefore: o.pb }); }
const AC_ = () => docx.AlignmentType.CENTER;
function pC(t, w, o = {}) {
  const ls = String(t ?? '').split('\n');
  return new docx.TableCell({ width: { size: w, type: docx.WidthType.DXA }, columnSpan: o.span, rowSpan: o.rspan, verticalAlign: docx.VerticalAlign.CENTER,
    shading: o.fill ? { fill: o.fill, type: docx.ShadingType.CLEAR, color: 'auto' } : undefined, margins: { top: 40, bottom: 40, left: 80, right: 80 }, borders: bAll('7A8494', 4),
    children: ls.map(x => pP([pR(x, { size: o.size || 18, bold: o.bold, color: o.color })], { align: o.align, after: 0, line: 252 })) });
}
const pH = (t, w, o = {}) => pC(t, w, Object.assign({ fill: 'DCE3F0', bold: true, align: AC_() }, o));
function pT(rows, widths, o = {}) {
  return new docx.Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: docx.WidthType.DXA }, columnWidths: widths, alignment: o.align,
    rows: rows.map((r, i) => new docx.TableRow({ cantSplit: true, tableHeader: o.header && i < (o.hn || 1), height: o.h ? { value: (typeof o.h === 'function' ? o.h(i) : o.h), rule: docx.HeightRule.ATLEAST } : undefined, children: r })) });
}
function pTitle(t, o = {}) { return pP([pR(t, { size: o.size || 34, bold: true, color: '0B1F8F' })], { align: AC_(), after: o.after ?? 80, line: 360, pb: o.pb }); }
function pTop(c, id) {
  return new docx.Paragraph({ spacing: { after: 30 }, tabStops: [{ type: docx.TabStopType.RIGHT, position: c.W || PW }], children: [pR(`${c.org}  |  ${c.site || '사업장명'}`, { size: 15, color: '4B5563', bold: true }), new docx.TextRun({ text: '\t', font: W_FONT }), pR(id || '', { size: 15, color: '1E8B3A', bold: true })] });
}
/* 결재란 — 오른쪽 정렬 */
function pAppr(labels) {
  const w = 1000, rows = [[pH('결\n재', 520, { rspan: 2, size: 16 })].concat(labels.map(l => pH(l, w, { size: 16 }))), labels.map(() => pC(' ', w))];
  return pT(rows, [520].concat(labels.map(() => w)), { align: docx.AlignmentType.RIGHT, h: i => i ? 620 : 300 });
}
/* 머리 정보표: [[라벨, 값], ...] → 4칸 */
function pInfo(pairs, W = PW) {
  const lw = 1300, vw = Math.floor((W - lw * 2) / 2), rows = [];
  for (let i = 0; i < pairs.length; i += 2) {
    const a = pairs[i], b = pairs[i + 1];
    rows.push(b ? [pH(a[0], lw, { size: 16 }), pC(a[1], vw), pH(b[0], lw, { size: 16 }), pC(b[1], W - lw * 2 - vw)] : [pH(a[0], lw, { size: 16 }), pC(a[1], W - lw, { span: 3 })]);
  }
  return pT(rows, [lw, vw, lw, W - lw * 2 - vw], { h: 330 });
}
/* 표: 머리 + 자료/빈 줄 */
function pGrid(cols, data, o = {}) {
  const W = o.W || PW, tot = cols.reduce((a, x) => a + (x[1] || 1), 0), w = cols.map(x => Math.floor(W * (x[1] || 1) / tot)); w[w.length - 1] += W - w.reduce((a, b) => a + b, 0);
  const head = [cols.map((x, i) => pH(x[0], w[i], { size: o.hs || 16 }))];
  const n = Math.max(o.blank || 0, data.length), rows = [];
  for (let r = 0; r < n; r++) { const d = data[r] || []; rows.push(w.map((ww, i) => pC(d[i] ?? '', ww, { size: o.size || 17, align: (cols[i][2] === 'c' ? AC_() : undefined), bold: o.boldFirst && i === 0, fill: o.boldFirst && i === 0 ? 'F4F6FA' : undefined }))); }
  return pT(head.concat(rows), w, { header: true, h: i => i ? (o.rh || 400) : 360 });
}
function pBox(lines, fill = 'F2F7F3') {
  return pT([[new docx.TableCell({ width: { size: PW, type: docx.WidthType.DXA }, shading: { fill, type: docx.ShadingType.CLEAR, color: 'auto' }, margins: { top: 80, bottom: 80, left: 140, right: 140 }, borders: bAll('9FD3AE', 6),
    children: lines.map(l => pP([pR(l, { size: 17 })], { after: 20 })) })]], [PW]);
}
const pSp = (n = 60) => pP('', { after: n, line: 200 });
const pFoot = (t) => pP([pR(t, { size: 14, color: '6B7385' })], { before: 60, after: 0 });
/* 문서 묶기 — 구역별 가로/세로 */
async function pDoc(sections, title) {
  const doc = new docx.Document({ creator: APP.maker, title, description: `${APP.name} ${APP.version} · 사업장 자료 패키지`, styles: { default: { document: { run: { font: W_FONT, size: 19 } } } },
    sections: sections.map(s => ({ properties: { page: { size: s.land ? { width: 11906, height: 16838, orientation: docx.PageOrientation.LANDSCAPE } : { width: 11906, height: 16838 },
      margin: s.land ? { top: 1500, bottom: 1300, left: 1134, right: 1134, header: 800, footer: 700 } : { top: 1850, bottom: 1831, left: 1134, right: 1134, header: 1020, footer: 973 } } }, children: s.ch })) });
  return await applyHeaderFooter(await docx.Packer.toBlob(doc), { noDate: true });
}
/* 서명 줄 */
const pSign = (c, who) => pP([pR(`${c.date}`, { size: 19 })], { align: AC_(), before: 200, after: 60 });

/* =====================================================================
 * Excel 부품 (ExcelJS)
 * ===================================================================== */
const XB = { top: { style: 'thin', color: { argb: 'FF7A8494' } }, left: { style: 'thin', color: { argb: 'FF7A8494' } }, bottom: { style: 'thin', color: { argb: 'FF7A8494' } }, right: { style: 'thin', color: { argb: 'FF7A8494' } } };
const XF = { name: '맑은 고딕', size: 10 };
function xBook() { const wb = new ExcelJS.Workbook(); wb.creator = APP.maker; wb.company = '에스텍 그룹'; wb.created = new Date(); return wb; }
function xSheet(wb, name, c, widths, o = {}) {
  const ws = wb.addWorksheet(name.slice(0, 31), { pageSetup: { paperSize: 9, orientation: o.land ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.6, bottom: 0.6, header: 0.25, footer: 0.25 }, horizontalCentered: true },
    headerFooter: { oddHeader: `&L&8${c.org}  |  ${c.site || ''}&R&8${o.id || ''}`, oddFooter: '&L&8에스텍 그룹 · Program for Process Standardization and Manual Creation&C&8- &P / &N -&R&8Program & Design by Rat Rae Choi' } });
  ws.columns = widths.map(w => ({ width: w }));
  ws.properties.defaultRowHeight = 18;
  return ws;
}
function xCell(ws, r, cI, v, st = {}) {
  const cl = ws.getCell(r, cI); cl.value = v;
  cl.font = Object.assign({}, XF, st.font || {}); cl.alignment = Object.assign({ vertical: 'middle', wrapText: true }, st.al || {});
  if (st.fill) cl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + st.fill } };
  if (st.b !== false) cl.border = XB; if (st.fmt) cl.numFmt = st.fmt; return cl;
}
function xMerge(ws, r1, c1, r2, c2, v, st = {}) { if (r1 !== r2 || c1 !== c2) ws.mergeCells(r1, c1, r2, c2); const cl = xCell(ws, r1, c1, v, st); if (st.b !== false) for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) ws.getCell(r, c).border = XB; return cl; }
/* 제목(+결재란) → 다음 행 번호 */
function xTitle(ws, n, title, c, o = {}) {
  const appr = o.appr === false ? 0 : (o.appr || [c.head, '지사장']).length + 1, tEnd = appr ? n - appr : n;
  xMerge(ws, 1, 1, 2, tEnd, title, { font: { size: title.length > 22 ? 13 : 16, bold: true, color: { argb: 'FF0B1F8F' } }, al: { horizontal: 'center' }, b: false });
  ws.getRow(1).height = 22; ws.getRow(2).height = 26;
  if (appr) { const L = o.appr || [c.head, '지사장']; xMerge(ws, 1, tEnd + 1, 2, tEnd + 1, '결\n재', { fill: 'DCE3F0', font: { bold: true, size: 9 }, al: { horizontal: 'center' } });
    L.forEach((l, i) => { xCell(ws, 1, tEnd + 2 + i, l, { fill: 'DCE3F0', font: { bold: true, size: 9 }, al: { horizontal: 'center' } }); xCell(ws, 2, tEnd + 2 + i, ''); }); ws.getRow(2).height = 34; }
  let r = 3;
  if (o.info !== false) {
    const info = o.info || [['사업장', c.site], ['소속', c.org], ['직종', c.J.n], ['작성자', c.author]];
    const half = Math.max(1, Math.floor(n / 2)); r = 4;
    info.forEach((p, i) => {
      const row = r + Math.floor(i / 2), left = i % 2 === 0, c1 = left ? 1 : half + 1, c2 = left ? half : n;
      xCell(ws, row, c1, p[0], { fill: 'EEF1F5', font: { bold: true, size: 9 }, al: { horizontal: 'center' } });
      xMerge(ws, row, c1 + 1, row, c2, p[1] ?? '', { al: { horizontal: 'left' } });
    });
    r += Math.ceil(info.length / 2) + 1;
  }
  return r;
}
function xHead(ws, r, heads, o = {}) { heads.forEach((h, i) => xCell(ws, r, i + 1, h, { fill: o.fill || '1F3A73', font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 9.5 }, al: { horizontal: 'center' } })); ws.getRow(r).height = o.h || 24; return r + 1; }
function xRows(ws, r, n, data, o = {}) {
  for (let i = 0; i < Math.max(n, data.length); i++) { const d = data[i] || []; for (let k = 0; k < o.cols; k++) xCell(ws, r + i, k + 1, d[k] ?? (k === 0 && o.no ? i + 1 : ''), { al: { horizontal: (o.center || []).includes(k) ? 'center' : 'left' }, fmt: (o.fmt || {})[k] }); ws.getRow(r + i).height = o.h || 20; }
  return r + Math.max(n, data.length);
}
function xNote(ws, r, n, t) { xMerge(ws, r, 1, r, n, t, { b: false, font: { size: 8.5, color: { argb: 'FF5B6475' } } }); return r + 1; }
async function xBlob(wb) { const buf = await wb.xlsx.writeBuffer(); return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); }
/* 간단 대장: 제목 + 열 + 빈 줄 */
async function xRegister(c, title, cols, n, o = {}) {
  const wb = xBook(), ws = xSheet(wb, o.sheet || title, c, cols.map(x => x[1]), { land: o.land, id: o.id });
  let r = xTitle(ws, cols.length, title, c, o);
  r = xHead(ws, r, cols.map(x => x[0]));
  r = xRows(ws, r, n, o.data || [], { cols: cols.length, no: cols[0][0] === 'NO' || cols[0][0] === '번호', center: o.center || [0], h: o.rh });
  if (o.note) xNote(ws, r + 1, cols.length, o.note);
  ws.views = [{ state: 'frozen', ySplit: 0 }];
  if (o.more) await o.more(wb, c);
  return xBlob(wb);
}

/* =====================================================================
 * 직종별 기준 내용
 * ===================================================================== */
const EDU_MONTH = [
  ['넘어짐 사고 예방', '넘어짐 위험요소(물기·결빙·전선·계단) · 안전한 청소·이동 방법 · 미끄럼 방지 신발 · 표지판 설치', ['젖은 바닥에는 반드시 「미끄럼 주의」 표지판을 먼저 세운다', '계단·경사로는 손잡이를 잡고 뛰지 않는다', '전선·호스는 벽 쪽으로 정리해 걸려 넘어지지 않게 한다', '결빙 구간은 모래·염화칼슘을 뿌리고 보고한다']],
  ['스트레칭 효과 및 방법', '작업 전·중·후 스트레칭 종류·방법 · 근골격계 부담 줄이기', ['작업 시작 전 5분 전신 스트레칭(목·어깨·허리·손목·종아리)', '반동 없이 15~20초 유지, 통증이 있으면 멈춘다', '같은 자세 1시간 이상 계속하지 않고 중간에 풀어 준다']],
  ['봄철 안전사고 예방', '춘곤증 · 황사·미세먼지 · 봄철 화재 · 해빙기 안전', ['졸음이 오면 작업을 멈추고 휴식한다(사다리·기계 작업 금지)', '황사·미세먼지 경보 시 KF94 마스크 착용, 외곽 작업 최소화', '해빙기 지반 침하·낙석·담장 균열을 순찰 때 확인·보고', '건조한 날 흡연장·쓰레기장 화재 주의']],
  ['위험물질 안전관리 및 MSDS', '사업장 화학물질 종류 · MSDS 보는 법 · 경고표지 · 보호구', ['모든 약품 용기에 경고표지(제품명·그림문자·신호어)가 붙어 있어야 한다', '희석은 정해진 비율로, 물 먼저 → 약품 나중', '락스(염소계)와 산성 세제는 절대 섞지 않는다(염소가스)', '눈에 들어가면 15분 이상 흐르는 물로 씻고 즉시 보고']],
  ['안전보건표지', '금지·경고·지시·안내 표지 색과 뜻 · 표지 설치 위치', ['빨강=금지, 노랑=경고, 파랑=지시(보호구 착용), 초록=안내(비상구)', '표지 앞을 물건으로 가리지 않는다', '훼손·누락된 표지는 즉시 보고해 교체']],
  ['근골격계질환 예방', '중량물·반복작업 위험 · 올바른 들기 자세 · 보조기구 사용', ['물건은 몸 가까이, 무릎을 굽혀 다리 힘으로 든다(허리 굽히기 금지)', '20kg 이상은 2인 1조 또는 대차 사용', '손목·어깨 통증이 2주 이상 계속되면 보고하고 진료']],
  ['응급상황별 처치요령', '심정지(CPR·AED) · 출혈 · 화상 · 골절 · 열사병 대응', ['쓰러진 사람: 반응 확인 → 119 신고 → AED 요청 → 가슴압박(분당 100~120회, 5cm)', '출혈: 깨끗한 천으로 직접 압박', '화상: 흐르는 찬물로 15분 이상 식힌다(얼음·연고 금지)', '모든 응급상황은 처치와 동시에 보고']],
  ['여름철 고온작업 재해예방', '온열질환 증상 · 물·그늘·휴식 · 폭염 단계별 작업 조정', ['물은 목마르지 않아도 15~20분마다 한 컵', '폭염특보 시 14~17시 외곽 작업 최소화, 1시간마다 10~15분 휴식', '어지럼·두통·구토 → 즉시 그늘로 옮기고 보고(열사병 의심 시 119)']],
  ['인력운반 및 보조운반장비', '대차·카트 사용법 · 계단 운반 금지 기준 · 적재 방법', ['대차는 밀어서 이동하고 앞이 보이게 적재한다', '계단으로 무거운 물건을 혼자 나르지 않는다', '승강기 이용 시 정원·적재 하중을 지킨다']],
  ['추락재해 예방조치', '사다리·작업발판 안전 · 2인 1조 · 고소작업 기준', ['A형 사다리는 벌림 고정 후 사용, 최상단 발판에 올라가지 않는다', '사다리 작업은 2인 1조(1명은 잡아 준다)', '2m 이상 고소작업은 안전대·작업발판 확인 후 관리자 승인']],
  ['화재의 위험성 및 대피요령', '화재 원인 · 소화기·소화전 사용법 · 대피 경로', ['「불이야」 외치고 경보 → 119 신고 → 초기 진화(소화기) → 대피', '소화기: 안전핀 뽑기 → 노즐 불 쪽 → 손잡이 누르기 → 빗자루 쓸듯', '연기가 있으면 낮은 자세로, 승강기 대신 계단 이용']],
  ['동절기 재해예방대책', '한랭질환 · 결빙 넘어짐 · 난방기 화재 · 제설 작업 안전', ['출근 전 결빙 구간 제설·염화칼슘 살포', '전열기는 퇴근 시 반드시 끄고 플러그를 뽑는다', '방한복·장갑·미끄럼 방지 신발 착용']]
];
const EDU_JOB = {
  sec: [['경비원 직무교육(경비업법)', '경비업법 시행규칙 제13조 — 일반경비원 직무교육 매월 정기 실시(현장 교육 기록 보관)'], ['출입통제·순찰 요령', '방문객·차량·물품 반출입 절차, 순찰 체크포인트'], ['개인정보·영상정보 보호', 'CCTV 열람·반출 절차, 방문객 대장 관리'], ['폭력·폭언 대응', '언쟁 피하기, 녹음·기록, 112 신고 기준']],
  cln: [['약품 희석·소분 실습', '희석비율표·소분용기 색상 구분·경고표지'], ['장비 사용법(세정기·진공청소기)', '사용 전 점검·운전·정리·충전'], ['화장실 위생관리 실습', '변기·세면대·바닥 순서·전용 걸레 색상']],
  prk: [['수신호·유도 실습', '경광봉 신호·위치·안전거리'], ['정산·시재 관리', '할인 처리·마감·차액 보고'], ['주차장 사고 접수', '사진·블랙박스·보고 절차']],
  fac: [['전기 안전·LOTO', '정전 작업·잠금·표지·검전'], ['법정 점검 관리', '소방·승강기·전기·가스 점검 일정'], ['밀폐공간·고소작업', '산소·유해가스 측정, 감시인 배치']],
  info: [['고객 응대 화법', '첫인상·불만 응대·전화 예절'], ['비상시 안내', '대피 안내·장애인·노약자 우선']],
  cook: [['식품위생·HACCP', '개인위생·교차오염·중심온도'], ['식재료 검수·보존식', '검수 기준·보존식 144시간'], ['주방 화재·가스 안전', 'K급 소화기·가스 밸브']],
  san: [['약제 안전 취급', '희석·보호구·보관'], ['소독 실시 기록', '감염병예방법 소독 증명']]
};
/* 법정 교육 (근거) */
const EDU_LAW = [
  ['산업안전보건교육(정기)', '산업안전보건법 제29조 · 시행규칙 별표4 — 사무직 외 근로자 매반기 12시간 이상', '매월 2시간 (월별 주제)'],
  ['채용 시 교육', '같은 별표4 — 일용·1주 이하 1시간, 1주~1개월 4시간, 그 밖 8시간 이상', '입사 시'],
  ['작업내용 변경 시 교육', '같은 별표4 — 일용 1시간, 그 밖 2시간 이상', '변경 시'],
  ['관리감독자 교육', '같은 별표4 — 연간 16시간 이상', '연간'],
  ['직장 내 성희롱 예방교육', '남녀고용평등법 제13조 — 연 1회 이상', '연 1회'],
  ['장애인 인식개선 교육', '장애인고용촉진법 제5조의2 — 연 1회 이상', '연 1회'],
  ['개인정보 보호교육', '개인정보 보호법 제28조 — 개인정보취급자 정기 교육', '연 1회'],
  ['퇴직연금 교육', '근로자퇴직급여 보장법 제32조 — 퇴직연금 가입자 연 1회', '연 1회']
];
/* 현장 책임자 하루 업무 */
const DAY_PLAN = {
  cln: [['07:00 ~ 09:00', ['건물 순회점검(지하~지상 위생상태)', '조회 — 출근·건강·복장 확인', '업무지시 — 금일 실시사항, 전일 미비점 보완', '서비스·안전교육(TBM 5분)', '장비·용품·소모품 불출']], ['09:00 ~ 11:30', ['화장실·로비 1차 점검(점검표 서명)', '정기청소 작업 현장 확인', '고객사 요청사항 접수·배정']], ['11:30 ~ 13:00', ['점심 교대 배치 확인(공백 구역 없게)', '화장실 소모품 2차 보충 확인']], ['13:00 ~ 15:00', ['구역별 청소 상태 순회 점검', '약품·용품 재고 확인', '근무자 면담·고충 청취']], ['15:00 ~ 16:30', ['화장실 3차 점검 · 외곽·흡연장 확인', '익일 작업 계획·인원 배치']], ['16:30 ~ 17:00', ['업무일지 작성·결재', '장비 충전·창고 정리·시건 확인', '특이사항 지사 보고']]],
  sec: [['교대 시', ['대면 인수인계(열쇠·장비·미결 업무)', '근무자 건강·복장·장비 확인', 'TBM — 방문·공사·행사·기상·위험요인']], ['오전', ['출입 통제 현장 확인(정문·물류)', '정기 순찰 기록 확인', '고객사 요청 접수']], ['점심', ['교대 휴게 배치(초소 공백 금지)']], ['오후', ['CCTV 관제 상태·녹화 확인', '방문객·차량 대장 점검', '근무자 순회 지도']], ['근무 종료', ['근무일지 결재', '열쇠·장비 수량 확인', '특이사항 지사 보고']]],
  prk: [['오픈', ['정산기·차단기·LPR 작동 확인', '시재 인수', 'TBM']], ['출근 시간대', ['입차 유도 인원 배치', '정체 구간 지원']], ['낮', ['불법·장기 주차 계도', '정기권 등록 처리', '순찰']], ['퇴근 시간대', ['출차 정체 해소', '정산 민원 처리']], ['마감', ['정산 마감·시재 확인', '관제 일지 결재', '특이사항 보고']]],
  fac: [['출근', ['기계실·전기실 1차 순회점검', '야간 특이사항 인수', 'TBM·작업 배정']], ['오전', ['보수 요청 처리', '법정 점검 일정 확인', '에너지 검침']], ['오후', ['2차 순회점검', '외주 작업 입회·작업허가', '자재 재고 확인']], ['퇴근', ['설비 일상점검표 결재', '익일 작업 계획', '특이사항 보고']]],
  info: [['오픈', ['데스크 정리·방문 예약 확인', '복장·명찰 점검']], ['근무 중', ['방문객 응대·안내', '전화 응대·메모 전달', '불만 응대 기록']], ['마감', ['방문객 대장 정리', '익일 예약 확인', '특이사항 보고']]],
  cook: [['출근', ['조리 종사자 위생 점검', '냉장·냉동고 온도 기록', '식재료 검수']], ['조리', ['전처리·세척·소독 확인', '중심온도 확인·기록']], ['배식', ['배식 위생·보존식 채취']], ['마감', ['세척·소독·주방 안전 점검', '가스 밸브·전원 차단', '일지 결재']]],
  san: [['작업 전', ['작업 계획·대상 구역 안내', '약제·장비·보호구 준비']], ['작업', ['희석·분무 소독', '트랩 점검']], ['작업 후', ['환기·정리', '소독 대장·증명서 작성', '결과 보고']]]
};
/* 요일별 중점 (미화 기준 · 다른 직종은 점검 중점) */
const WEEK_FOCUS = {
  cln: [['월', '로비·출입구 유리 전체 / 출입구 매트 흡진·세척'], ['화', '화장실 벽체·칸막이 세정 / 요석 제거(소변기)'], ['수', '계단 난간·벽 먼지 제거 / 엘리베이터 홈·스텐'], ['목', '복도 바닥 기계 세정 / 소화전·소화기·입간판'], ['금', '사무실 유리·창틀 / 탕비실·회의실 정리'], ['토', '샤워실·탈의실 바닥 기계 세정 / 외곽 화단'], ['일', '주차장 램프·배수구 / 창고 정리·장비 점검']],
  sec: [['월', '출입 통제 장비(게이트·차단기) 점검'], ['화', '소화기·소화전 외관 순찰'], ['수', 'CCTV 녹화·화면 점검'], ['목', '열쇠 수량 전수 확인'], ['금', '비상구·피난통로 장애물 점검'], ['토', '외곽 펜스·조명 점검'], ['일', '근무일지·대장 정리·주간 보고']],
  prk: [['월', '정산기·LPR 점검'], ['화', '주차면·도색 상태'], ['수', '조명·안내표지'], ['목', '배수구·결빙 취약 구간'], ['금', '장기 주차 차량 확인'], ['토', '정기권 만료 안내'], ['일', '주간 정산 마감']],
  fac: [['월', '수변전 설비 점검'], ['화', '공조기·필터'], ['수', '급배수·펌프'], ['목', '소방 설비'], ['금', '승강기·자동문'], ['토', '조명·콘센트'], ['일', '주간 점검표 정리']]
};

/* 미화: 정기청소(연간) — SOP에서 주기 추출 */
const PERIODIC = {
  sec: [['소방 훈련 · 대피 훈련', '건물 전체', '반기 1회'], ['경비원 직무교육', '근무자 전원', '매월'], ['CCTV 저장장치 · 녹화 기간 점검', '방재실', '매월'], ['열쇠 전수 조사', '경비실', '분기 1회'], ['출입통제 장비 정밀 점검', '정문 · 출입구', '분기 1회'], ['비상연락망 갱신', '현장', '분기 1회'], ['소화기 압력 · 외관 순찰 점검', '건물 전체', '매월'], ['방문객 · 영상 열람 대장 파기 확인', '경비실', '반기 1회'], ['동절기 · 하절기 대비 점검', '외곽', '연 1~2회']],
  prk: [['주차면 · 도색 · 안내표지 점검', '주차장 전체', '분기 1회'], ['정산기 · 차단기 정밀 점검', '출입구', '매월'], ['주차장 물청소 협조', '주차장', '매월'], ['정기권 갱신 안내', '관리실', '매월'], ['배수구 · 결빙 취약 구간 점검', '램프', '연 1~2회'], ['수신호 · 사고 대응 교육', '근무자', '분기 1회']],
  fac: [['소방시설 작동기능점검', '건물 전체', '연 1회'], ['소방시설 종합정밀점검', '건물 전체', '연 1회'], ['승강기 자체점검', '승강기', '매월'], ['전기설비 정기점검', '수변전실', '매월'], ['저수조 청소 · 수질검사', '저수조', '반기 1회'], ['냉난방기 필터 청소', '공조기', '매월'], ['비상발전기 시운전', '발전기실', '매월'], ['가스시설 점검', '가스 배관', '반기 1회'], ['방역 · 소독 협조', '건물 전체', '분기 1회']],
  info: [['고객 응대 품질 모니터링', '데스크', '매월'], ['비상 대피 안내 훈련', '로비', '반기 1회'], ['방문객 대장 파기 확인', '데스크', '반기 1회']],
  cook: [['주방 대청소 · 후드 덕트 청소', '주방', '분기 1회'], ['그리스트랩 정밀 청소', '주방', '매월'], ['조리 종사자 건강진단(보건증)', '근무자', '연 1회'], ['방역 · 소독', '주방 · 식당', '매월'], ['소화기 · K급 소화기 점검', '주방', '매월'], ['위생 교육', '근무자', '매월']],
  san: [['정기 소독(감염병예방법)', '건물 전체', '분기 1회'], ['해충 트랩 교체', '건물 전체', '매월'], ['방제 결과 보고', '고객사', '매월']]
};
function periodicTasks(job) {
  const out = []; (SOP[job] ? SOP[job].areas : []).forEach(A => A.tasks.forEach(t => { if (/월|분기|반기|연|년/.test(t.f) && !/매월 20일/.test(t.f) && monthsOf(t.f).length) out.push({ a: A.n, t }); }));
  (PERIODIC[job] || []).forEach(x => out.push({ a: x[1], t: { n: x[0], f: x[2] } }));
  return out;
}
function monthsOf(f) {
  if (/반기/.test(f)) return [5, 11]; if (/분기/.test(f)) return [3, 6, 9, 12]; if (/연 1~2|년 1~2/.test(f)) return [4, 10]; if (/연간|연 1|년 1/.test(f)) return [10];
  if (/월 1|월간|매월|^매월/.test(f)) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; return [];
}
function dailyTasks(job) { const out = []; (SOP[job] ? SOP[job].areas : []).forEach(A => A.tasks.forEach(t => { if (/1일|매일|일 \d|출근|청소 시작|교대|상시|근무 중/.test(t.f) && !/월 1|분기|반기/.test(t.f)) out.push({ a: A.n, t }); })); return out; }
function toolsOf(job) { const s = new Set(); (SOP[job] ? SOP[job].areas : []).forEach(A => A.tasks.forEach(t => (t.tool || []).forEach(x => s.add(x)))); return [...s]; }

/* MSDS 경고표지 자료 (제품 MSDS 2항 기준) — 그림문자: 05 부식성, 06 급성독성, 07 경고, 08 건강유해 */
const MSDS_LBL = [
  { n: '일반오염물 세정제', p: '지피원오렌지', sig: '경고', h: ['H319 눈에 심한 자극을 일으킴'], g: ['07'] },
  { n: '화장실 살균세정제', p: '포렉스뉴트럴', sig: '경고', h: ['H315 피부에 자극을 일으킴'], g: ['07'], x: '다른 물질 또는 제품과 절대 혼합하지 마시오' },
  { n: '금속오염물 세정제', p: '울트라크린', sig: '경고', h: ['H315 피부에 자극을 일으킴', 'H319 눈에 심한 자극을 일으킴'], g: ['07'], x: '다른 물질 또는 제품과 절대 혼합하지 마시오' },
  { n: '유리 세정제', p: '랜드 글라스 크리너', sig: '경고', h: ['H315 피부에 자극을 일으킴'], g: ['07'] },
  { n: '소독 살균제', p: '유한락스', sig: '위험', h: ['H314 피부에 심한 화상과 눈 손상을 일으킴', 'H318 눈에 심한 손상을 일으킴'], g: ['05'], x: '산성 세제와 섞으면 유독한 염소가스 발생' },
  { n: '세면대·바닥 관리제', p: '홈스타(욕실용)', sig: '경고', h: ['눈·피부에 자극을 줄 수 있음(약산성)'], g: ['07'], x: '락스(염소계)와 함께 쓰지 마시오' },
  { n: '소포제', p: '럭키-101A', sig: '경고', h: ['H317 알레르기성 피부 반응을 일으킬 수 있음'], g: ['07'] },
  { n: '황동 광택제', p: '퍼스트임프레션', sig: '위험', h: ['장기에 손상을 일으킴'], g: ['08'] },
  { n: '주차장 바닥 세정제', p: '포워드', sig: '위험', h: ['H314 피부에 심한 화상과 눈에 손상을 일으킴'], g: ['05'] },
  { n: '왁스 박리제', p: '써니스트립', sig: '경고', h: ['H290 금속을 부식시킬 수 있음', 'H315 피부에 자극을 일으킴', 'H330 흡입하면 치명적임'], g: ['05', '06', '07'], x: '반드시 환기 · 마스크 착용' },
  { n: '왁스 코팅제', p: '랜드샤인', sig: '경고', h: ['눈에 들어가지 않게 하시오'], g: ['07'] },
  { n: '주방용 세척제', p: '리오퐁', sig: '경고', h: ['H315 피부에 자극을 일으킴', 'H317 알레르기성 피부 반응을 일으킬 수 있음', 'H319 눈에 심한 자극을 일으킴'], g: ['07'] },
  { n: '바닥 관리제', p: '하이퍼포먼스 뉴트럴 플로어 크리너', sig: '경고', h: ['눈에 심한 자극을 일으킴'], g: ['07'] },
  { n: '카페트 전용세제', p: '타스키 TR101', sig: '위험', h: ['H315 피부에 자극을 일으킴', '눈에 심한 손상을 일으킬 수 있음'], g: ['05', '07'] }
];
const MSDS_P = ['취급 전 보호장갑·보안경을 착용하시오', '정해진 희석비율을 지키고 다른 약품과 섞지 마시오', '눈에 묻으면: 몇 분간 물로 조심해서 씻고, 콘택트렌즈를 제거하고 계속 씻으시오', '피부에 묻으면: 다량의 물로 씻으시오 · 자극이 계속되면 의사의 진찰을 받으시오', '마셨을 때: 입을 씻어내고 토하게 하지 말고 즉시 의료기관에 연락하시오', '용기를 밀봉하여 직사광선을 피해 서늘한 곳에 보관하시오'];
/* 마포·걸레 색상 구분 (교차오염 방지) */
const COLOR_CODE = [['빨강', 'FF0000', '대·소변기 전용', '변기 외 사용 금지'], ['노랑', 'FFC000', '화장실 세면대·바닥·벽', '변기와 같이 쓰지 않음'], ['파랑', '1F4E9C', '사무실·복도·로비 일반 구역', '일반 먼지·물걸레'], ['초록', '1E8B3A', '탕비실·식당·주방', '음식 관련 구역 전용'], ['회색', '808080', '주차장·외곽', '기름때·흙먼지'], ['보라', '7030A0', '격리실·감염 관리 구역', '사용 후 소독·별도 세탁']];

/* =====================================================================
 * 문서 생성기 — 공통
 * ===================================================================== */
const PKD = {};
PKD.appoint = async c => pDoc([{ ch: [pTop(c, '관리감독자 지정'), pTitle('관 리 감 독 자  지 정 서', { size: 40, after: 400 }),
  pInfo([['현 장 명', c.site], ['소 속', c.org], ['성 명', ''], ['직 책', c.head], ['지정 기간', `${c.year}. 1. 1. ~ ${c.year}. 12. 31.`], ['직 종', c.J.n]]), pSp(200),
  pP(`위 사람을 산업안전보건법 제16조 및 같은 법 시행령 제15조에 따라 ${c.site || '해당 사업장'}의 안전·보건에 관한 업무를 수행하는 관리감독자로 지정합니다.`, { size: 21, line: 360, after: 200 }),
  pBox(['※ 관리감독자의 업무 (산업안전보건법 시행령 제15조)', '1. 관리감독자가 지휘·감독하는 작업과 관련된 기계·기구 또는 설비의 안전·보건 점검 및 이상 유무의 확인', '2. 소속 근로자의 작업복·보호구 및 방호장치의 점검과 그 착용·사용에 관한 교육·지도', '3. 해당 작업에서 발생한 산업재해에 관한 보고 및 이에 대한 응급조치', '4. 해당 작업의 작업장 정리·정돈 및 통로 확보에 대한 확인·감독', '5. 위험성평가를 위한 유해·위험요인의 파악 및 개선조치 시행에 참여', '6. 그 밖에 해당 작업의 안전 및 보건에 관한 사항으로서 고용노동부령으로 정하는 사항', '※ 관리감독자는 연간 16시간 이상 정기교육을 받아야 합니다(시행규칙 별표4).'], 'F6F8FB'),
  pSp(300), pP(c.date, { align: AC_(), size: 22, after: 300 }), pP([pR(`${c.org}  지사장`, { size: 24, bold: true }), pR('     (인)', { size: 22 })], { align: AC_(), after: 200 }),
  pP([pR('위 지정을 수락합니다.        관리감독자 :                    (서명)', { size: 20 })], { align: docx.AlignmentType.RIGHT, before: 300 })] }], '관리감독자 지정서');

PKD.recruit = async c => pDoc([{ ch: [pTop(c, '채용'), pTitle('구 인  공 고  의 뢰 서'), pAppr(['담당', c.head, '지사장']), pSp(),
  pInfo([['사 업 장', c.site], ['소속 지사', c.org], ['근무지 주소', c.addr], ['직 종', c.J.n], ['모집 인원', '    명 (남   · 여   )'], ['근무 형태', c.shift], ['근무 시간', ''], ['휴게 시간', ''], ['급 여', `월          원 (${c.year}년 최저임금 ${RATE[c.year] ? won(RATE[c.year].wage) : ''}원 이상)`], ['계약 기간', ''], ['자격 요건', c.job === 'sec' ? '경비업법상 결격사유 없는 자 · 신임교육 이수(또는 이수 예정)' : c.job === 'cook' ? '조리사 면허(해당 시) · 건강진단 결과서' : '신체 건강한 자'], ['우대 사항', ''], ['제출 서류', '이력서 · 주민등록등본 · 건강진단서 · 통장 사본 · 자격증 사본'], ['접수 기간', ''], ['공고 매체', '□ 워크넷 □ 지역 생활정보지 □ 알바천국 □ 사내 추천 □ 기타'], ['담당자 연락처', c.author]]), pSp(120),
  pBox(['※ 채용 공고 시 유의사항', '- 성별·연령·용모·출신 지역 등으로 차별하는 표현을 쓰지 않습니다(남녀고용평등법 제7조, 고령자고용법 제4조의4).', '- 채용 서류는 채용 여부 확정 후 14일 이내 반환 청구에 응해야 합니다(채용절차법 제11조).', '- 근로조건은 공고 내용과 다르게 불리하게 변경하지 않습니다(채용절차법 제4조).'])] }], '구인 공고 의뢰서');

function interviewDoc(c, mgr) {
  const items = mgr ? [['리더십·조직관리', '근무자 통솔·갈등 조정 경험', 20], ['업무 전문성', `${c.J.n} 작업표준·장비·약품(또는 장비) 이해`, 20], ['안전·법규 이해', '산업안전보건법·노동관계법 기본', 15], ['고객 응대', '고객사 요청·불만 처리 능력', 15], ['문서·보고', '일지·계획서·보고서 작성', 15], ['책임감·성실성', '근태·태도·이직 사유', 15]]
    : [['근무 의욕', '지원 동기·성실성', 20], ['신체 건강', '작업 수행 가능 여부(중량물·장시간 서서 근무)', 20], ['경험·숙련', `${c.J.n} 관련 경력`, 20], ['태도·용모', '인사·말투·복장 청결', 15], ['협조성', '조 근무·교대 근무 적응', 15], ['근무 조건 수용', '근무시간·근무지·급여 이해', 10]];
  return pDoc([{ ch: [pTop(c, '채용'), pTitle(`${c.J.n} ${mgr ? '(관리자)' : '(신입·승계)'} 면접 평가표`), pAppr(['면접관', c.head, '지사장']), pSp(),
    pInfo([['사 업 장', c.site], ['면접 일시', ''], ['지 원 자', ''], ['생년월일', ''], ['지원 직책', mgr ? c.head : `${c.J.n} 근무원`], ['연 락 처', '']]), pSp(100),
    pGrid([['평가 항목', 1.4], ['평가 내용', 2.6], ['배점', 0.6, 'c'], ['A(100%)', 0.7, 'c'], ['B(80%)', 0.7, 'c'], ['C(60%)', 0.7, 'c'], ['D(40%)', 0.7, 'c'], ['점수', 0.7, 'c']], items.map(x => [x[0], x[1], String(x[2]), '', '', '', '', '']).concat([['합 계', '', '100', '', '', '', '', '']]), { rh: 520, boldFirst: true }), pSp(100),
    pGrid([['종합 의견', 1]], [['']], { rh: 1300 }), pSp(80),
    pGrid([['판정', 1, 'c'], ['□ 채용 (80점 이상)     □ 보류 (60~79점)     □ 불채용 (60점 미만)', 5]], [], {}),
    pFoot('※ 면접 질문에서 혼인·임신·가족 상황·종교·정치 성향 등 직무와 관계없는 개인정보는 묻지 않습니다(채용절차법 제4조의3).')] }], '면접 평가표');
}
PKD.intMgr = c => interviewDoc(c, true); PKD.intNew = c => interviewDoc(c, false);

PKD.contract = async c => {
  const rt = RATE[c.year] || RATE[2026], W = [1500, 8138];
  const row = (a, b) => [pH(a, W[0], { size: 17 }), pC(b, W[1], { size: 17 })];
  return pDoc([{ ch: [pTop(c, '근로계약'), pTitle('근 로 계 약 서', { size: 36 }), pP(`${c.org} (이하 "사용자")와 근로자 (이하 "근로자")는 다음과 같이 근로계약을 체결한다.`, { size: 18, after: 100 }),
    pT([row('1. 근로계약기간', `       년     월     일부터        년     월     일까지 (수습 3개월 — 수습 중 임금은 최저임금의 90% 이상, 1년 이상 계약에 한함)`),
      row('2. 근무장소', `${c.site || ''}  (${c.addr || ''})\n※ 업무상 필요하면 근로자와 협의하여 변경할 수 있다.`),
      row('3. 업무내용', `${c.J.n} 업무 — 「${c.site || '사업장'} ${c.J.n} 업무표준서·작업표준(SOP)」에 따른 업무`),
      row('4. 소정근로시간', `근무형태: ${c.shift || ''}\n    시    분부터     시    분까지 (휴게시간:    시    분 ~    시    분)`),
      row('5. 근무일·휴일', '매주    일 근무, 주휴일 매주    요일 (근로기준법 제55조) · 관공서 공휴일 유급휴일(제55조 제2항)'),
      row('6. 임금', `- 기본급: 월(일·시간)              원\n- 고정 연장·야간·휴일 수당: 월              원 (근로시간: 연장   h · 야간   h · 휴일   h)\n- 기타 수당:              원\n- 임금 지급일: 매월    일 (휴일이면 전일) · 지급 방법: 근로자 명의 예금통장 입금\n※ ${c.year}년 최저임금 시간급 ${won(rt.wage)}원 · 월 209시간 기준 ${won(rt.month)}원 이상`),
      row('7. 연차유급휴가', '근로기준법 제60조에 따라 부여한다.'),
      row('8. 사회보험', '☑ 고용보험  ☑ 산재보험  ☑ 국민연금  ☑ 건강보험'),
      row('9. 근로계약서 교부', '사용자는 근로계약을 체결함과 동시에 이 계약서를 사본하여 근로자에게 교부한다(근로기준법 제17조).'),
      row('10. 기타', `- 이 계약에 정하지 않은 사항은 근로기준법·취업규칙에 따른다.\n- 근로자는 「${c.J.n} 업무표준서」와 안전수칙을 지키고, 고객사 시설·정보를 보호한다.\n- 개인정보 수집·이용(인사·급여·4대보험) 동의서를 별도로 작성한다.`)], W), pSp(160),
    pP(c.date.replace(/\.$/, '') + '.', { align: AC_(), size: 20, after: 160 }),
    pT([[pH('사 용 자', 1500, { size: 17 }), pC(`사업체명: ${c.org}\n주소: ${(BRANCHES.find(b => b.key === c.br) || {}).addr || ''}\n대표자:                         (서명)`, 3319, { size: 17 }), pH('근 로 자', 1500, { size: 17 }), pC('성명:                         (서명)\n생년월일:\n주소:\n연락처:', 3319, { size: 17 })]], [1500, 3319, 1500, 3319])] }], '근로계약서');
};

PKD.leave = async c => xRegister(c, '휴 가 원 (연차 · 반차 · 경조 · 병가)', [['NO', 5], ['성명', 10], ['구분', 9], ['기간(부터)', 12], ['기간(까지)', 12], ['일수', 6], ['사유', 22], ['대체 근무자', 11], ['신청일', 10], ['서명', 8]], 25,
  { appr: [c.head, '지사장'], center: [0, 2, 5], note: '※ 연차는 근로기준법 제60조 · 대체 근무자 확인 후 결재 · 병가는 진단서 첨부', land: true });

PKD.handover = async c => {
  const eq = c.job === 'cln' ? EQUIP.map(e => [e.n, `${e.m} · ${e.spec}`]) : toolsOf(c.job).slice(0, 30).map(t => [t, '']);
  const cols = [['NO', 5], ['품명', 24], ['형식/규격', 30], ['수량', 6], ['구입년월', 9], ['사용개월', 8], ['구입금액(원)', 11], ['개별단가(원)', 11], ['인수금액(원)', 11], ['비고', 10]];
  const wb = xBook(), ws = xSheet(wb, '인수리스트', c, cols.map(x => x[1]), { land: true, id: '인수품목' });
  let r = xTitle(ws, cols.length, `${c.J.n} 장비 · 용품 · 소모품 인수 품목`, c, { appr: ['인계자', '인수자', '지사장'], info: [['일자', ''], ['사업장', c.site], ['인계자(소속·성명)', ''], ['인수자(소속·성명)', `${c.org} ${c.author}`]] });
  r = xHead(ws, r, cols.map(x => x[0]));
  const start = r; r = xRows(ws, r, Math.max(40, eq.length), eq.map((e, i) => [i + 1, e[0], e[1]]), { cols: cols.length, center: [0, 3, 4, 5] });
  for (let i = start; i < r; i++) { ws.getCell(i, 9).value = { formula: `IF(D${i}="","",D${i}*H${i})` }; [7, 8, 9].forEach(k => ws.getCell(i, k).numFmt = '#,##0'); }
  xCell(ws, r, 1, '합계', { fill: 'EEF1F5', font: { bold: true } }); ws.mergeCells(r, 1, r, 8); xCell(ws, r, 9, { formula: `SUM(I${start}:I${r - 1})` }, { fmt: '#,##0', font: { bold: true } }); xCell(ws, r, 10, '');
  xNote(ws, r + 2, cols.length, '※ 기존 업체 물품 인수 시 수량·상태를 사진과 함께 기록하고, 인수 금액은 초도 발주에서 차감합니다(구매 기준).');
  return xBlob(wb);
};

PKD.actionPlan = async c => {
  const P0 = [['D-30', '계약 · 조직', '계약 조건·과업 범위 확인(과업지시서·견적 대비)', '지사장'], ['D-28', '현장 조사', '사업장 조사표 작성(면적·구역·동선·화장실 수·장비)', c.head], ['D-25', '인력', `근무형태 확정(${c.shift || '근무조'}) · 인원 편성표 작성`, '지사장'], ['D-21', '채용', '구인 공고 · 기존 근무자 승계 면담', c.head], ['D-18', '서류', '근로계약서·개인정보 동의서·건강진단서 수령', '담당 스텝'], ['D-14', '장비 · 용품', '인수품목 확인·초도 발주(구매요청서)', c.head], ['D-10', '교육', '채용 시 교육(8h) · 직무교육 · MSDS 교육 계획', c.head], ['D-7', '표준 · 매뉴얼', '업무표준서·작업표준(SOP)·현장 근무지침 확정(이 프로그램)', '지사장'], ['D-5', '서식 · 게시물', '업무일지·점검표·경고표지·희석비율표 비치', c.head], ['D-3', '인수인계', '기존 업체와 열쇠·장비·미결 업무 대면 인수인계', c.head], ['D-1', '최종 점검', '근무자 배치·비상연락망·고객사 담당자 인사', '지사장'], ['D-Day', '운영 개시', '근무 시작 TBM · 고객사 보고 · 첫날 순회 점검', c.head], ['D+3', '안정화', '초기 불편사항 수렴·작업 순서 조정', c.head], ['D+7', '1주 점검', '품질 자체평가·고객사 1차 면담', '지사장'], ['D+14', '교육', '현장 작업표준 재교육·장비 사용 실습', c.head], ['D+30', '1개월 보고', '월 주요업무실적 및 계획 보고 · 개선 계획', '지사장']];
  return xRegister(c, '사업장 인수 액션플랜 (D-30 ~ D+30)', [['일정', 9], ['구분', 12], ['세부 실행 내용', 48], ['담당', 12], ['완료일', 10], ['확인', 8]], P0.length, { data: P0, center: [0, 1, 3, 4, 5], land: true, appr: ['담당', c.head, '지사장'], rh: 26, note: '※ 일정은 운영 개시일(D-Day) 기준으로 조정합니다.' });
};

PKD.eduPlan = async c => {
  const rows = EDU_MONTH.map((e, i) => [`${i + 1}월`, '1차', `▒ ${e[0]}\n- ${e[1]}`, '2h', '']);
  const extra = (EDU_JOB[c.job] || []).map((e, i) => [`${[2, 5, 8, 11][i % 4]}월`, '2차', `▒ ${e[0]}\n- ${e[1]}`, '1h', '']);
  const law = [['4월', '2차', '▒ 개인정보 보호교육\n- 개인정보 수집·이용·파기, 영상정보 관리', '1h', ''], ['7월', '2차', '▒ 직장 내 성희롱 예방교육\n- 성희롱의 정의·사례·피해자 보호', '1h', ''], ['9월', '2차', '▒ 장애인 인식개선 교육\n- 장애 유형 이해·응대 예절', '1h', ''], ['10월', '2차', '▒ 퇴직연금 교육\n- 제도·적립금 운용 안내', '1h', '']];
  const all = rows.concat(extra, law).sort((a, b) => parseInt(a[0]) - parseInt(b[0]) || a[1].localeCompare(b[1]));
  return pDoc([{ ch: [pTop(c, '교육계획'), pTitle(`${c.year}년 ${c.J.n} 교육계획`), pAppr([c.head, '지사장']), pSp(),
    pGrid([['구분', 0.7, 'c'], ['차수', 0.6, 'c'], ['교육 내용', 5], ['시간', 0.6, 'c'], ['교육 일정', 1.3]], all, { rh: 520, size: 16 }), pSp(100),
    pGrid([['법정 교육', 1.8], ['근거·기준', 4.6], ['실시', 1.2, 'c']], EDU_LAW, { size: 15 }),
    pFoot('※ 교육 후 교육일지·참석자 명단(서명)을 작성해 3년간 보관합니다(산업안전보건법 시행규칙 제164조).')] }], '교육계획');
};

function eduLogPage(c, title, topic, law, pb) {
  return [pTop(c, '교육일지'), pTitle(title, { pb }), pAppr(['교육자', c.head, '지사장']), pSp(),
    pInfo([['교육 일시', '        년     월     일    :    ~    :'], ['교육 장소', c.site], ['교육 구분', topic], ['교육 시간', '     시간'], ['교 육 자', c.author], ['대상 인원', '     명 (참석     명 · 불참     명)'], ['법적 근거', law]]), pSp(80),
    pGrid([['교육 내용', 1]], [['']], { rh: 2600 }), pSp(80),
    pGrid([['NO', 0.5, 'c'], ['소속', 1.2], ['성명', 1.2], ['서명', 1.1], ['NO', 0.5, 'c'], ['소속', 1.2], ['성명', 1.2], ['서명', 1.1]], Array.from({ length: 14 }, (_, i) => [String(i + 1), '', '', '', String(i + 15), '', '', '']), { rh: 420 }),
    pFoot('※ 불참자는 사유를 적고 추후 보충교육을 실시합니다.')];
}
PKD.eduSafety = async c => {
  const secs = [];
  EDU_MONTH.forEach((e, i) => secs.push({ ch: [pTop(c, `안전보건교육 ${i + 1}월`), pTitle(`${i + 1}월 안전보건교육 자료 — ${e[0]}`, { size: 28, pb: i > 0 }), pBox([`교육 주제: ${e[0]}`, `교육 내용: ${e[1]}`, `대상: ${c.site} ${c.J.n} 근무자 전원 · 시간: 2시간 · 근거: 산업안전보건법 제29조`], 'EEF3FB'), pSp(80),
    pP([pR('■ 꼭 지켜야 할 것', { size: 22, bold: true, color: '17552F' })], { after: 60 }), ...e[2].map((x, k) => pP([pR(`${k + 1}. `, { size: 21, bold: true, color: '0B1F8F' }), pR(x, { size: 21 })], { after: 60, line: 320, indent: { left: 300, hanging: 300 } })),
    pSp(100), pP([pR(`■ 우리 사업장(${c.site || '현장'})에서 특히 주의할 곳`, { size: 22, bold: true, color: '17552F' })], { after: 60 }), pGrid([['장소', 1.5], ['위험요인', 2.5], ['대책', 2.5]], [], { blank: 4, rh: 480 }),
    pSp(100), pP([pR('■ 확인 문제 (교육 후 구두 확인)', { size: 22, bold: true, color: '17552F' })], { after: 60 }), ...e[2].slice(0, 3).map((x, k) => pP(`Q${k + 1}. ${x.replace(/[.다]$/, '')} — 맞으면 O, 틀리면 X  (     )`, { size: 19, after: 40 }))] }));
  secs.push({ ch: eduLogPage(c, '산업안전보건교육 일지', '□ 정기  □ 채용 시  □ 작업내용 변경 시  □ 특별', '산업안전보건법 제29조', true) });
  return pDoc(secs, '산업안전보건교육 자료·일지');
};
PKD.eduHarass = async c => pDoc([{ ch: eduLogPage(c, '직장 내 성희롱 예방교육 일지', '성희롱 예방교육 (연 1회 이상)', '남녀고용평등법 제13조 · 시행령 제3조', false) }, { ch: [pTop(c, '교육 결과'), pTitle('직장 내 성희롱 예방교육 결과 보고'), pAppr([c.head, '지사장']), pSp(), pInfo([['사 업 장', c.site], ['교육 일시', ''], ['교육 방법', '□ 집합  □ 영상  □ 자료 배포(10명 미만·한쪽 성 사업장만)'], ['교육 인원', '대상    명 / 참석    명']]), pSp(80), pGrid([['교육 내용 (법정 4개 항목)', 1]], [['1. 직장 내 성희롱에 관한 법령'], ['2. 사업장의 성희롱 발생 시 처리 절차와 조치 기준'], ['3. 피해 근로자의 고충상담 및 구제 절차'], ['4. 그 밖에 직장 내 성희롱 예방에 필요한 사항']], { rh: 500 }), pSp(80), pGrid([['특이사항 · 건의사항', 1]], [['']], { rh: 1600 })] }], '성희롱 예방교육');
PKD.eduPrivacy = async c => pDoc([{ ch: [pTop(c, '개인정보 보호교육'), pTitle('개인정보 보호교육 확인서'), pAppr([c.head, '지사장']), pSp(), pInfo([['사 업 장', c.site], ['교육 일시', ''], ['교 육 자', c.author], ['법적 근거', '개인정보 보호법 제28조 (개인정보취급자 교육)']]), pSp(80),
  pBox(['■ 교육 내용', '1. 우리 현장에서 다루는 개인정보: 방문객 대장 · CCTV 영상 · 근무자 인사·연락처 · 차량번호', '2. 수집은 필요한 최소한만 — 신분증 번호는 적지 않는다', '3. 열람·반출은 승인된 경우에만, 대장에 기록', '4. 보존 기간이 지나면 즉시 파기(파쇄)', '5. 유출·분실 시 즉시 현장 책임자 → 지사 보고'], 'EEF3FB'), pSp(80),
  pP('본인은 위 개인정보 보호교육을 받았으며, 업무상 알게 된 개인정보를 업무 외 목적으로 이용하거나 제3자에게 제공하지 않을 것을 서약합니다.', { size: 19, line: 320, after: 120 }),
  pGrid([['NO', 0.5, 'c'], ['소속', 1.3], ['성명', 1.3], ['서명', 1.2], ['NO', 0.5, 'c'], ['소속', 1.3], ['성명', 1.3], ['서명', 1.2]], Array.from({ length: 12 }, (_, i) => [String(i + 1), '', '', '', String(i + 13), '', '', '']), { rh: 440 })] }], '개인정보 보호교육');
PKD.eduDisab = async c => pDoc([{ ch: eduLogPage(c, '직장 내 장애인 인식개선 교육일지', '장애인 인식개선 교육 (연 1회 이상)', '장애인고용촉진 및 직업재활법 제5조의2', false) }], '장애인 인식개선 교육');

PKD.dayPlan = async c => {
  const P0 = DAY_PLAN[c.job] || DAY_PLAN.cln, rows = [];
  P0.forEach(([t, ls]) => ls.forEach((l, i) => rows.push([i === 0 ? t : '', l, '', ''])));
  return pDoc([{ ch: [pTop(c, '일일 업무계획'), pTitle(`${c.head} 일일 업무계획표`), pAppr([c.head, '지사장']), pSp(), pInfo([['사 업 장', c.site], ['일 자', '      년    월    일 (   )'], ['작 성 자', c.author], ['근무 인원', `총 ${c.cnt || '   '}명 (출근     명)`]]), pSp(80),
    pGrid([['시 간', 1.2, 'c'], ['세 부 업 무', 4.6], ['실시', 0.6, 'c'], ['비고', 1.4]], rows, { rh: 380, size: 17 }), pSp(80), pGrid([['특이사항 · 지시사항', 1]], [['']], { rh: 1200 })] }], '일일 업무계획표');
};

PKD.yearPlan = async c => {
  const P0 = periodicTasks(c.job), L = true;
  const rows = P0.map(x => { const m = monthsOf(x.t.f); return [x.t.n.replace(/\s*\(.*\)$/, ''), x.a, '자체', x.t.f].concat(Array.from({ length: 12 }, (_, i) => m.includes(i + 1) ? '●' : ''), ['']); });
  const cols = [['작업 형태', 2.1], ['작업 구역', 1.5], ['운영사', 0.6, 'c'], ['작업 주기', 1.6]].concat(Array.from({ length: 12 }, (_, i) => [`${i + 1}월`, 0.38, 'c']), [['비고', 0.8]]);
  return pDoc([{ land: L, ch: [pTop(Object.assign({}, c, { W: PWL }), '연간 계획'), pTitle(`${c.year}년 ${c.J.n} 정기 작업 계획`), pAppr([c.head, '지사장']), pSp(),
    pGrid(cols, rows, { W: PWL, blank: Math.max(14, rows.length + 3), rh: 380, size: 16 }),
    pFoot('● 계획 월 · 실시하면 ◎로 표시 · 고객사 행사·휴무에 맞춰 월을 조정하고 월간 계획(보고용)에 옮깁니다.')] }], '연간 정기 작업 계획');
};
PKD.dailyPlan = async c => {
  const D0 = dailyTasks(c.job).slice(0, 30);
  return pDoc([{ ch: [pTop(c, '일상 계획'), pTitle(`${c.J.n} 일상 작업 계획`), pAppr([c.head, '지사장']), pSp(),
    pGrid([['작업 구역', 1.5], ['작업 내용', 2.6], ['작업 횟수', 1.6], ['오전\n(  :  ~  :  )', 1, 'c'], ['오후\n(  :  ~  :  )', 1, 'c'], ['관리 방법·담당', 1.4]], D0.map(x => [x.a, x.t.n, x.t.f, '', '', x.t.who || '']), { blank: Math.max(18, D0.length), rh: 360, size: 15 })] }], '일상 작업 계획');
};
PKD.monthReport = async c => pDoc([{ land: true, ch: [pTop(Object.assign({}, c, { W: PWL }), '월간 계획'), pTitle('(     )월 작업 계획서 (보고용)'), pAppr([c.head, '지사장']), pSp(),
  pGrid([['구 분', 1.6]].concat(Array.from({ length: 31 }, (_, i) => [String(i + 1), 0.3, 'c'])), [['1주차'], ['2주차'], ['3주차'], ['4주차'], ['5주차'], ['정기 작업'], ['특수 작업'], ['교육'], ['기타']], { W: PWL, rh: 520, size: 14, boldFirst: true }),
  pFoot('※ 연간 계획의 해당 월 작업을 날짜 칸에 적고, 실시하면 ○ 표시 · 매월 말 다음 달 계획을 지사에 보고합니다.')] }], '월간 계획(보고용)');
PKD.monthPost = async c => pDoc([{ land: true, ch: [pTop(Object.assign({}, c, { W: PWL }), '월간 계획(게시)'), pTitle(`(     )월 ${c.J.n} 작업 계획`, { size: 40 }),
  pGrid([['구 분', 1], ['월', 1.6], ['화', 1.6], ['수', 1.6], ['목', 1.6], ['금', 1.6], ['토', 1.6], ['일', 1.6]], [['1주차'], ['2주차'], ['3주차'], ['4주차'], ['5주차']], { W: PWL, rh: 1500, size: 18, boldFirst: true }),
  pFoot(`※ 게시판 부착용 — ${c.site} 고객 여러분의 협조를 부탁드립니다. 작업 중에는 안전표지판을 설치합니다.`)] }], '월간 계획(게시용)');
PKD.weekFocus = async c => {
  const W0 = WEEK_FOCUS[c.job] || WEEK_FOCUS.cln;
  return pDoc([{ ch: [pTop(c, '요일별 중점'), pTitle(`요일별 중점 ${c.job === 'cln' ? '청소' : '점검'} 현황표`), pAppr([c.head, '지사장']), pSp(),
    pGrid([['요일', 0.6, 'c'], ['중점 작업 · 구역', 3.6], ['담당', 1], ['완료 시각', 0.9, 'c'], ['확인', 0.7, 'c']], W0.map(x => [x[0], x[1], '', '', '']), { rh: 760, size: 18, boldFirst: true }), pSp(80),
    pBox(['※ 일상 작업은 매일 하고, 위 중점 작업을 요일마다 추가로 합니다.', '※ 비·눈·행사 등으로 못 한 작업은 다음 날 우선 실시하고 일지에 적습니다.'])] }], '요일별 중점 현황표');
};

PKD.diary = async c => {
  const page = (ex) => [pTop(c, '업무일지'), pTitle(ex ? '업 무 일 지 (작성 예시)' : '업 무 일 지', { pb: ex }), pAppr([c.head, '지사장']), pSp(),
    pInfo([['작성 일자', ex ? `${c.date} (월)` : '      .    .    . (   )'], ['소속 지사', c.org], ['사 업 장', c.site], ['작 성 자', ex ? c.author || '홍길동' : '']]), pSp(80),
    pP([pR('1. 업무 실적', { size: 20, bold: true, color: '0B1F8F' })], { after: 40 }),
    pGrid([['구 분', 1, 'c'], ['내 용', 5]], [['주요 업무', ex ? exampleDiary(c).work : ''], ['계약선 요청\n처리 결과', ex ? exampleDiary(c).req : '']], { rh: 1400, boldFirst: true, size: 16 }), pSp(60),
    pP([pR('2. 익일 예정 사항', { size: 20, bold: true, color: '0B1F8F' })], { after: 40 }), pGrid([['내 용', 1]], [[ex ? exampleDiary(c).next : '']], { rh: 1000, size: 16 }), pSp(60),
    pP([pR('3. 특이사항 및 고객 컴플레인 · 처리 결과', { size: 20, bold: true, color: '0B1F8F' })], { after: 40 }), pGrid([['내 용', 1]], [[ex ? exampleDiary(c).cmp : '']], { rh: 1000, size: 16 }), pSp(60),
    pP([pR('4. 인원 현황  [단위: 명]', { size: 20, bold: true, color: '0B1F8F' })], { after: 40 }),
    pGrid([['구분', 0.8, 'c'], ['총원\n주간', 0.8, 'c'], ['총원\n야간', 0.8, 'c'], ['총원\n계', 0.8, 'c'], ['현재원\n주간', 0.8, 'c'], ['현재원\n야간', 0.8, 'c'], ['현재원\n계', 0.8, 'c'], ['차이', 0.7, 'c'], ['비고(사유)', 2]], ex ? [['남', '', '', String(c.m || ''), '', '', String(c.m || ''), '0', ''], ['여', '', '', String(c.w || ''), '', '', String(c.w || ''), '0', ''], ['계', '', '', String(c.total || ''), '', '', String(c.total || ''), '0', '']] : [['남'], ['여'], ['계']], { rh: 380, boldFirst: true })];
  return pDoc([{ ch: page(false) }, { ch: page(true) }], '업무일지');
};
function exampleDiary(c) {
  const E = {
    cln: { work: '1. 1층 로비 바닥 기계 세정 및 물기 제거\n2. 화장실 3회 순회 청소(07:30 · 12:30 · 15:30) · 소모품 보충\n3. 계단 난간·벽 먼지 제거(요일별 중점)\n4. 외곽 흡연장·화단 청소 및 분리수거', req: '1. 3층 회의실 커피 쏟음 청소 요청(10:20) — 담당 근무자 투입, 얼룩 제거 완료(10:35)\n2. 2층 남자화장실 악취 민원(14:05) — 배수구 청소·소독 완료(14:30), 시설 담당 통보', next: '1. 2층 사무실 유리·창틀 청소\n2. 주차장 램프 물세척(월간 계획)\n3. 약품 재고 조사·구매요청서 작성(20일)', cmp: '1. 1층 여자화장실 물비누 작동 안 됨(13:20) — 건전지 교체 후 작동 확인(13:35)\n2. 로비 자동문 센서 오작동 — 시설 담당 A/S 요청(15:10)' },
    sec: { work: '1. 정문 출입 통제 — 방문객 34명 · 차량 52대 · 물품 반출 3건 확인\n2. 정기 순찰 6회(2시간 간격) — 이상 없음\n3. CCTV 녹화 상태 점검 — 전 채널 정상', req: '1. 총무팀 택배 보관 요청(11:00) — 택배 7건 접수·인계 완료(16:40)\n2. 야간 공사 출입 협조 요청 — 출입자 명단 수령, 작업허가 확인 후 입장', next: '1. 주말 행사 차량 통제 계획 확인\n2. 열쇠 전수 확인(목요일 중점)', cmp: '1. B동 비상구 적치물 발견(14:20) — 사진 촬영·총무팀 통보, 15:00 이동 완료' }
  };
  return E[c.job] || { work: `1. ${c.J.n} 일상 업무 실시\n2. 정기 점검 실시`, req: '1. 고객사 요청 — 처리 결과 기록', next: '1. 익일 작업 계획', cmp: '1. 특이사항 없음' };
}

PKD.monthly = async c => {
  const page = ex => [pTop(c, '월 실적·계획'), pTitle(ex ? '(  )월 주요 업무실적 및 계획 (작성 예시)' : '(     )월 주요 업무실적 및 계획', { pb: ex }), pAppr([c.head, '지사장']), pSp(),
    pInfo([['작성 일자', ''], ['소속 지사', c.org], ['사 업 장', c.site], ['작 성 자', c.author]]), pSp(80),
    pP([pR('1. 당월 주요 업무', { size: 20, bold: true, color: '0B1F8F' })], { after: 40 }),
    pGrid([['구분', 0.9, 'c'], ['계획', 3], ['결과 · 실적', 3]], [['정기 업무', ex ? '1. 1·2층 사무실 바닥 왁스작업\n2. 샤워장 세정작업' : '', ex ? '1. 1층 완료(2층 차월 예정)\n2. 고압세척·전용세제로 완료' : ''], ['교육', ex ? '1. 산업안전보건교육\n2. 장비교육' : '', ex ? '1. 넘어짐 재해예방 교육(2h)\n2. 세정기 사용법 실습' : ''], ['기타', '', '']], { rh: 900, boldFirst: true, size: 16 }), pSp(60),
    pP([pR('2. 자체 품질평가 결과', { size: 20, bold: true, color: '0B1F8F' })], { after: 40 }),
    c.job === 'cln' ? pGrid([['구분', 1, 'c'], ['로비', 0.8, 'c'], ['화장실', 0.8, 'c'], ['사무실', 0.8, 'c'], ['회의실', 0.8, 'c'], ['주차장', 0.8, 'c'], ['비상계단', 0.8, 'c'], ['복도', 0.8, 'c'], ['외곽', 0.8, 'c'], ['평균', 0.8, 'c']], [['점수'], ['주요 문제점\n개선 방안']], { rh: 700, boldFirst: true })
      : pGrid([['구분', 1, 'c'], ['점수', 1, 'c'], ['주요 문제점 · 개선 방안', 5]], [['일반관리'], ['위험관리'], ['품질관리'], ['종합']], { rh: 520, boldFirst: true }), pSp(60),
    pP([pR('3. 차월 계획', { size: 20, bold: true, color: '0B1F8F' })], { after: 40 }),
    pGrid([['구분', 0.9, 'c'], ['주요 업무', 6]], [['정기 업무'], ['교육'], ['기타']], { rh: 700, boldFirst: true }), pSp(60),
    pP([pR('4. 주요 작업 및 업무개선 실적 (사진)', { size: 20, bold: true, color: '0B1F8F' })], { after: 40 }),
    pGrid([['일자 · 장소', 1.2], ['작업 전', 2.5, 'c'], ['작업 후', 2.5, 'c']], [['', '(사진)', '(사진)'], ['', '(사진)', '(사진)']], { rh: 2000 })];
  return pDoc([{ ch: page(false) }, { ch: page(true) }], '월 주요 업무실적 및 계획');
};

PKD.accident = async c => pDoc([{ ch: [pTop(c, '사건사고'), pTitle('사 건 · 사 고  보 고 서'), pAppr(['보고자', c.head, '지사장']), pSp(),
  pInfo([['사 업 장', c.site], ['소속 지사', c.org], ['보고 일시', ''], ['보 고 자', ''], ['사고 구분', '□ 산업재해 □ 안전사고 □ 시설물 □ 도난·분실 □ 고객 불만 □ 기타'], ['피 해 자', '성명:          (□ 근무자 □ 고객사 □ 방문객)']]), pSp(80),
  pGrid([['6하원칙', 1.1, 'c'], ['내 용', 5]], [['언제', ''], ['어디서', ''], ['누가', ''], ['무엇을', ''], ['어떻게', ''], ['왜', '']], { rh: 520, boldFirst: true }), pSp(60),
  pGrid([['조치 사항 (시각 · 조치 · 담당)', 1]], [['']], { rh: 1300 }), pSp(60), pGrid([['원인 분석 · 재발 방지 대책', 1]], [['']], { rh: 1300 }), pSp(60),
  pGrid([['첨부', 1, 'c'], ['□ 현장 사진  □ 진단서  □ 경위서  □ CCTV 확인 기록  □ 기타', 5]], []),
  pFoot('※ 중대재해(사망 등)는 지체 없이 관할 지방고용노동관서에 보고합니다(산업안전보건법 제54조). 산업재해로 3일 이상 휴업 시 1개월 이내 산업재해조사표 제출(시행규칙 제73조).')] }], '사건사고 보고서');

PKD.quality = async c => {
  const wb = xBook();
  const sheets = c.job === 'cln' ? QUALITY.filter(q => !(c.type === '병원' ? /일반,빌딩/ : /병원/).test(q.t)).map(q => ({ t: q.t, items: q.items })) : qualityFromSop(c);
  sheets.forEach((q, si) => {
    const cols = [['No.', 5], ['구 분', 12], ['점검항목', 14], ['세부항목', 14], ['점검사항', 44], ['배점', 7], ['적합', 7], ['부적합', 7], ['부적합 사유', 18]];
    const ws = xSheet(wb, `${si + 1}. ${q.t}`.replace(/[\\/*?:[\]]/g, '·'), c, cols.map(x => x[1]), { land: true, id: '품질평가' });
    let r = xTitle(ws, cols.length, `${q.t} 품질평가 체크리스트`, c, { appr: ['평가자', c.head, '지사장'], info: [['사업장', c.site], ['평가 일자', ''], ['평가자', ''], ['직종', c.J.n]] });
    r = xHead(ws, r, cols.map(x => x[0])); const s0 = r;
    q.items.forEach((it, i) => { [i + 1, it[0], it[1], it[2], it[3], it[4], '', '', ''].forEach((v, k) => xCell(ws, r, k + 1, v, { al: { horizontal: [0, 5, 6, 7].includes(k) ? 'center' : 'left' }, fmt: k === 5 ? '0.00' : undefined })); ws.getRow(r).height = 30; r++; });
    xMerge(ws, r, 1, r, 5, '합   계', { fill: 'EEF1F5', font: { bold: true }, al: { horizontal: 'center' } });
    xCell(ws, r, 6, { formula: `SUM(F${s0}:F${r - 1})` }, { fmt: '0.0', font: { bold: true } }); xCell(ws, r, 7, { formula: `SUMIF(G${s0}:G${r - 1},"O",F${s0}:F${r - 1})` }, { fmt: '0.0', font: { bold: true, color: { argb: 'FF1E8B3A' } } }); xCell(ws, r, 8, { formula: `SUMIF(H${s0}:H${r - 1},"O",F${s0}:F${r - 1})` }, { fmt: '0.0', font: { bold: true, color: { argb: 'FFC62828' } } }); xCell(ws, r, 9, '');
    xNote(ws, r + 2, cols.length, '※ 적합·부적합 칸에 「O」를 입력하면 합계가 자동 계산됩니다. 부적합은 사유와 개선 기한을 적고 월 주요업무실적에 반영합니다.');
  });
  return xBlob(wb);
};
function qualityFromSop(c) {
  const A = SOP[c.job] ? SOP[c.job].areas : [], items = [];
  A.forEach(a => a.tasks.forEach(t => (t.q || []).forEach(q => items.push([a.n, t.n, t.f, q]))));
  const gen = [['운영 관리', '업무표준·매뉴얼', '비치', '업무표준서·작업표준(SOP)·현장 근무지침 비치 및 근무자 숙지'], ['운영 관리', '서류', '일지', '업무일지·인수인계 대장 누락 없이 작성·결재'], ['운영 관리', '교육', '법정교육', '산업안전보건교육 월 2시간 실시·일지·서명'], ['운영 관리', '근태', '배치', '근무 편성표대로 배치, 공백 시간 없음'], ['위험 관리', '보호구', '착용', '지급 보호구 착용 상태'], ['위험 관리', 'TBM', '실시', '근무 시작 TBM 실시 기록'], ['위험 관리', '비상', '연락망', '비상연락망 게시·최신화']];
  const w1 = 25 / gen.length, w2 = items.length ? 75 / items.length : 0;
  return [{ t: '일반·위험관리부문(공통)', items: gen.map(g => [g[0], g[1], g[2], g[3], +w1.toFixed(4)]) }, { t: `품질관리부문(${c.J.n})`, items: items.map(i => [i[0], i[1], i[2], i[3], +w2.toFixed(4)]) }];
}

PKD.purchase = async c => {
  const wb = xBook(), cols = [['NO', 5], ['코드번호', 9], ['품 명', 34], ['제조사', 13], ['단위', 6], ['전월청구', 8], ['재 고', 8], ['당월청구', 8], ['비 고', 12]];
  const ws = xSheet(wb, '구매요청서', c, cols.map(x => x[1]), { id: '구매요청' });
  let r = xTitle(ws, cols.length, `20   년 (   )월 ${PJ(c)}용품 · 소모품 구매 요청서`, c, { info: [['관리사', c.org], ['관리자', c.author], ['사업장', c.site], ['전화번호', ''], ['주소', c.addr], ['요청일', '']] });
  r = xHead(ws, r, cols.map(x => x[0])); const s0 = r;
  r = xRows(ws, r, 40, [], { cols: cols.length, no: true, center: [0, 1, 4, 5, 6, 7] });
  for (let i = s0; i < r; i++) { ws.getCell(i, 3).value = { formula: `IFERROR(VLOOKUP(B${i},코드번호!$A:$D,2,FALSE),"")` }; ws.getCell(i, 4).value = { formula: `IFERROR(VLOOKUP(B${i},코드번호!$A:$D,3,FALSE),"")` }; ws.getCell(i, 5).value = { formula: `IFERROR(VLOOKUP(B${i},코드번호!$A:$D,4,FALSE),"")` }; }
  xNote(ws, r + 1, cols.length, '※ 코드번호를 입력하면 품명·제조사·단위가 자동으로 들어갑니다(「코드번호」 시트). 정기구매는 매월 20일, 소모품은 월 평균 사용량의 10~20% 재고를 확보합니다.');
  const cs = xSheet(wb, '코드번호', c, [10, 46, 18, 8], { id: '코드' }); let k = xHead(cs, 1, ['코드번호', '품 명', '제조사', '단위']);
  (c.job === 'cln' ? CODES : toolsOf(c.job).map((t, i) => [String(5001 + i), t, '', 'EA'])).forEach(x => { x.forEach((v, j) => xCell(cs, k, j + 1, v, { al: { horizontal: j === 1 ? 'left' : 'center' } })); k++; });
  return xBlob(wb);
};
function inOutDoc(kind, what) {
  return async c => { const cols = kind === '입고' ? [['NO', 5], ['입고일자', 11], ['입고 품명', 32], ['수 량', 8], ['확인자 서명', 12], ['비 고', 14]] : [['NO', 5], ['출고일자', 11], ['출고 품명', 28], ['수 량', 8], ['담당구역', 12], ['근무자', 10], ['비 고', 12]];
    return xRegister(c, `(     )월 ${what} ${kind}대장`, cols, 60, { info: [['현장명', c.site], ['담당', c.author]], note: '※ 창고 비치 — 입·출고 즉시 기록, 매월 말 재고종합현황에 합계 이관' }); };
}
PKD.inUse = inOutDoc('입고', '미화용품'); PKD.outUse = inOutDoc('출고', '미화용품'); PKD.inChem = inOutDoc('입고', '미화약품'); PKD.outChem = inOutDoc('출고', '미화약품');
PKD.stock = async c => {
  const wb = xBook(), base = [['NO', 5], ['품   명', 26], ['규 격', 12], ['단 위', 6], ['전월재고', 8], ['당월입고', 8], ['당월출고', 8], ['당월재고', 8], ['비 고', 10]];
  const days = []; for (let d = 1; d <= 31; d++) days.push([`${d}일\n입`, 4.2], [`${d}일\n출`, 4.2]);
  const cols = base.concat(days), ws = xSheet(wb, '월입출현황', c, cols.map(x => x[1]), { land: true, id: '재고종합' });
  let r = xTitle(ws, base.length, `20   년 (   )월 ${PJ(c)}용품 · 약품 재고종합현황`, c, { info: [['현장명', c.site], ['작성자', c.author]] });
  r = xHead(ws, r, cols.map(x => x[0]), { h: 30 }); const s0 = r;
  const items = (c.job === 'cln' ? CODES.slice(0, 60).map(x => [x[1], x[2], x[3]]) : toolsOf(c.job).map(t => [t, '', 'EA']));
  for (let i = 0; i < Math.max(60, items.length); i++, r++) {
    const it = items[i] || ['', '', ''];
    [i + 1, it[0], it[1], it[2], 0].forEach((v, k) => xCell(ws, r, k + 1, v, { al: { horizontal: k === 1 ? 'left' : 'center' } }));
    const L = n => ws.getColumn(n).letter, inC = [], outC = []; for (let d = 0; d < 31; d++) { inC.push(L(10 + d * 2) + r); outC.push(L(11 + d * 2) + r); }
    xCell(ws, r, 6, { formula: `SUM(${inC.join(',')})` }, { al: { horizontal: 'center' } }); xCell(ws, r, 7, { formula: `SUM(${outC.join(',')})` }, { al: { horizontal: 'center' } });
    xCell(ws, r, 8, { formula: `E${r}+F${r}-G${r}` }, { al: { horizontal: 'center' }, font: { bold: true } }); xCell(ws, r, 9, '');
    for (let k = 10; k <= cols.length; k++) xCell(ws, r, k, '', { al: { horizontal: 'center' } });
  }
  ws.views = [{ state: 'frozen', xSplit: 2, ySplit: s0 - 1 }];
  xNote(ws, r + 1, base.length, '※ 오른쪽 날짜 칸에 입·출고 수량을 입력하면 당월입고·출고·재고가 자동 계산됩니다. 다음 달 전월재고 = 이번 달 당월재고.');
  return xBlob(wb);
};
PKD.spec = async c => xRegister(c, '에스텍 미화용품 · 소모품 · 약품 규격서', [['코드', 9], ['품 명', 46], ['제조사', 18], ['단위', 8], ['분류', 12]], 0,
  { appr: false, info: [['기준', '에스텍 미화 표준 규격(2020.01)'], ['사업장', c.site]], data: CODES.map(x => [x[0], x[1], x[2], x[3], ({ '11': '위생 소모품', '21': '청소 용품', '22': '청소 도구', '31': '약품', '40': '장비·기타' })[x[0].slice(0, 2)] || '']), center: [0, 3, 4], note: '※ 규격서 내 품목만 구매 요청합니다. 사업장 여건상 다른 품목이 계속 필요하면 지사에 요청합니다.' });
PKD.chem = async c => {
  const wb = xBook(), cols = [['구분', 5], ['제조업체', 14], ['제품명', 18], ['사용용도', 14], ['pH', 8], ['물질명', 30], ['CAS 번호', 13], ['함유량(%)', 9], ['특수검진', 8], ['작업측정', 8], ['비고', 10]];
  const ws = xSheet(wb, '약품별 성분 현황', c, cols.map(x => x[1]), { land: true, id: '약품 성분' });
  let r = xTitle(ws, cols.length, '미화 약품별 성분 현황', c, { appr: false }); r = xHead(ws, r, cols.map(x => x[0]));
  CHEM.forEach((ch, i) => { const n = Math.max(1, ch.sub.length), r0 = r;
    for (let k = 0; k < n; k++) { const s = ch.sub[k] || ['', '', '', '', '']; [k ? '' : i + 1, k ? '' : ch.mk, k ? '' : ch.n, k ? '' : ch.use, k ? '' : ch.ph, s[0], s[1], s[2], s[3], s[4], k ? '' : ch.note].forEach((v, j) => xCell(ws, r, j + 1, v, { al: { horizontal: [0, 4, 6, 7, 8, 9].includes(j) ? 'center' : 'left' } })); r++; }
    if (n > 1) [1, 2, 3, 4, 5, 11].forEach(j => ws.mergeCells(r0, j, r - 1, j)); });
  xNote(ws, r + 1, cols.length, '※ 「특수검진·작업측정」에 O 표시된 물질은 특수건강진단·작업환경측정 대상인지 사용량·작업 형태와 함께 검토합니다(산업안전보건법 제125조·제130조).');
  return xBlob(wb);
};
PKD.hazmat = async c => {
  const used = new Set(); CHEM.forEach(ch => ch.sub.forEach(s => { if (s[1] && s[1] !== '-') used.add(s[1].trim()); }));
  const rows = HAZMAT.filter(h => /\d/.test(h[2])).map((h, i) => [i + 1, h[0], h[1], h[2], h[3] ? '○' : '', h[4] ? '○' : '', used.has(h[2].trim()) ? '사용 약품에 포함' : '']);
  return xRegister(c, '특수건강진단 · 작업환경측정 대상 유해물질 목록', [['구분', 6], ['유해물질명', 30], ['영문명', 32], ['CAS No.', 13], ['특검 대상', 8], ['측정 대상', 8], ['우리 현장 사용', 14]], 0,
    { appr: false, data: rows, center: [0, 3, 4, 5], land: true, info: [['사업장', c.site], ['기준', '산업안전보건법 시행규칙 별표21·별표22']], note: '※ 「우리 현장 사용」 표시 물질은 사용 약품의 MSDS와 대조해 대상 여부를 확인합니다.' });
};
PKD.nametag = async c => {
  const items = CODES.filter(x => /^(21|22|31)/.test(x[0])).slice(0, 48), W2 = PW / 3, rows = [];
  for (let i = 0; i < items.length; i += 3) rows.push([0, 1, 2].map(k => { const it = items[i + k]; return new docx.TableCell({ width: { size: W2, type: docx.WidthType.DXA }, borders: bAll('1E8B3A', 12), margins: { top: 120, bottom: 120, left: 120, right: 120 }, verticalAlign: docx.VerticalAlign.CENTER,
    children: it ? [pP([pR(it[1].replace(/\s*\d+.*$/, '') || it[1], { size: 26, bold: true, color: '0B1F8F' })], { align: AC_(), after: 40 }), pP([pR(it[1], { size: 15, color: '4B5563' })], { align: AC_(), after: 20 }), pP([pR(`코드 ${it[0]} · ${it[3]} · 적정 재고 ____`, { size: 15, color: '1E8B3A', bold: true })], { align: AC_(), after: 0 })] : [pP('')] }); }));
  return pDoc([{ ch: [pTop(c, '네임텍'), pTitle(`${PJ(c)}창고 용품별 네임텍`, { size: 28 }), pP('선반 앞면에 잘라서 부착 — 품명이 바뀌면 다시 출력합니다.', { size: 16, align: AC_(), after: 100 }), pT(rows.map(r => r), [W2, W2, PW - 2 * W2], { h: 1300 })] }], '네임텍');
};
PKD.equipCard = async c => {
  const wb = xBook(), list = c.job === 'cln' ? EQUIP : toolsOf(c.job).slice(0, 8).map(t => ({ n: t, m: '', spec: '', use: '', note: '' }));
  list.slice(0, 10).forEach((e, i) => {
    const ws = xSheet(wb, `${i + 1}. ${e.n}`.replace(/[\\/*?:[\]]/g, '·'), c, [16, 26, 16, 26], { id: '장비이력' });
    xMerge(ws, 1, 1, 2, 4, '장 비 이 력 카 드', { font: { size: 18, bold: true, color: { argb: 'FF0B1F8F' } }, al: { horizontal: 'center' }, b: false });
    let r = 4; xMerge(ws, r, 1, r, 4, '1. 주요 제원', { b: false, font: { bold: true, size: 11 } }); r++;
    [['현장명', c.site, '장비번호', `${c.site}-${c.year}-${pad(i + 1)}`], ['장비명/모델명', `${e.n}${e.m ? ' / ' + e.m : ''}`, '제작회사', ''], ['규격/용량', e.spec, '구입업체', ''], ['용 도', e.use, '구입(인수)단가', ''], ['관리구분', c.J.n, '구입(인수)일자', ''], ['특이사항', e.note, '관리 책임자', c.head]].forEach(row => { row.forEach((v, k) => xCell(ws, r, k + 1, v, k % 2 === 0 ? { fill: 'EEF1F5', font: { bold: true, size: 9.5 }, al: { horizontal: 'center' } } : {})); ws.getRow(r).height = 30; r++; });
    r++; xMerge(ws, r, 1, r, 4, '2. 장비 사진', { b: false, font: { bold: true, size: 11 } }); r++; xMerge(ws, r, 1, r + 7, 4, '(사진 붙이기)', { al: { horizontal: 'center' }, font: { color: { argb: 'FF9AA3B2' } } }); r += 9;
    xMerge(ws, r, 1, r, 4, '3. 관리(수리) 이력', { b: false, font: { bold: true, size: 11 } }); r++;
    xHead(ws, r, ['일자', '내용(점검·수리·부품 교체)', '비용(원)', '처리자 / 확인']); r++;
    for (let k = 0; k < 14; k++, r++) [1, 2, 3, 4].forEach(j => xCell(ws, r, j, ''));
  });
  return xBlob(wb);
};
PKD.toiletCheck = async c => {
  const items = ['바닥 청결·물기', '대변기 청결', '소변기 청결·요석', '세면대·거울', '휴지 보충', '핸드타올 보충', '물비누 보충', '휴지통 비움', '냄새', '환기·조명', '파손·고장'];
  const times = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const cols = [['점검 항목', 16]].concat(times.map(t => [t, 6.5]));
  const wb = xBook(), ws = xSheet(wb, '화장실 점검표', c, cols.map(x => x[1]), { land: true, id: '화장실 점검' });
  let r = xTitle(ws, cols.length, '화 장 실  점 검 표', c, { appr: false, info: [['사업장', c.site], ['위치', '     층  □남 □여'], ['일자', '      .    .    .'], ['관리 책임자', c.head]] });
  r = xHead(ws, r, cols.map(x => x[0]));
  items.forEach(it => { xCell(ws, r, 1, it, { fill: 'F4F6FA', font: { bold: true } }); for (let k = 2; k <= cols.length; k++) xCell(ws, r, k, '', { al: { horizontal: 'center' } }); ws.getRow(r).height = 24; r++; });
  ['점검자 서명', '관리자 확인'].forEach(t => { xCell(ws, r, 1, t, { fill: 'EEF1F5', font: { bold: true } }); for (let k = 2; k <= cols.length; k++) xCell(ws, r, k, ''); ws.getRow(r).height = 30; r++; });
  xNote(ws, r + 1, cols.length, '※ ○ 양호 · △ 조치함 · × 이상(보고) — 화장실 출입문 안쪽에 부착하고 매일 교체합니다. 이상 사항은 업무일지에 기록합니다.');
  return xBlob(wb);
};
PKD.support = async c => xRegister(c, `${c.J.n} 업무 지원 요청서`, [['NO', 5], ['요청 일자', 11], ['구분', 14], ['요청 내용', 40], ['희망 일정', 12], ['처리 결과', 18]], 12,
  { appr: ['요청자', c.head, '지사장'], info: [['사업장', c.site], ['요청자', c.author], ['구분 예시', '교육 · 점검 · 장비 지원 · 인력 지원 · 특수작업 · 기타'], ['연락처', '']], rh: 34, land: true });
PKD.dilute = async c => pDoc([{ land: true, ch: [pTop(Object.assign({}, c, { W: PWL }), '약품 희석비율'), pTitle('청소약품별 용도 및 희석비율 (게시용)', { size: 32 }),
  pGrid([['구분', 0.8, 'c'], ['약품명', 1.4], ['제품명', 1.5], ['용도', 3.2], ['희석비율', 2.6], ['pH', 1.3, 'c']], CHEM_DIL.map(x => [x.g, x.n, x.p, x.use, x.dil, x.ph]), { W: PWL, rh: 520, size: 17 }), pSp(80),
  pT([[new docx.TableCell({ width: { size: PWL, type: docx.WidthType.DXA }, shading: { fill: 'FDF1EF', type: docx.ShadingType.CLEAR, color: 'auto' }, borders: bAll('C62828', 8), margins: { top: 80, bottom: 80, left: 160, right: 160 }, children: PH_RULE.map(x => pP([pR('⚠ ' + x, { size: 18, bold: /혼합/.test(x), color: /혼합/.test(x) ? 'C62828' : '1C2333' })], { after: 20 })) })]], [PWL])] }], '약품 희석비율');
PKD.msds = async c => {
  const G = {}; for (let i = 1; i <= 9; i++) { const k = String(i).padStart(2, '0'); try { G[k] = ASSET['ghs' + k] || null; } catch (e) { } }
  const secs = MSDS_LBL.map((m, i) => {
    const pics = m.g.map(g => G[g] ? new docx.ImageRun({ type: 'png', data: b64ToU8(dataUrlB64(G[g])), transformation: { width: 92, height: 92 } }) : pR(`[GHS${g}]`, { size: 20, bold: true, color: 'C62828' }));
    return { ch: [pTop(c, `경고표지 ${i + 1}/${MSDS_LBL.length}`), pP([pR(m.n, { size: 44, bold: true, color: '0B1F8F' })], { align: AC_(), after: 40, pb: i > 0 }), pP([pR(`제품명: ${m.p}`, { size: 26, bold: true })], { align: AC_(), after: 120 }),
      new docx.Paragraph({ alignment: AC_(), spacing: { after: 120 }, children: pics.flatMap((x, k) => k ? [new docx.TextRun({ text: '     ' }), x] : [x]) }),
      pP([pR('신호어:  ', { size: 30, bold: true }), pR(m.sig, { size: 40, bold: true, color: m.sig === '위험' ? 'C62828' : 'D97706' })], { align: AC_(), after: 160 }),
      pGrid([['유해 · 위험 문구', 1]], m.h.map(h => [h]), { rh: 460, size: 20 }), pSp(60),
      pGrid([['예방 조치 문구', 1]], MSDS_P.map(x => [x]).concat(m.x ? [[`⚠ ${m.x}`]] : []), { rh: 420, size: 18 }), pSp(60),
      pGrid([['희석비율 · 용도', 1]], [[(CHEM_DIL.find(d => d.p === m.p) || {}).dil || ''], [(CHEM_DIL.find(d => d.p === m.p) || {}).use || '']], { rh: 420, size: 18 }),
      pFoot(`공급자 정보·상세 내용은 제품 MSDS(물질안전보건자료)를 확인하십시오 · 사업장: ${c.site} · 산업안전보건법 제115조(경고표시)`)] };
  });
  return pDoc(secs, '약품 MSDS 경고표지');
};
PKD.heavy = async c => {
  const T = [['5kg 미만', '한 손으로 들 수 있으나 반복 시 손목 부담', '초록', '1E8B3A'], ['5 ~ 10kg', '양손 · 몸 가까이 · 무릎 굽혀 들기', '파랑', '1F4E9C'], ['10 ~ 20kg', '대차·카트 우선 사용, 계단 운반 금지', '노랑', 'D97706'], ['20kg 이상', '2인 1조 또는 운반 장비 필수 — 혼자 들기 금지', '빨강', 'C62828']];
  return pDoc([{ ch: [pTop(c, '게시물'), pP([pR('⚠ 중량물 취급 주의', { size: 56, bold: true, color: 'C62828' })], { align: AC_(), after: 200 }),
    pT(T.map(t => [pC(t[0], 2400, { fill: t[3], size: 30, bold: true, color: 'FFFFFF', align: AC_() }), pC(t[1], PW - 2400, { size: 24, bold: true })]), [2400, PW - 2400], { h: 1300 }), pSp(160),
    pBox(['■ 올바른 들기 자세', '1. 물건 가까이 서서 발을 어깨 너비로 벌린다', '2. 허리를 펴고 무릎을 굽혀 앉는다', '3. 물건을 몸에 붙여 다리 힘으로 천천히 일어선다', '4. 들고 있는 채로 허리를 비틀지 않는다 — 발을 옮겨 방향을 바꾼다', '■ 근거: 산업안전보건기준에 관한 규칙 제663~666조(중량물을 들어올리는 작업)'], 'FFF8E6'),
    pFoot(`${c.site} · 창고·작업장 출입구 부착용`)] }], '중량물 취급 주의');
};
PKD.colorCode = async c => pDoc([{ ch: [pTop(c, '색상 구분'), pTitle('마포 · 걸레 · 소분용기 색상 구분표', { size: 32 }), pP('구역마다 정해진 색만 씁니다 — 화장실 변기 걸레가 다른 곳에 쓰이면 교차오염이 생깁니다.', { size: 19, align: AC_(), after: 160 }),
  pT(COLOR_CODE.map(x => [pC('', 1400, { fill: x[1] }), pC(x[0], 1400, { size: 26, bold: true, align: AC_() }), pC(x[2], 4000, { size: 22, bold: true }), pC(x[3], PW - 6800, { size: 18 })]), [1400, 1400, 4000, PW - 6800], { h: 1000 }), pSp(160),
  pBox(['■ 소분용기 표시: 약품명 · 희석비율 · 소분일자 · 경고표지(그림문자)를 반드시 붙입니다.', '■ 세탁: 색상별로 따로 세탁하고, 빨강(변기)·보라(격리)는 소독 후 세탁합니다.', '■ 장비 스티커: 장비번호·관리 책임자·점검일을 장비 앞면에 부착합니다(장비이력카드와 같은 번호).'])] }], '색상 구분표');
PKD.list = async (c, list) => xRegister(c, `${c.J.n} 사업장 관리(관련) 서류 종합 LIST`, [['구분', 6], ['파일명', 40], ['서류 세부 내용', 52], ['형식', 8]], 0,
  { appr: false, data: list.map((d, i) => [i + 1, d.f, d.d, d.f.split('.').pop()]), center: [0, 3], info: [['사업장', c.site], ['소속', c.org], ['직종', c.J.n], ['생성일', c.date]], note: `※ ${APP.name} ${APP.version} 「사업장 자료 패키지」로 생성 — 사업장명·소속은 미리 기재되어 있습니다.` });
/* 직종 대장 (업무 서식 → Excel 대장) */
function formReg(fm) {
  return async c => { const tot = fm.cols.reduce((a, x) => a + x[1], 0), land = fm.cols.length > 6;
    const cols = [['NO', 5]].concat(fm.cols.map(x => [x[0], Math.max(8, Math.round((land ? 120 : 85) * x[1] / tot))]));
    return xRegister(c, fm.n, cols, fm.fixed ? fm.fixed.length : 40, { id: fm.id, land, data: fm.fixed ? fm.fixed.map((r, i) => [i + 1, r[0]]) : [], note: `※ ${fm.pur} · 보존 ${fm.keep}`, rh: fm.fixed ? 60 : 22 }); };
}
/* 근무 편성표 (근태관리 근무조 코드) */
PKD.roster = async c => {
  const code = c.code, seq = code ? (code.seq || 'A') : 'A', crews = code ? Math.max(1, shiftMetrics(code).crews || 1) : 1;
  const cols = [['조', 5], ['성명', 10]].concat(Array.from({ length: 31 }, (_, i) => [String(i + 1), 3.6]), [['근무일', 6], ['비고', 8]]);
  const wb = xBook(), ws = xSheet(wb, '근무편성표', c, cols.map(x => x[1]), { land: true, id: '근무편성' });
  let r = xTitle(ws, cols.length, `20   년 (   )월 ${c.J.n} 근무 편성표`, c, { info: [['사업장', c.site], ['근무형태', c.shift || '-'], ['근무조 코드', code ? code.id : '-'], ['작성자', c.author]] });
  r = xHead(ws, r, cols.map(x => x[0]));
  const names = 'ABCDEFGHIJ';
  for (let k = 0; k < Math.max(crews, 4); k++, r++) {
    xCell(ws, r, 1, names[k] + '조', { al: { horizontal: 'center' }, font: { bold: true } }); xCell(ws, r, 2, '');
    for (let d = 0; d < 31; d++) { const s = k < crews ? seq[(d + k * Math.max(1, Math.floor(seq.length / crews))) % seq.length] : ''; const v = /[DO]/.test(s) ? '휴' : s === 'A' ? '주' : s === 'B' ? '야' : s === 'K' ? '당' : s; xCell(ws, r, 3 + d, v, { al: { horizontal: 'center' }, fill: v === '휴' ? 'F1F5F9' : v === '야' ? 'E3E8FA' : undefined }); }
    const L = ws.getColumn(3).letter, R2 = ws.getColumn(33).letter; xCell(ws, r, 34, { formula: `COUNTIF(${L}${r}:${R2}${r},"주")+COUNTIF(${L}${r}:${R2}${r},"야")+COUNTIF(${L}${r}:${R2}${r},"당")` }, { al: { horizontal: 'center' } }); xCell(ws, r, 35, '');
  }
  xNote(ws, r + 1, cols.length, `※ 주=주간 · 야=야간 · 당=당직(24h) · 휴=휴무 — 근태관리 프로그램 근무조 코드(${code ? code.id + ' ' + code.name : '미지정'}) 순환 기준 초안입니다. 1일차 시작 조를 실제에 맞게 조정하세요.`);
  return xBlob(wb);
};
/* 작업표준 게시물 (구역별 SOP 요약) */
PKD.sopPost = async c => {
  const A = SOP[c.job] ? SOP[c.job].areas : [];
  const secs = A.map((a, i) => ({ ch: [pTop(c, `작업표준 게시 ${i + 1}/${A.length}`), pP([pR(`${a.e || '■'} ${a.n} 작업표준`, { size: 36, bold: true, color: '0B1F8F' })], { align: AC_(), after: 120, pb: i > 0 }),
    ...a.tasks.slice(0, 6).flatMap(t => [pP([pR(`▶ ${t.n}`, { size: 22, bold: true, color: '17552F' }), pR(`   ${t.f}`, { size: 16, color: '4B5563' })], { before: 80, after: 30, keepNext: true }),
      ...(t.s || []).slice(0, 7).map((s, k) => pP([pR(`${k + 1}. ${s[0]}`, { size: 18 })], { after: 10, indent: { left: 280 } }))])] }));
  return pDoc(secs.length ? secs : [{ ch: [pP('작업표준 없음')] }], '작업표준 게시물');
};

/* =====================================================================
 * 패키지 목록 — 직종별
 * ===================================================================== */
function pkgList(c) {
  const L = [], add = (n, ext, d, fn) => L.push({ f: `${String(L.length + 1).padStart(2, '0')}. ${n}.${ext}`, d, fn });
  add('관리감독자 지정서', 'docx', '관리감독자 지정 선임(산업안전보건법 제16조)', PKD.appoint);
  add('구인 공고 의뢰서', 'docx', `${c.J.n} 직원 채용공고 의뢰`, PKD.recruit);
  add(`${c.J.n}(관리자) 면접 평가표`, 'docx', `${c.head} 등 관리자 면접 평가표`, PKD.intMgr);
  add(`${c.J.n}(신입) 면접 평가표`, 'docx', '신입·승계 직원 면접 평가표', PKD.intNew);
  add('근로계약서', 'docx', `${c.J.n}직군 근로계약서(근로기준법 제17조)`, PKD.contract);
  add('휴가원', 'xlsx', '연차·반차·경조·병가 신청', PKD.leave);
  add('인수품목리스트', 'xlsx', '신규 사업장 인수 시 장비·용품·소모품 인수 이력·금액', PKD.handover);
  add('사업장 인수 액션플랜', 'xlsx', '운영 개시 D-30 ~ D+30 일자별 실행 계획', PKD.actionPlan);
  add('근무 편성표', 'xlsx', '근태관리 근무조 코드 기준 월 근무 편성', PKD.roster);
  add('연간 교육계획', 'docx', '월별 안전보건교육·직무교육·법정교육 연간 일정', PKD.eduPlan);
  add('산업안전보건교육 자료·일지', 'docx', '월별 교육자료 12종 + 교육일지·참석자 명단', PKD.eduSafety);
  add('성희롱 예방교육 일지·결과보고', 'docx', '교육일지·참석자 명단·결과 보고', PKD.eduHarass);
  add('개인정보 보호교육 확인서', 'docx', '교육 내용·서약·참석자 서명', PKD.eduPrivacy);
  add('장애인 인식개선 교육일지', 'docx', '교육일지·참석자 명단', PKD.eduDisab);
  add(`${c.head} 일일 업무계획표`, 'docx', `${c.head}용 시간대별 하루 업무`, PKD.dayPlan);
  add(c.job === 'cln' ? '연간 업무계획(정기·특수청소)' : '연간 정기 작업 계획', 'docx', '작업표준의 월·분기·반기·연간 작업을 월별 계획표로', PKD.yearPlan);
  add(c.job === 'cln' ? '일상청소계획' : '일상 작업 계획', 'docx', '매일 하는 작업·횟수·시간대', PKD.dailyPlan);
  add('월간 업무계획(보고용)', 'docx', '월간 정기·특수 작업 계획(지사 보고용)', PKD.monthReport);
  add('월간 업무계획(게시용)', 'docx', '게시판 부착용 월간 작업 계획', PKD.monthPost);
  if (WEEK_FOCUS[c.job]) add(`요일별 중점${c.job === 'cln' ? '청소' : '점검'} 현황표`, 'docx', '요일별 중점 작업 계획', PKD.weekFocus);
  add('업무일지(작성예시 포함)', 'docx', '일일 업무·작업실적·특이사항·인원 현황', PKD.diary);
  add('월 주요업무실적 및 계획(작성예시 포함)', 'docx', '월 실적·자체 품질평가·차월 계획·작업 전후 사진', PKD.monthly);
  add('사건사고 보고서', 'docx', '사건사고 발생·조치·재발 방지(6하원칙)', PKD.accident);
  add(`${c.J.n} 품질평가 체크리스트`, 'xlsx', c.job === 'cln' ? '일반·위험·품질관리부문 품질평가(배점·자동 합계)' : '작업표준(SOP) 완료 기준으로 만든 품질평가(자동 합계)', PKD.quality);
  add(`${PJ(c)}용품 · 소모품 구매 요청서`, 'xlsx', '코드 입력 시 품명 자동 · 전월청구·재고·당월청구', PKD.purchase);
  if (c.job === 'cln') {
    add('미화용품 입고현황(창고용)', 'xlsx', '미화용품별 입고 수량', PKD.inUse);
    add('미화용품 출고현황(창고용)', 'xlsx', '미화용품별 출고 수량', PKD.outUse);
    add('미화약품 입고현황(창고용)', 'xlsx', '미화약품별 입고 수량', PKD.inChem);
    add('미화약품 출고현황(창고용)', 'xlsx', '미화약품별 출고 수량', PKD.outChem);
  }
  add(`${PJ(c)}용품 · 약품 재고종합현황(관리자용)`, 'xlsx', '전월재고·일자별 입출고·당월재고 자동 계산', PKD.stock);
  if (c.job === 'cln' || c.job === 'san') {
    add('미화용품 · 소모품 규격서', 'xlsx', '에스텍 규격 미화용품·소모품·약품 목록', PKD.spec);
    add('미화약품별 성분 현황', 'xlsx', '약품별 물질명·CAS 번호·함유량·특검·측정 대상', PKD.chem);
    add('특수건강진단 · 작업환경측정 대상 유해물질목록', 'xlsx', '대상 물질·CAS·사용 약품 포함 여부', PKD.hazmat);
    add('청소약품별 용도 및 희석비율(게시용)', 'docx', '14종 약품 용도·희석비율·pH · 혼합 금지', PKD.dilute);
    add('청소약품 MSDS 경고표지(14종)', 'docx', '그림문자·신호어·유해위험문구·예방조치(용기·보관함 부착)', PKD.msds);
    add('창고 용품별 네임텍', 'docx', '창고 선반 부착용 네임텍', PKD.nametag);
    add('마포 · 걸레 · 소분용기 색상 구분표', 'docx', '구역별 색상 구분(교차오염 방지)·소분용기 표시', PKD.colorCode);
  }
  add('장비이력카드', 'xlsx', '장비 제원·사진·관리(수리) 이력', PKD.equipCard);
  if (c.job === 'cln') add('화장실 점검표', 'xlsx', '시간대별 청소·소모품·정리정돈 점검', PKD.toiletCheck);
  add(`${c.J.n} 업무 지원 요청서`, 'xlsx', '교육·점검·장비·인력 지원 요청', PKD.support);
  add('중량물 취급주의 게시물', 'docx', '무게별 취급 기준·들기 자세(창고·작업장 부착)', PKD.heavy);
  add(`${c.J.n} 작업표준 게시물`, 'docx', '구역별 작업 순서 요약(현장 부착용)', PKD.sopPost);
  formsForJob(c.job).filter(fm => fm.set === 'job').forEach(fm => add(`${fm.n}(대장)`, 'xlsx', `${fm.pur} — Excel 대장`, formReg(fm)));
  add(`${c.J.n} 업무 서식집`, 'docx', '공통·직종·안전 서식 인쇄용 묶음', async () => makeFormsDocx(c.f));
  return L;
}

/* =====================================================================
 * 실행 — ZIP
 * ===================================================================== */
async function makeSitePackage(f, onProg) {
  const c = pkCtx(f); c.code = AMS_CODES.find(x => x.id === f.code) || null;
  const list = pkgList(c), zip = new JSZip(), dir = `${safeName(c.site || '사업장')}_${PJ(c)}_사업장 관리서류 종합`, folder = zip.folder(dir), fails = [];
  R.raw = true;
  try {
    for (let i = 0; i < list.length; i++) {
      const d = list[i]; onProg && onProg(i + 1, list.length + 1, d.f);
      try { folder.file(d.f, await d.fn(c)); } catch (e) { console.error(d.f, e); fails.push(d.f + ' — ' + e.message); }
    }
    folder.file(`00. ${c.J.n} 사업장 관리(관련) 서류 종합 LIST.xlsx`, await PKD.list(c, list));
  } finally { R.raw = false; }
  if (fails.length) folder.file('생성 오류.txt', fails.join('\n'));
  return { blob: await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }), name: `${dir}.zip`, n: list.length + 1, fails };
}
async function runPackage() {
  const f = readForm();
  if (!f.siteObj && !f.client) toast('사업장을 고르지 않아 사업장명을 비워 둡니다. ①에서 사업장을 고르면 모든 서류에 이름이 들어갑니다.', 4200);
  try {
    busy(true, '사업장 자료 패키지 준비 중…');
    const r = await makeSitePackage(f, (i, n, nm) => busy(true, `사업장 자료 패키지 ${i}/${n} — ${nm}`));
    await download(r.blob, r.name);
    toast(r.fails.length ? `자료 ${r.n - r.fails.length}종 생성 (${r.fails.length}종 오류 — ZIP 안 「생성 오류.txt」 확인)` : `사업장 자료 ${r.n}종을 ZIP으로 만들었습니다.`, 5000);
  } catch (e) { console.error(e); toast('생성 오류: ' + e.message, 5000); }
  finally { busy(false); }
}
