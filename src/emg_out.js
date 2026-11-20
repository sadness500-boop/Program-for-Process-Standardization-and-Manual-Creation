/* =====================================================================
 * 비상대처 매뉴얼 — 업무매뉴얼 「비상대처 매뉴얼」 장 (에스텍 비상대처 매뉴얼 원문 11개 장)
 *  · Word: 원문 순서대로 제목·문단·표 그대로 · 그림만 있던 항목은 표준 내용으로 보충(EMG_FILL)
 *  · PPT/PDF: 장마다 표지 + 항목별 슬라이드(넘치면 나눔)
 *  Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const EMG_FILL = {
  'fire|1. 화재의 기본이론': ['연소의 3요소: 가연물(탈 것) · 산소(공기) · 점화원(열·불꽃) — 셋 중 하나만 없애도 불은 꺼진다', '연소의 4요소: 3요소 + 연쇄반응', '실내 화재는 발화 → 성장 → 플래시오버(5~6분) → 최성기 → 감쇠 순으로 진행 — 초기 3분 안에 진화해야 한다'],
  'fire|2. 소화 방법의 종류': ['냉각소화: 물 등으로 온도를 낮춘다(일반 화재)', '질식소화: 산소를 차단한다(소화포·모래·이산화탄소·뚜껑 덮기)', '제거소화: 가연물을 치운다(가스 밸브 잠금·주변 물건 이동)', '억제소화: 연쇄반응을 끊는다(분말·할론 소화약제)'],
  'fire|3. 화재발생 원인별 분류': ['전기 화재: 문어발 콘센트·노후 전선·전열기 과열·먼지 쌓인 플러그(트래킹)', '담뱃불: 흡연장 외 흡연·꽁초 휴지통 투기', '가스 화재: 밸브 미차단·호스 노후·누설', '화기 작업: 용접·절단 불티(작업허가·불티 방지포·감시인)', '방화: 외부인 침입·불만자(순찰·출입통제)', '자연발화: 기름 묻은 걸레·왁스 걸레 방치(뚜껑 있는 금속 용기에 보관)'],
  'fire|4. 화재의 종류': ['A급(일반 화재, 백색): 종이·목재·섬유 — 물·분말 소화기', 'B급(유류 화재, 황색): 기름·페인트·알코올 — 분말·이산화탄소 소화기, 물 금지', 'C급(전기 화재, 청색): 전기 설비 — 전원 차단 후 분말·이산화탄소 소화기, 물 금지', 'K급(주방 화재): 식용유 — K급 소화기, 물 절대 금지', 'D급(금속 화재): 마그네슘 등 — 마른 모래·전용 약제'],
  'fire|5. 화재 유형별 소화요령': ['일반 화재: 소화기 → 옥내소화전 순으로 화점 아래쪽부터', '유류 화재: 물 뿌리지 말고 분말 소화기·소화포로 덮는다', '전기 화재: 차단기를 먼저 내리고 분말·이산화탄소 소화기', '식용유 화재: 가스 밸브 잠금 → K급 소화기 또는 젖은 수건·뚜껑으로 덮기', '가스 화재: 밸브를 잠가 공급을 끊은 뒤 불을 끈다(밸브 잠그기 전 끄면 가스 누출로 폭발 위험)'],
  'fire|7. 화재발생 시 응급조치 활동': ['「불이야!」 크게 외치고 비상벨(발신기)을 누른다', '119 신고 — 주소·건물명·층·불난 것·사람 유무를 또박또박', '초기 진화: 소화기(20초 분사)로 진화, 천장까지 번지면 즉시 대피', '방재실·현장대리인·고객사에 동시 보고(무전)', '방화문·출입문을 닫아 연기 확산을 막는다(잠그지 않는다)', '소방대 도착 시 화점 위치·남은 사람·위험물 위치를 알려 준다'],
  'fire|8. 대피 유도 요령': ['큰 목소리와 경광봉으로 가까운 계단·비상구 쪽으로 유도한다', '엘리베이터 사용 금지 — 계단으로만', '연기가 있으면 젖은 수건으로 입·코를 막고 낮은 자세로', '장애인·노약자·임산부를 먼저 돕고 2인 1조로 부축', '대피 집결지에서 인원을 확인해 현장대리인에게 보고', '아래층으로 대피가 어렵다면 옥상으로, 문틈을 막고 구조 요청'],
  'fire|라. 화재 수신반': ['감지기·발신기 신호를 받아 화재 위치(경계구역)를 표시하는 설비 — 방재실·경비실에 설치', '화재 신호 시: 표시창의 구역 확인 → 현장 확인(2인) → 실제 화재면 경보·119, 오작동이면 복구', '오작동이라도 원인(먼지·습기·공사 분진)을 기록하고 시설 담당에게 통보', '음향 정지 스위치는 확인 후에만 누르고, 확인 후 반드시 정상 위치로 복구']
};
const EMG_VID = { acc: 'sec3', nat: 'sec2', grp: 'sec1', fire: 'sec2', riot: 'sec3', intr: 'sec1', ems: 'sig', gas: 'fac', secu: 'sec1', media: 'off', terr: 'sec3' };
const EMG_ICON = { acc: '🚨', nat: '🌪', grp: '📢', fire: '🔥', riot: '😡', intr: '🚷', ems: '🚑', gas: '⚠', secu: '🔐', media: '🎤', terr: '💣' };
const EMG_HEAD = /^([0-9]+\s*[.]|[가-하]\s*[.,])\s*\S/;
function emgItems(c) {
  const out = [];
  c.items.forEach((it, i) => { out.push(it); if (it[0] === 'p') { const f = EMG_FILL[`${c.k}|${it[1]}`]; if (f) f.forEach(l => out.push(['p', '▷ ' + l, 1])); } });
  return out;
}
function emgTaxInit() {
  if (typeof EMG === 'undefined' || MAN.find(L => L.c === 'MX')) return;
  const smalls = EMG.map((c, i) => ({ c: `MX-${pad(i + 1)}`, n: `${EMG_ICON[c.k] || '■'} ${c.t.replace(/의 대응$/, ' 대응')}`, g: /fire|ems|acc|gas/.test(c.k) ? 'M' : 'C', gen: 'emg', emg: c.k,
    k: ['비상', '대처', '비상대처', c.t].concat(c.items.filter(x => x[0] === 'p' && EMG_HEAD.test(x[1]) && x[1].length < 40).map(x => x[1].replace(EMG_HEAD, '').trim()).slice(0, 12)), l: c.k === 'fire' ? ['FSA16'] : c.k === 'grp' ? ['SSA7'] : c.k === 'ems' ? ['OSH38'] : [] }));
  const iMF = MAN.findIndex(L => L.c === 'MF');
  MAN.splice(iMF + 1, 0, { c: 'MX', n: '비상대처 매뉴얼', e: '🆘', mids: [{ c: 'MX', n: '비상대처', smalls }] });
  Object.keys(MAN_PACK).forEach(lv => smalls.forEach(s => { if (!MAN_PACK[lv].includes(s.c)) MAN_PACK[lv].push(s.c); }));
}
function emgOf(S) { return (typeof EMG !== 'undefined' ? EMG : []).find(c => c.k === S.emg); }
function emgGroups(S) {
  const c = emgOf(S); if (!c) return [];
  const heads = c.items.filter(x => x[0] === 'p' && /^[0-9]+\s*\./.test(x[1])).map(x => x[1]);
  return [{ title: '목적', lines: [`${c.t} 근무자가 해야 할 판단·조치·보고·유의사항을 에스텍 비상대처 매뉴얼 기준으로 정한다.`] }, { title: '수록 항목 (원문 순서대로 출력)', lines: heads.length ? heads : ['원문 전체'] }, { title: '공통 원칙', lines: ['선(先) 조치 후(後) 보고 — 인명 안전이 최우선', '6하 원칙(언제·어디서·누가·무엇을·어떻게·왜) + 얼마나(피해)로 보고', '현장 보존 — 경찰·관계기관 도착 전까지 출입 통제', '발생 5분 이내 1차 보고 · 12시간 이내 사건사고 보고서'] }];
}
/* ---------- Word ---------- */
function emgDocx(S) {
  const c = emgOf(S), out = []; if (!c) return out;
  emgItems(c).forEach(it => {
    if (it[0] === 't') {
      const rows = it[1], n = Math.max(...rows.map(r => r.length));
      const w0 = n === 2 ? [2000, CW - 2000] : n === 3 ? [1700, CW - 3400, 1700] : Array.from({ length: n }, () => Math.floor(CW / n));
      const wsum = w0.reduce((a, b) => a + b, 0); w0[w0.length - 1] += CW - wsum;
      out.push(table(rows.map((r, ri) => { const cells = r.concat(Array(n - r.length).fill('')).slice(0, n);
        return cells.map((v, k) => ri === 0 && rows.length > 1 && /구\s*분|사고유형|종\s*류|항\s*목/.test(r[0]) ? th(v.replace(/\n/g, ' '), w0[k]) : td(v, w0[k], { size: 18, bold: k === 0 && n > 1, fill: k === 0 && n > 1 ? 'F4F6FA' : undefined })); }), w0));
      out.push(P([R('')], { after: 40, line: 200 }));
      return;
    }
    const t = it[1];
    if (/^[0-9]+\s*\.\s*\S/.test(t) && t.length < 60) out.push(P([R(t, { size: 22, bold: true, color: C.navy })], { before: 140, after: 60, keepNext: true, border: { bottom: { style: docx.BorderStyle.SINGLE, size: 4, color: 'C9D3E6', space: 2 } } }));
    else if (/^[가-하]\s*[.,]\s*\S/.test(t) && t.length < 70) out.push(P([R(t, { size: 21, bold: true, color: C.greenD })], { before: 80, after: 40, keepNext: true }));
    else if (/^□|^■/.test(t)) out.push(P([R(t, { size: 20, bold: true })], { after: 40, indent: { left: 120 } }));
    else out.push(P([R(t, { size: 20, color: it[2] ? '17552F' : undefined })], { after: 36, indent: { left: /^[0-9]+\)|^[가-하]\)|^[①-⑳]|^▷|^\*|^ㅇ|^-/.test(t) ? 360 : 200 } }));
  });
  out.push(P([R('출처: 에스텍 「비상대처 매뉴얼」 · ▷ 초록 글씨는 그림으로만 실려 있던 내용을 표준 내용으로 보충한 것입니다.', { size: 15, color: C.gray })], { before: 60, after: 120 }));
  return out;
}
/* ---------- PPT · PDF ---------- */
function emgParas(c) {
  const P0 = [];
  emgItems(c).forEach(it => {
    if (it[0] === 't') { it[1].forEach((r, ri) => { if (ri === 0 && it[1].length > 1 && /구\s*분|사고유형|종\s*류|항\s*목/.test(r[0])) return; const head = r[0].replace(/\n/g, ' '), rest = r.slice(1).join(' · ').split('\n').map(s => s.trim()).filter(Boolean);
      P0.push({ text: head, bold: true, color: C.green, gap: 2 }); rest.forEach(l => P0.push({ text: '  ' + l, color: C.ink, gap: 2 })); }); return; }
    const t = it[1];
    if (/^[0-9]+\s*\.\s*\S/.test(t) && t.length < 60) P0.push({ text: t, bold: true, color: C.navy, gap: 4, head: true });
    else if (/^[가-하]\s*[.,]\s*\S/.test(t) && t.length < 70) P0.push({ text: t, bold: true, color: K.ink, gap: 3 });
    else P0.push({ text: t, color: it[2] ? '17552F' : C.ink, gap: 2 });
  });
  return P0;
}
function emgSlides(S, p, Sl, no, secLabel) {
  const c = emgOf(S); if (!c) return no;
  const paras = emgParas(c), pages = paginate(paras, 8.4, 5.15, 12);
  pages.forEach((pg, i) => {
    const o = frame(`${secLabel} ${S.n}${pages.length > 1 ? ` (${i + 1}/${pages.length})` : ''}`, '에스텍 비상대처 매뉴얼', no, p);
    o.push(T(0.6, 1.55, 8.5, 5.25, pg, { max: 14, min: 11 }));
    if (i === 0) { o.push(Rc(9.35, 1.6, 3.4, 2.0, '0F1530')); o.push(Vd(9.4, 1.65, 3.3, 1.9, EMG_VID[c.k] || 'sec1')); o.push(T(9.35, 3.7, 3.4, 0.35, '▶ 현장 영상 — 누르면 재생', { pt: 10, color: K.mute }));
      o.push(Rc(9.35, 4.2, 3.4, 2.5, 'FDF1EF', { line: 'F2B8B0' })); o.push(T(9.5, 4.3, 3.1, 2.3, listParas([{ title: '공통 원칙', lines: ['先 조치 後 보고', '6하 원칙 + 피해 규모', '현장 보존 · 출입 통제', '5분 내 1차 보고'] }], { hcolor: 'C62828' }), { max: 13, min: 10 })); }
    else { o.push(Rc(9.35, 1.6, 3.4, 5.1, 'F4F6FA')); o.push(T(9.5, 1.75, 3.1, 4.8, listParas([{ title: '이 장의 항목', lines: c.items.filter(x => x[0] === 'p' && /^[0-9]+\s*\./.test(x[1])).map(x => x[1]).slice(0, 12) }]), { max: 12, min: 9.5 })); }
    Sl.push(o); no++;
  });
  return no;
}
