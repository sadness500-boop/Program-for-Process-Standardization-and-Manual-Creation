/* =====================================================================
 * Program for Process Standardization and Manual Creation — 업무매뉴얼 제작 (v1.1.0)
 * [ Manual - Project ] 4계층 체계 · 사건사고 상황별 대처 · 법적 근거·판례 · 3D 피규어·사진·영상·QR
 * Program & Design by Rat Rae Choi (제작자 서명 — 하드코딩)
 * ===================================================================== */
const JOB_POSTERS = { sec: ['sec1', 'sec2', 'sec3', 'grd'], cln: ['cln'], prk: ['prk', 'hwy'], fac: ['fac'], info: ['off', 'sec2'], cook: ['off2'], san: ['san1', 'san2', 'san3'] };
const IND_POSTER = { logistics: 'log', construction: 'sig', power: 'spc', factory: 'fork', building: 'sec2', hospital: 'sec3', retail: 'prk', univ: 'grd', training: 'off', apt: 'sec1', public: 'sec2', etc: 'spc' };
const RISKFIX = {
  sec: ['2인 1조 대응 원칙, 위협 시 112 신고 — 무리한 제지 금지', '반사조끼·경광봉 착용, 차량 측면에서 유도', '격일 근무 중 휴게·수면시간 실제 부여, 야간 순찰로 졸음 예방', '경보 확인 시 소화기 지참·2인 출동, 가스 누출 시 화기·스위치 조작 금지'],
  cln: ['"청소 중" 표지 설치, 미끄럼 방지 안전화, 물기 즉시 제거', '고무장갑·마스크·보안경 착용, 약품 혼합 금지, MSDS 게시', '작업 전 스트레칭, 중량물은 2인 운반·카트 사용', '쓰레기 압착 금지, 날카로운 물체는 별도 용기 수거'],
  prk: ['차량 정면에 서지 않기, 운전자와 눈 맞춤 후 수신호', '환기 확인, 장시간 근무 시 교대 휴식', '혹서기 물·그늘·휴식, 혹한기 방한복·핫팩', '폭언 시 응대 중단·책임자 인계(감정노동 보호)'],
  fac: ['정전 확인·LOTO 후 작업, 절연장갑·절연화', '회전체 정지 확인 후 정비, 방호덮개 유지', '산소·유해가스 측정, 감시인 배치, 송기마스크', '안전대 체결, 작업발판·난간 확인'],
  info: ['폭언 시 응대 중단·책임자 인계, 보호 안내문 게시', '교대 휴식·발판·의자 비치', '방문자 정보 최소 수집, 신분증 사본 보관 금지'],
  cook: ['내열·내절단 장갑, 칼 사용 시 집중·정리', '미끄럼 방지 조리화, 바닥 물기 제거', '보존식 144시간 보관·온도 기록, 식재료 검수', '환기·수분 섭취, 혹서기 휴식'],
  san: ['방독마스크·보안경·내화학 장갑·보호복 착용', '밀폐공간 산소·가스 측정, 감시인 배치', '사다리 2인 1조, 고소부위 안전대']
};
const TEN_RULES = ['근무 시작 10분 전 도착·대면 인수인계', '지정 근무 위치 사수 — 이석은 「보고 → 대체 → 복귀보고」', '근무 중 휴대폰은 업무 연락에만', '근무 중 음주·수면·흡연(지정장소 외) 금지', '단정한 근무복·명찰 착용', '먼저 인사하고 표준 화법으로 응대', '이상 징후는 즉시 보고(즉보 10분)', '모든 근무는 기록으로 남긴다(실시간 일지)', '고객사 요청은 현장 책임자를 통해 받는다', '안전수칙·보호구 착용 — 위험하면 작업 중지'];

function qrPng(text, px = 180) {
  try {
    const q = qrcode(0, 'M'); q.addData(text); q.make();
    const n = q.getModuleCount(), m = 2, s = Math.floor(px / (n + m * 2)), W = s * (n + m * 2);
    const cv = document.createElement('canvas'); cv.width = cv.height = W; const g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, W); g.fillStyle = '#0b1757';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect((c + m) * s, (r + m) * s, s, s);
    return cv.toDataURL('image/png');
  } catch (e) { return null; }
}
const vidUrl = k => APP.shareUrl + (k.includes('/') ? 'media/' + k : 'media/videos/' + k) + '.mp4';
function posterOf(k) { return ASSET.poster[k] || ASSET.poster.sec1; }
function scnFor(grp, job) { const all = SCN.filter(s => s.grp === grp); const mine = all.filter(s => !s.jobs || s.jobs.includes(job)); return mine.length ? mine : all; }
function badFor(job) { const b = BAD.filter(x => x.jobs.includes(job)); return b.length ? b : BAD.slice(0, 3); }
function casesFor(job, ind) { return CASES.filter(c => (!c.jobs || c.jobs.includes(job)) && (!c.inds || c.inds.includes(ind))); }
function manCode(f, level) { const J = MAN_JOBCODE[f.job]; if (level === 'L1') return 'STB-COM-000'; if (level === 'L2') return `STB-${J}-100`; if (level === 'L3') return `STB-${J}-1${pad(IND_ORDER.indexOf(f.ind) + 1)}`; return `STB-${J}-9${String((f.siteObj && f.siteObj.id) || 0).padStart(2, '0')}`; }

/* 항목별 본문(■ 소제목 / - 항목) */
function manGroups(S, f, p) {
  const J = JOB[f.job], I = IND[f.ind], G = [], st = f.siteObj, lv = MAN_LEVEL[f.level];
  const std = c => (findSmall(c) || { S: { st: [], ck: [] } }).S;
  switch (S.gen) {
    case 'intro':
      G.push({ title: '목적', lines: [`이 매뉴얼은 에스텍 그룹 ${f.level === 'L1' ? '전 직종' : J.n} 근무자가 ${f.level === 'L4' ? p.where + ' 현장에서' : '어느 현장에서나'} 같은 기준으로 일하고, 사건사고에 침착하게 대응하도록 업무 방법·근무 수칙·상황별 대처·법적 근거를 정한 것이다.`] });
      G.push({ title: '적용 범위', lines: [`${p.where}${f.level === 'L1' ? '' : ' · ' + J.n + ' 직종'}${f.level === 'L3' ? ' · ' + I.n + ' 사업장' : ''} 근무자(정규·기간제·단시간·대체 근무자 포함)와 현장 관리자`, '용역(도급)계약서·취업규칙·관계 법령이 이 매뉴얼보다 우선한다.'] });
      G.push({ title: '매뉴얼 체계 (4계층)', lines: Object.entries(MAN_LEVEL).map(([k, v]) => `${k === f.level ? '▶ ' : ''}${v.n} — ${v.s}${k === f.level ? '  ← 이 문서' : ''}`) });
      G.push({ title: '활용 방법', lines: ['신규 배치 시 전 장을 교육하고 교육 확인서에 서명받는다.', '사건사고 발생 시 「상황별 대처」 장을 먼저 펼친다 — 영상 QR로 현장 영상을 바로 본다.', '연 1회 정기 개정, 법령·계약 변경 시 수시 개정한다.'] });
      break;
    case 'terms':
      G.push({ title: '용어', lines: ['현장대리인: 사업장 상주 회사 측 책임자(고객사 요청 접수·근무자 지휘·보고)', '근무조 코드: 근무형태·출퇴근 시각·휴게·근로형태를 정한 코드(근태관리 프로그램)', '즉보: 사건사고 인지 후 10분 이내 유선 보고', 'TBM: 작업 전 5~10분 위험요인·안전대책 공유 회의', '3대 중대위반: 무단 근무지 이탈 · 근무 시작·종료 시간 미준수 · 정당한 지시 불이행', 'LOTO: 정비 전 에너지원 잠금·표지(Lock-Out Tag-Out)', 'MSDS: 물질안전보건자료(약품 위험성·응급조치 정보)'] });
      break;
    case 'org':
      G.push({ title: '지휘·보고 체계', lines: ['고객사 → 현장대리인(요청 접수) → 팀장·조장 → 근무자', '근무자 → 조장 → 현장대리인 → 지사장 → 본사(보고)', '고객사 직원의 직접 지시는 받지 않고 현장대리인을 통해 처리(도급 관계 유지)'] });
      G.push({ title: '에스텍베스트 지사', lines: BRANCHES.map(b => `${b.name}: ${b.addr}`) });
      break;
    case 'duty':
      G.push({ title: `${J.n} 핵심 직무`, lines: J.duty });
      if (st) G.push({ title: '현장 배치', lines: [`${st.name}: 계약 업종 ${st.work} · 근무형태 ${st.shift} · 총 ${st.total}명(보안 ${st.sec} · 미화 ${st.cln} · 기타 ${st.etc})`] });
      G.push({ title: '자격·교육', lines: J.qual });
      break;
    case 'shift': {
      const c = p.code;
      if (c) { const m = shiftMetrics(c); G.push({ title: `기준 근무형태 — ${c.id}`, lines: [`${c.name} · ${c.ltype}`, `순환 ${c.seq.split('').join(' ')} (A 주간 · B 야간 · K 격일 · D 휴무) · 월 근무 ${m.days.toFixed(1)}일 · 월 실근로 ${m.hours.toFixed(0)}시간`, m.warn ? '확인: ' + m.warn : '법정 근로시간 기준 적합'] });
        G.push({ title: '일일 타임테이블', lines: timetable(f.job, c).map(r => r.head ? `【${r.head}】` : `${r.t}  ${r.a}`) }); }
      G.push({ title: '휴게 원칙', lines: ['휴게는 근로시간 도중에 부여하고 대체 근무자를 지정한다.', '휴게 중 호출·대기를 시키면 근로시간으로 볼 수 있다 — 휴게 장소를 근무지와 분리한다.'] });
      break; }
    case 'kit':
      G.push({ title: '지급 장비·보호구', lines: J.kit });
      G.push({ title: '복장 기준', lines: ['지급 근무복·명찰 착용(보안은 경비업법 제16조 신고 복장)', '두발·손톱·위생 단정, 액세서리 최소화', '장비는 교대 시 수량 확인·인계 대장 서명'] });
      break;
    case 'ban':
      G.push({ title: '금지·제한 업무', lines: J.ban });
      if (f.ind === 'apt') G.push({ title: '공동주택 경비원 허용 업무(공동주택관리법 제65조의2)', lines: ['청소·미화 보조, 재활용 분리배출 정리·감시', '안전·위험 대응, 도난 예방 순찰', '택배물품 보관(배달 제외), 주차 질서 유지(대리주차 제외)', '입주민 부당 지시는 거부하고 관리주체에 보고'] });
      G.push({ title: '계약 외 요청을 받으면', lines: ['"현장 책임자를 통해 처리하겠습니다"로 정중히 안내', '요청 내용·일시·요청자 기록 → 현장대리인 보고'] });
      break;
    case 'flow':
      G.push({ title: '근무 개시 → 종료', lines: ['① 10분 전 도착 · 복장·장비 점검', '② 대면 인수인계(특이사항·미결 업무·열쇠·장비·고객사 지시)', '③ TBM(작업 전 위험요인 공유) · 근무 시작 보고', '④ 타임테이블대로 업무 수행 · 실시간 기록', '⑤ 휴게(대체 근무자 지정)', '⑥ 근무 종료 · 일지 서명 · 다음 근무자 인계'] });
      G.push({ title: '인수인계 기준', lines: std('A2-03').st });
      break;
    case 'rules':
      G.push({ title: '복무 10대 수칙', lines: TEN_RULES });
      G.push({ title: '3대 중대위반 — 위반 시 징계 검토', lines: ['무단 근무지 이탈', '근무 시작·종료 시간 미준수', '정당한 지시 불이행(불복종)'] });
      break;
    case 'cs':
      G.push({ title: '응대 화법', lines: std('C2-01').st });
      G.push({ title: '감정노동 보호', lines: std('C2-02').st.slice(0, 3) });
      break;
    case 'bad':
      badFor(f.job).forEach(b => G.push({ title: `❌ ${b.t}`, lines: [`문제: ${b.why}`, `바른 행동: ${b.fix}`], media: b.k }));
      break;
    case 'core': {
      const a3 = STD.find(L => L.c === 'A').mids.find(M => M.c === 'A3').smalls.find(s => s.jobs && s.jobs.includes(f.job));
      if (a3) { G.push({ title: a3.n.replace(/^[^:]+:\s*/, '') + ' — 절차', lines: a3.st }); G.push({ title: '확인 포인트', lines: a3.ck }); }
      else G.push({ title: '핵심 절차', lines: J.duty });
      break; }
    case 'tasks': {
      const s = sopRows(f.job, f.ind), by = {};
      s.rows.forEach(r => { const k = r.big + ' › ' + r.mid; (by[k] = by[k] || { n: 0, h: 0, d: [] }); by[k].n++; by[k].h += r.mon / 60; if (r.per === 'd' && by[k].d.length < 3) by[k].d.push(r.n); });
      G.push({ title: `표준 업무 ${s.rows.length}개 (${I.n} 기본규모 기준)`, lines: Object.entries(by).map(([k, v]) => `${k}: ${v.n}개 업무 · 월 ${Math.round(v.h)}시간${v.d.length ? ' · 매일: ' + v.d.join(', ') : ''}`) });
      break; }
    case 'check': {
      const s = sopRows(f.job, f.ind), daily = s.rows.filter(r => r.per === 'd' && !r.post).sort((a, b) => b.mon - a.mon).slice(0, 10).map(r => `${r.n} (${r.freq}회/일)`);
      G.push({ title: '점검 항목', lines: daily.concat(['근무일지·인수인계 대장 서명', '장비·보호구 이상 유무']) });
      break; }
    case 'ind':
      G.push({ title: `${I.n} 사업장 특성`, lines: [I.feat] });
      G.push({ title: '주요 리스크와 현장 포인트', lines: I.risk.map(r => `${r} — 근무 전 TBM에서 공유, 이상 시 즉보`) });
      break;
    case 'indlaw':
      G.push({ title: `${I.n} 추가 법령`, lines: I.laws.filter(id => LAWS[id]).map(id => `${LAWS[id].law} ${LAWS[id].art} ${LAWS[id].title}: ${LAWS[id].sum}`) });
      if (lines(f.special).length) G.push({ title: '고객사 요구', lines: lines(f.special) });
      break;
    case 'scn':
      scnFor(S.grp, f.job).forEach(x => G.push({ title: `${x.id} ${x.n}`, lines: [`상황: ${x.sit}`].concat(x.steps.map((t, i) => `대처 ${i + 1}. ${t}`)).concat(x.dont.map(t => `금지: ${t}`)).concat([`보고: ${x.rep}`]), media: x.media, vid: x.vid, scn: x.id }));
      break;
    case 'tbm':
      G.push({ title: 'TBM 5단계 (5~10분)', lines: ['① 인원·건강 상태 확인', '② 오늘 작업·근무 위치 공유', '③ 위험요인 1~3가지 지목', '④ 안전대책·보호구 확인', '⑤ 구호 제창·서명·사진 기록'] });
      G.push({ title: '교육·평가', lines: std('D1-01').st.slice(1) });
      break;
    case 'risk':
      G.push({ title: `${J.n} 위험요인 → 예방대책`, lines: J.risk.map((r, i) => `${r} → ${(RISKFIX[f.job] || [])[i] || '작업 전 TBM에서 대책 확인'}`) });
      break;
    case 'report':
      G.push({ title: '보고 시간', lines: std('D2-03').st });
      G.push({ title: '6하원칙 보고서 작성', lines: ['언제: 발생·인지 일시(분 단위)', '어디서: 장소(층·구역·초소)', '누가: 관련자(개인정보 최소)', '무엇을: 발생 사실', '어떻게: 경과와 조치', '왜: 확인된 원인(추정은 "추정"으로 표기)'] });
      break;
    case 'log':
      G.push({ title: '기록 원칙', lines: std('A2-04').st });
      break;
    case 'laws': {
      const ids = uniq(p.items.flatMap(x => x.S.l).concat(J ? [] : []).concat(I.laws)).filter(id => LAWS[id]);
      G.push({ title: '관계 법령', lines: ids.map(id => `${LAWS[id].law} ${LAWS[id].art} ${LAWS[id].title}: ${LAWS[id].sum}`) });
      break; }
    case 'cases':
      casesFor(f.job, f.ind).forEach(c => G.push({ title: `⚖ ${c.t}`, lines: [`근거: ${c.src}`, `요지: ${c.sum}`, `현장 적용: ${c.use}`] }));
      G.push({ title: '', lines: ['※ 판례·행정해석은 실무 참고용 요지입니다. 적용 전 국가법령정보센터·대법원 종합법률정보 원문과 노무 자문으로 확인하십시오.'] });
      break;
    case 'site':
      G.push({ title: '사업장 현황', lines: st ? [`${st.name} (${st.br}지사) · ${st.addr}`, `유형 ${st.type} · 계약 업종 ${st.work} · 근무형태 ${st.shift} · 계약일 ${st.since || '-'}`, `계약 인원 총 ${st.total}명(남 ${st.m} · 여 ${st.f}) — 보안 ${st.sec} · 미화 ${st.cln} · 기타 ${st.etc}`] : [`${p.where} (사업장 목록 외)`] });
      G.push({ title: '근무 배치', lines: ['(현장 작성) 근무 위치별 인원·시간대', '(현장 작성) 순찰 경로·체크포인트'] });
      break;
    case 'special':
      G.push({ title: '사업장 특수 지시사항', lines: lines(f.special).length ? lines(f.special) : ['(현장 작성) 고객사 요구사항·특수 지시'] });
      break;
    case 'forms':
      G.push({ title: FORM_SET[S.set], lines: formsFor(S.set, f.job).map(x => `${x.id} ${x.n} — ${x.pur} (보존 ${x.keep})`) });
      break;
    case 'contact': {
      const br = st ? BRANCHES.find(b => b.key === st.br) : null;
      G.push({ title: '비상연락망', lines: ['화재·구급 119 · 경찰 112 · 가스 누출 119', st ? `사업장 현장 책임자: ${[st.pos, st.mgr].filter(Boolean).join(' ')} ${st.mtel || ''}` : '현장 책임자: (현장 작성)', st && st.stel ? `사업장 전화: ${st.stel}` : '사업장 전화: (현장 작성)', br ? `관할 ${br.name}: ${br.head} ${br.title} ${br.tel} · ${br.addr}` : '관할 지사: (현장 작성)'] });
      if (st && st.lat) G.push({ title: '위치', lines: [`카카오맵: https://map.kakao.com/link/map/${encodeURIComponent(st.name)},${st.lat},${st.lng}`] });
      break; }
  }
  return G;
}
/* 항목 대표 미디어 */
function manMedia(S, p) {
  const J = p.J, fig = jobKey(p), jp = JOB_POSTERS[p.f.job] || ['sec1'], ip = IND_POSTER[p.f.ind];
  const m = { intro: { fig: 'team' }, terms: { fig: 'team_dio' }, org: { fig: 'hq' }, duty: { fig: 'dio_' + fig }, shift: { fig: 'cute_' + fig, poster: jp[0] }, kit: { fig: 'cute_' + fig }, ban: { poster: jp[1] || jp[0] },
    flow: { poster: jp[0], vid: VIDEO_OF[fig] }, rules: { poster: 'cases/cmp7' }, cs: { poster: p.f.job === 'cln' ? 'cln' : 'sec2' }, core: { poster: VIDEO_OF[fig], vid: VIDEO_OF[fig] }, tasks: { fig: 'dio_' + fig }, check: { fig: 'cute_' + fig },
    forms: { fig: 'cute_' + fig }, ind: { poster: ip, vid: ip }, indlaw: { poster: ip }, tbm: { fig: 'team_dio' }, risk: { poster: 'spc' }, report: { poster: 'pt' }, log: { poster: 'off' }, laws: { fig: 'mgr' }, cases: { poster: 'off2' }, site: { fig: 'dio_' + fig }, special: { poster: jp[0] }, contact: { fig: 'mgr' } }[S.gen] || {};
  if (m.fig && !ASSET.fig[m.fig]) m.fig = figName(m.fig.split('_')[0], fig);
  return m;
}
function buildManPlan(f) {
  if (!f.client) { toast('① 적용 사업장을 선택하세요(전사 공통이면 「전사 공통 표준」).'); document.getElementById('siteCard').scrollIntoView({ behavior: 'smooth' }); return null; }
  if (!state.picked.length) { toast('② 매뉴얼 장·절을 1개 이상 선택하세요(📦 계층 권장 구성).'); return null; }
  const items = state.picked.map(findSmall).filter(Boolean);
  const J = JOB[f.job], I = IND[f.ind], code = AMS_CODES.find(c => c.id === f.code) || null, st = f.siteObj, lv = MAN_LEVEL[f.level];
  const now = kstNow(), eff = parseD(f.eff), where = st ? `[${st.br}지사] ${st.name}` : f.client;
  const docNo = manCode(f, f.level);
  const title = f.title && !/업무표준서/.test(f.title) ? f.title : (f.level === 'L1' ? '용역회사 운영 통합매뉴얼' : f.level === 'L2' ? `${J.n} 통합 업무매뉴얼` : f.level === 'L3' ? `${J.n} × ${I.n} 업무매뉴얼` : `${st ? st.name : f.client} ${J.n} 근무지침`);
  const p = { kind: 'man', f, items, J, I, code, docNo, made: now, eff, title, site: st || null, where, level: f.level, lv, text: {}, media: {}, gen: {} };
  const lawIds = uniq(items.flatMap(x => x.S.l).concat(I.laws).concat(items.filter(x => x.S.gen === 'scn').flatMap(x => scnFor(x.S.grp, f.job).flatMap(s => s.l)))).filter(id => LAWS[id]);
  p.lawIds = lawIds; p.lawOn = Object.fromEntries(lawIds.map(id => [id, true]));
  items.forEach(x => { p.text[x.S.c] = grpText(manGroups(x.S, f, p)); p.media[x.S.c] = manMedia(x.S, p); });
  const nScn = items.filter(x => x.S.gen === 'scn').reduce((a, x) => a + scnFor(x.S.grp, f.job).length, 0);
  const nBad = items.some(x => x.S.gen === 'bad') ? badFor(f.job).length : 0;
  const vids = uniq(items.flatMap(x => { const m = p.media[x.S.c]; return [m.vid].concat(x.S.gen === 'scn' ? scnFor(x.S.grp, f.job).map(s => s.vid) : []).concat(x.S.gen === 'bad' ? badFor(f.job).map(b => b.k) : []); }).filter(Boolean));
  p.vids = vids;
  const nForms = uniq(items.filter(x => x.S.gen === 'forms').flatMap(x => formsFor(x.S.set, f.job).map(z => z.id))).length;
  p.summary = [`${lv.n} · ${docNo} · ${where}${f.level === 'L1' ? '' : ' · ' + J.n}${f.level === 'L3' ? ' × ' + I.n : ''}`, `장 ${uniq(items.map(x => x.L.c)).length}개 · 절 ${items.length}개 · 상황별 대처 ${nScn}건 · Complaint 사례 영상 ${nBad}편 · 판례·행정해석 ${items.some(x => x.S.gen === 'cases') ? casesFor(f.job, f.ind).length : 0}건 · 업무 서식 ${nForms}종`, `멀티미디어: 3D 피규어·현장 사진 + 영상 ${vids.length}편(PPT 재생 · Word QR)`, `시행일 ${fmtD(eff)} · ${Number(f.rev) ? `개정 ${f.rev}차` : '제정'} · 관계 법령 ${lawIds.length}개 조항`].join('\n');
  p.scope = ''; p.terms = '';
  p.links = [`📘 ${lv.n} (${docNo})`, `🚨 사건사고 상황별 대처 ${nScn}건 — 대표 사진·영상 QR`, `🎬 영상 ${vids.length}편 PPT 삽입 · Word에는 영상 QR`, `🧸 3D 피규어 · 현장 사진 · Complaint 사례 영상 ${nBad}편`, `🗂 업무 서식 ${nForms}종 — Word 붙임에 인쇄용 양식 수록`];
  return p;
}

/* =====================================================================
 * 업무매뉴얼 — Word
 * ===================================================================== */
function imgRun(src, wPx, dims, type = 'jpg') { const d = dims || [16, 9]; return new docx.ImageRun({ type, data: b64ToU8(dataUrlB64(src)), transformation: { width: Math.round(wPx), height: Math.round(wPx * d[1] / d[0]) } }); }
function mediaCell(m, w, opt = {}) {
  const kids = [], AC = docx.AlignmentType.CENTER;
  if (m.fig && ASSET.fig[m.fig]) kids.push(new docx.Paragraph({ alignment: AC, spacing: { after: 20 }, children: [imgRun(ASSET.fig[m.fig], opt.figW || 110, ASSET.figDim[m.fig])] }));
  else if (m.poster) kids.push(new docx.Paragraph({ alignment: AC, spacing: { after: 20 }, children: [imgRun(posterOf(m.poster), opt.posW || 150, [16, 9])] }));
  const v = m.vid; if (v) { const q = qrPng(vidUrl(v), 150); if (q) kids.push(new docx.Paragraph({ alignment: AC, spacing: { after: 0 }, children: [imgRun(q, 58, [1, 1], 'png'), R('  ▶ 영상 QR', { size: 15, color: C.green, bold: true })] })); }
  if (!kids.length) kids.push(P([R('')]));
  return new docx.TableCell({ children: kids, width: { size: w, type: docx.WidthType.DXA }, verticalAlign: docx.VerticalAlign.CENTER, borders: noB(), margins: { top: 40, bottom: 40, left: 40, right: 80 } });
}
function grpParas(groups) {
  const out = [];
  groups.forEach(g => {
    if (g.title) out.push(P([R('■ ' + g.title, { size: 19, bold: true, color: C.navy })], { before: 40, after: 30, keepNext: true }));
    g.lines.forEach(l => { const m = /^(대처 \d+\.|금지:|보고:|상황:|문제:|바른 행동:|근거:|요지:|현장 적용:)\s*(.*)$/.exec(l);
      if (m) out.push(P([R(m[1] + ' ', { size: 18, bold: true, color: /금지|문제/.test(m[1]) ? C.brick : /보고|근거/.test(m[1]) ? C.navy : C.greenD }), R(m[2], { size: 18 })], { indent: { left: 260, hanging: 200 }, after: 20, line: 264 }));
      else out.push(P([R('○ ', { size: 18, color: C.green }), R(l, { size: 18 })], { indent: { left: 300, hanging: 220 }, after: 20, line: 264 })); });
  });
  return out;
}
function sideTable(m, paras, wL = 2600) { const wR = CW - wL; return new docx.Table({ width: { size: CW, type: docx.WidthType.DXA }, columnWidths: [wL, wR], rows: [new docx.TableRow({ cantSplit: false, children: [mediaCell(m, wL, { posW: 160, figW: 120 }), new docx.TableCell({ children: paras.length ? paras : [P([R('')])], width: { size: wR, type: docx.WidthType.DXA }, borders: noB(), margins: { top: 20, bottom: 20, left: 80, right: 40 } })] })] }); }
function scnCard(g, x) {
  const m = { poster: x.media, vid: x.vid }, wL = 2500, wR = CW - wL, b = { style: docx.BorderStyle.SINGLE, size: 6, color: 'C9D3E6' };
  const head = P([R(`🚨 ${g.title}`, { size: 21, bold: true, color: C.white })], { after: 0, keepNext: true });
  return new docx.Table({ width: { size: CW, type: docx.WidthType.DXA }, columnWidths: [wL, wR], rows: [
    new docx.TableRow({ cantSplit: true, children: [new docx.TableCell({ columnSpan: 2, children: [head], shading: { fill: C.navy, type: docx.ShadingType.CLEAR, color: 'auto' }, margins: { top: 50, bottom: 50, left: 120, right: 80 }, borders: { top: b, bottom: b, left: b, right: b } })] }),
    new docx.TableRow({ cantSplit: true, children: [mediaCell(m, wL, { posW: 150 }), new docx.TableCell({ children: grpParas([{ title: '', lines: g.lines }]), width: { size: wR, type: docx.WidthType.DXA }, borders: { top: b, bottom: b, left: b, right: b }, margins: { top: 40, bottom: 40, left: 100, right: 60 } })] })] });
}
function formIdsOf(p, items) { const ids = []; items.filter(x => x.S.gen === 'forms').forEach(x => parseGrp(p.text[x.S.c]).forEach(g => g.lines.forEach(l => { const m = /^(F-[A-Z]+-\d+)/.exec(l); if (m && FORMS.find(z => z.id === m[1]) && !ids.includes(m[1])) ids.push(m[1]); }))); return ids; }
function formDoc(fm, p, first) {
  const AC = docx.AlignmentType.CENTER, out = [], tot = fm.cols.reduce((a, c) => a + c[1], 0);
  const w = fm.cols.map(c => Math.floor(CW * c[1] / tot)); w[w.length - 1] += CW - w.reduce((a, b) => a + b, 0);
  out.push(new docx.Paragraph({ pageBreakBefore: !first, alignment: docx.AlignmentType.RIGHT, spacing: { after: 20 }, children: [R(`${fm.id}  ·  ${p.docNo}`, { size: 15, color: C.gray })] }));
  out.push(P([R(fm.n, { size: 34, bold: true, color: C.navy })], { align: AC, after: 60 }));
  out.push(P([R(fm.pur, { size: 17, color: C.gray })], { align: AC, after: 100 }));
  const mw = [1300, 3300, 1100, 1900, 1100, 938];
  out.push(table([[td('사업장', mw[0], { fill: C.silverL, bold: true, align: AC, size: 17 }), td(p.where, mw[1], { size: 17 }), td('기간', mw[2], { fill: C.silverL, bold: true, align: AC, size: 17 }), td('   년   월   일 ~', mw[3], { size: 17 }), td('확인자', mw[4], { fill: C.silverL, bold: true, align: AC, size: 17 }), td('(서명)', mw[5], { size: 15, color: C.gray, align: AC })]], mw));
  out.push(P([R('')], { after: 60 }));
  const rows = fm.fixed ? fm.fixed.map(r => [td(r[0], w[0], { fill: 'F4F6FA', bold: true, color: C.navy })].concat(w.slice(1).map(x => td('\n\n', x)))) : Array.from({ length: Math.max(fm.rows, 20) }, () => w.map(x => td(' ', x)));
  out.push(table([fm.cols.map((c, i) => th(c[0], w[i]))].concat(rows), w, { header: true, rowH: fm.fixed ? 900 : 440 }));
  out.push(P([R(`보존 기간: ${fm.keep}   ·   근거: ${lawShort(fm.l.filter(id => LAWS[id])) || '용역(도급)계약서'}   ·   ${APP.org} 업무 서식`, { size: 14, color: '8A93A3' })], { before: 60, after: 0 }));
  return out;
}
async function makeManDocx(p) {
  const f = p.f, isClient = f.mode === 'client', AC = docx.AlignmentType.CENTER, ch = [], items = outItems(p);
  const fig = figName('dio', jobKey(p));
  // 표지
  ch.push(P([R(isClient ? '고객사 제출용' : '사내 매뉴얼', { size: 18, bold: true, color: isClient ? C.green : C.brick }), R(`   ${p.docNo}`, { size: 18, bold: true, color: C.gray })], { align: docx.AlignmentType.RIGHT, after: 40 }));
  ch.push(P([R(p.lv.n, { size: 20, bold: true, color: C.green })], { align: AC, before: 160, after: 120 }));
  ch.push(P([R(p.title, { size: 44, bold: true, color: C.navy })], { align: AC, after: 80, line: 420 }));
  ch.push(P([R(`${p.where}${f.level === 'L1' ? '' : '  |  ' + p.J.n}${f.level === 'L3' ? ' · ' + p.I.n : ''}`, { size: 22, color: C.gray })], { align: AC, after: 120 }));
  ch.push(new docx.Table({ width: { size: CW, type: docx.WidthType.DXA }, columnWidths: [4300, 5338], rows: [new docx.TableRow({ children: [
    new docx.TableCell({ width: { size: 4300, type: docx.WidthType.DXA }, borders: noB(), verticalAlign: docx.VerticalAlign.CENTER, children: [new docx.Paragraph({ alignment: AC, children: [imgRun(ASSET.fig[f.level === 'L1' ? 'team_dio' : fig], f.level === 'L1' ? 270 : 220, ASSET.figDim[f.level === 'L1' ? 'team_dio' : fig])] })] }),
    new docx.TableCell({ width: { size: 5338, type: docx.WidthType.DXA }, borders: noB(), verticalAlign: docx.VerticalAlign.CENTER, children: [
      new docx.Paragraph({ alignment: AC, children: [imgRun(posterOf(VIDEO_OF[jobKey(p)]), 320, [16, 9])] }),
      new docx.Paragraph({ alignment: AC, spacing: { before: 60 }, children: [imgRun(qrPng(vidUrl(VIDEO_OF[jobKey(p)]), 180), 70, [1, 1], 'png'), R(`  ▶ ${p.J.n} 근무 영상 QR`, { size: 16, bold: true, color: C.green })] })] })] })] }));
  const sw = [1600, 2679, 1785, 1787, 1787], sg = (t, w) => cell([P([R(t, { size: 17, color: C.gray })], { align: AC, after: 0 })], { w, va: docx.VerticalAlign.BOTTOM });
  ch.push(P([R('')], { after: 60 }));
  ch.push(table([
    [td('문서번호', sw[0], { fill: C.silverL, bold: true, align: AC }), td(`${p.docNo} · ${revLabel(p)}`, sw[1], { size: 17 }), th('작 성', sw[2]), th('검 토', sw[3]), th('승 인', sw[4])],
    [td('시행일', sw[0], { fill: C.silverL, bold: true, align: AC }), td(fmtD(p.eff), sw[1], { size: 17 }), sg(f.author || '', sw[2]), sg(f.reviewer || '', sw[3]), sg(f.approver || '', sw[4])],
    [td('작성 부서', sw[0], { fill: C.silverL, bold: true, align: AC }), td(f.dept, sw[1], { size: 17 }), sg('(서명)', sw[2]), sg('(서명)', sw[3]), sg('(서명)', sw[4])]], sw));
  ch.push(P([R('')], { after: 40 }));
  ch.push(boxPara([P([R('□ 매뉴얼 개요', { size: 21, bold: true, color: C.greenD })], { after: 60 })].concat(lines(p.summary).map(l => P([R('· ', { bold: true, color: C.green }), R(l, { size: 19 })], { indent: { left: 240, hanging: 200 }, after: 20 })))));
  // 목차
  ch.push(new docx.Paragraph({ children: [new docx.PageBreak()] }));
  ch.push(H1('목차'));
  const chaps = uniq(items.map(x => x.L.c)).map(c => MAN.find(L => L.c === c));
  chaps.forEach((L, i) => {
    ch.push(P([R(`${i + 1}장  ${L.e} ${L.n}`, { size: 21, bold: true, color: C.navy })], { before: 60, after: 20 }));
    items.filter(x => x.L.c === L.c).forEach((x, j) => ch.push(P([R(`${i + 1}.${j + 1}  ${x.S.n}`, { size: 18 })], { indent: { left: 500 }, after: 10 })));
  });
  ch.push(P([R('붙임  1. 일일 점검표  2. 교육 확인서  3. 경위서(6하원칙) 양식  4. 업무 서식', { size: 18, color: C.gray })], { before: 80, after: 40 }));
  ch.push(H2('제·개정 이력'));
  const rw = [1300, 2000, 4538, 1800];
  ch.push(table([[th('개정', rw[0]), th('일자', rw[1]), th('내용', rw[2]), th('작성', rw[3])], [td(revLabel(p).split(' ')[0], rw[0], { align: AC }), td(fmtD(p.made), rw[1], { align: AC }), td(f.reason || (Number(f.rev) ? '정기 검토 개정' : '업무매뉴얼 제정'), rw[2]), td(f.author || f.dept, rw[3], { align: AC })]], rw, { header: true }));
  // 장·절
  const allCk = [];
  chaps.forEach((L, i) => {
    ch.push(P([R(`${i + 1}장  ${L.e} ${L.n}`, { size: 28, bold: true, color: C.white })], { before: 260, after: 100, keepNext: true, shading: { type: docx.ShadingType.CLEAR, color: 'auto', fill: C.navy }, border: { left: { style: docx.BorderStyle.SINGLE, size: 48, color: C.green, space: 6 } } }));
    items.filter(x => x.L.c === L.c).forEach((x, j) => {
      ch.push(P([R(`${i + 1}.${j + 1} `, { size: 22, bold: true, color: C.green }), R(x.S.n, { size: 22, bold: true, color: C.navy }), R(`  ${GRADE[x.S.g].label}`, { size: 16, bold: true, color: GRADE[x.S.g].color })], { before: 160, after: 60, keepNext: true, border: { bottom: { style: docx.BorderStyle.SINGLE, size: 6, color: 'B8C0CC', space: 2 } } }));
      const G = parseGrp(p.text[x.S.c]), m = p.media[x.S.c] || {};
      if (x.S.gen === 'scn') { G.forEach(g => { const sc = SCN.find(s => g.title.startsWith(s.id + ' ')); if (sc) { ch.push(scnCard(g, sc)); ch.push(P([R('')], { after: 40 })); } else ch.push(...grpParas([g])); }); }
      else if (x.S.gen === 'bad') { G.forEach(g => { const b = BAD.find(b => g.title.includes(b.t)); ch.push(sideTable(b ? { poster: b.k, vid: b.k } : {}, grpParas([g]), 2700)); }); }
      else if (x.S.gen === 'forms') {
        const fw = [1300, 2600, 4238, 1500];
        G.forEach(g => { if (g.title) ch.push(P([R('■ ' + g.title, { size: 19, bold: true, color: C.navy })], { before: 40, after: 30, keepNext: true }));
          ch.push(table([[th('서식번호', fw[0]), th('서식명', fw[1]), th('용도', fw[2]), th('보존 기간', fw[3])]].concat(g.lines.map(l => { const m = /^(F-[A-Z]+-\d+)\s+(.*?)\s+—\s+(.*?)(?:\s+\(보존 (.*)\))?$/.exec(l) || [0, '', l, '', '']; return [td(m[1], fw[0], { size: 16, bold: true, color: C.green, align: docx.AlignmentType.CENTER }), td(m[2], fw[1], { size: 17, bold: true }), td(m[3], fw[2], { size: 16 }), td(m[4] || '', fw[3], { size: 15 })]; })), fw, { header: true })); });
        ch.push(P([R('▶ 인쇄용 양식은 붙임 「업무 서식」에 수록', { size: 16, bold: true, color: C.green })], { before: 40, after: 40 }));
      }
      else if (x.S.gen === 'laws' || x.S.gen === 'indlaw') {
        const lw = [2700, 6938]; G.forEach(g => { if (g.title) ch.push(H2(g.title)); ch.push(table([[th('법령·조항', lw[0]), th('요지', lw[1])]].concat(g.lines.map(l => { const k = l.indexOf(':'); return [td(k > 0 ? l.slice(0, k) : l, lw[0], { size: 16, bold: true, color: C.navy }), td(k > 0 ? l.slice(k + 1).trim() : '', lw[1], { size: 16 })]; })), lw, { header: true })); });
      } else if (x.S.gen === 'check') { G.forEach(g => { if (/점검/.test(g.title)) { allCk.push(...g.lines); ch.push(sideTable(m, [checkTable(g.lines)], 2000)); } else ch.push(...grpParas([g])); }); }
      else if (x.S.gen === 'site' && p.site) {
        const s2 = p.site, w4 = [1500, 3319, 1500, 3319];
        ch.push(sideTable(m, [table([['사업장', s2.name, '지사', s2.br + '지사'], ['유형', s2.type, '업종', s2.work], ['근무형태', s2.shift, '인원', `${s2.total}명`]].map(r => [td(r[0], 1100, { fill: 'E8F5EC', bold: true, size: 16 }), td(r[1], 2300, { size: 16 }), td(r[2], 900, { fill: 'E8F5EC', bold: true, size: 16 }), td(r[3], 1300, { size: 16 })]), [1100, 2300, 900, 1300])].concat(grpParas(G.slice(1))), 2200));
        void w4;
      } else {
        const first = G.slice(0, 2), rest = G.slice(2);
        ch.push(sideTable(m, grpParas(first), m.fig ? 2300 : 2700));
        if (rest.length) ch.push(...grpParas(rest));
      }
      if (x.S.gen === 'core') G.filter(g => /확인/.test(g.title)).forEach(g => allCk.push(...g.lines));
      const ls = x.S.l.filter(id => LAWS[id] && p.lawOn[id] !== false);
      if (ls.length) ch.push(P([R('법적 근거  ', { bold: true, size: 15, color: C.navy }), R(lawShort(ls), { size: 15, color: C.gray })], { before: 40, after: 60 }));
    });
  });
  // 붙임
  ch.push(H1('붙임 1. 일일 점검표'));
  ch.push(P([R(`점검일 :            점검자 :            사업장 : ${p.where}`, { size: 18 })], { after: 60 }));
  ch.push(checkTable(uniq(allCk.length ? allCk : TEN_RULES)));
  ch.push(H1('붙임 2. 교육 확인서'));
  ch.push(P([R(`본인은 「${p.title}」(${p.docNo} · ${revLabel(p)})의 내용을 교육받고 이해하였으며 이를 준수할 것을 확인합니다.`, { size: 19 })], { after: 60 }));
  const ew = [700, 2000, 1800, 2000, 3138];
  ch.push(table([[th('No', ew[0]), th('성명', ew[1]), th('직책', ew[2]), th('교육일', ew[3]), th('서명', ew[4])]].concat(Array.from({ length: 10 }, (_, i) => [td(String(i + 1), ew[0], { align: AC }), td('', ew[1]), td('', ew[2]), td('', ew[3]), td('', ew[4])])), ew, { header: true }));
  ch.push(H1('붙임 3. 경위서 (6하원칙)'));
  const kw = [2200, 7438];
  ch.push(table([['작성자 (소속·성명)', ''], ['언제 (일시)', ''], ['어디서 (장소)', ''], ['누가 (관련자)', ''], ['무엇을 (발생 사실)', ''], ['어떻게 (경과·조치)', '\n\n'], ['왜 (원인)', ''], ['재발 방지 다짐', '\n']].map(r => [td(r[0], kw[0], { fill: C.silverL, bold: true }), td(r[1], kw[1])]), kw));
  ch.push(P([R('위 내용은 사실과 다름없음을 확인합니다.      년    월    일        작성자 :              (서명)', { size: 18 })], { before: 80, after: 80 }));
  const fIds = formIdsOf(p, items);
  if (fIds.length) { ch.push(new docx.Paragraph({ children: [new docx.PageBreak()] })); ch.push(H1(`붙임 4. 업무 서식 (${fIds.length}종)`));
    const fw2 = [1400, 3200, 5038]; ch.push(table([[th('서식번호', fw2[0]), th('서식명', fw2[1]), th('용도', fw2[2])]].concat(fIds.map(id => { const fm = FORMS.find(z => z.id === id); return [td(id, fw2[0], { size: 16, align: docx.AlignmentType.CENTER, color: C.green, bold: true }), td(fm.n, fw2[1], { size: 17, bold: true }), td(fm.pur, fw2[2], { size: 16 })]; })), fw2, { header: true }));
    fIds.forEach(id => ch.push(...formDoc(FORMS.find(z => z.id === id), p, false))); }
  ch.push(...imgPara(ASSET.fig.team, 2.2, 'The Best Choice, S-Tec — 매뉴얼대로 일하는 에스텍 그룹', ASSET.figDim.team));
  ch.push(P([R('- 끝 -', { size: 20, bold: true })], { align: AC, before: 120, after: 80 }));
  ch.push(P([R(`※ 법령·판례 요약은 실무 참고용입니다. 적용 전 원문과 노무 자문으로 확인하십시오. 영상 QR은 웹 주소(${APP.shareUrl})의 현장 영상으로 연결됩니다.  |  ${APP.name} ${APP.version}`, { size: 15, color: '8A93A3' })], { align: AC }));
  return await packDocx(ch, p.title);
}

/* =====================================================================
 * 업무매뉴얼 — PPT·PDF 슬라이드
 * ===================================================================== */
function buildManSlides(p) {
  const f = p.f, S = [], items = outItems(p); let no = 1;
  JOB_NAME[jobKey(p)] = p.J.n;
  const chaps = uniq(items.map(x => x.L.c)).map(c => MAN.find(L => L.c === c));
  S.push(coverSlide({ eyebrow: `${APP.org}  ·  ${p.lv.n}  ·  ${p.docNo}`, title: p.title, lines: [p.where, `${f.level === 'L1' ? '전 직종 공통' : p.J.n}${f.level === 'L3' ? ' × ' + p.I.n : ''} · ${chaps.length}장 ${items.length}절`],
    meta: `${fmtD(p.made)}   |   ${revLabel(p)}   |   시행 ${fmtD(p.eff)}`, badge: '업무매뉴얼', badgeColor: C.green, fig: f.level === 'L1' ? 'team_dio' : figName('dio', jobKey(p)) })); no++;
  // 목차
  { const o = frame('목차', `CONTENTS · ${p.lv.n}`, no, p), colN = Math.ceil(chaps.length / 2);
    chaps.forEach((L, i) => { const col = i < colN ? 0 : 1, row = col ? i - colN : i, x = 1.0 + col * 6.0, y = 1.7 + row * (4.7 / Math.max(colN, 1));
      o.push(Rc(x, y, 0.85, 0.6, i % 2 ? K.tint : K.tintG, { k: 'para' })); o.push(T(x, y, 0.85, 0.6, String(i + 1).padStart(2, '0'), { pt: 19, bold: true, color: i % 2 ? K.navy : C.green, align: 'center', valign: 'middle' }));
      o.push(T(x + 1.0, y, 4.8, 0.6, [{ text: `${L.e} ${L.n}`, bold: true }, { text: items.filter(z => z.L.c === L.c).map(z => z.S.n).join(' · '), size: 0.6, color: C.gray }], { max: 17, min: 9, valign: 'middle', gap: 1 })); });
    S.push(o); no++; }
  chaps.forEach((L, ci) => {
    const its = items.filter(x => x.L.c === L.c), sec = String(ci + 1).padStart(2, '0');
    // 장 표지
    { const m0 = p.media[its[0].S.c] || {}, o = [];
      o.push(Rc(0, 0, SW, SH, C.white)); o.push(Rc(0, 0, 0.12, SH, K.ink)); o.push(Rc(0.12, 0, 0.05, SH, C.green));
      o.push(Rc(6.6, 0, SW - 6.6, SH, '0F1530'));
      const jp = JOB_POSTERS[f.job] || ['sec1'], pk = { MA: 'pt', MB: jp[0], MC: f.job === 'cln' ? 'cln' : 'sec2', MD: VIDEO_OF[jobKey(p)], ME: IND_POSTER[f.ind], MF: f.job === 'sec' ? 'union' : 'fac', MG: 'spc', MH: 'off', MI: 'off2', MJ: jp[jp.length - 1] }[L.c] || m0.poster || VIDEO_OF[jobKey(p)];
      o.push(Im(6.6, 1.55, SW - 6.6, (SW - 6.6) * 9 / 16, posterOf(pk)));
      o.push(T(0.9, 1.2, 5.5, 1.0, [{ text: `CHAPTER ${sec}`, bold: true }], { pt: 16, color: C.green }));
      o.push(T(0.9, 1.8, 5.6, 1.5, [{ text: `${L.e} ${L.n}`, bold: true }], { max: 38, min: 22, color: K.ink }));
      o.push(Rc(0.9, 3.35, 0.9, 0.05, C.green));
      o.push(T(0.9, 3.55, 5.5, 2.6, its.map((x, j) => ({ text: `${ci + 1}.${j + 1}  ${x.S.n}` })), { max: 15, min: 9, color: '3A4366', gap: 5 }));
      o.push(figBox(figName('cute', jobKey(p)), 4.9, 5.3, 1.5, 1.9));
      o.push(Im(SW - 1.95, 0.36, 1.45, 1.45 * 340 / 900, ASSET.logo));
      S.push(o); no++; }
    its.forEach((x, j) => {
      const G = parseGrp(p.text[x.S.c]), m = p.media[x.S.c] || {}, ttl = `${sec}  ${ci + 1}.${j + 1} ${x.S.n}`;
      if (x.S.gen === 'scn') {
        G.forEach(g => { const sc = SCN.find(s => g.title.startsWith(s.id + ' ')); if (!sc) return;
          const o = frame(`${sec}  🚨 ${g.title}`, `${x.S.n} · 상황별 대처`, no, p);
          o.push(Rc(0.6, 1.6, 5.5, 3.1, '0F1530'));
          o.push(sc.vid ? Vd(0.62, 1.62, 5.46, 3.07, sc.vid) : Im(0.62, 1.62, 5.46, 3.07, posterOf(sc.media)));
          const sit = (g.lines.find(l => /^상황:/.test(l)) || '').replace(/^상황:\s*/, '');
          o.push(Rc(0.6, 4.8, 5.5, 0.85, K.tint, { line: K.line })); o.push(T(0.75, 4.83, 5.25, 0.8, [{ text: '상황', bold: true, color: K.navy }, { text: sit, size: 0.9 }], { max: 12.5, min: 8, gap: 1 }));
          const qr = qrPng(vidUrl(sc.vid || VIDEO_OF[jobKey(p)]), 200); if (qr) { o.push(Im(0.6, 5.75, 0.75, 0.75, qr)); o.push(T(1.45, 5.8, 4.6, 0.65, [{ text: sc.vid ? '▶ PPT에서 영상 재생 · QR로 휴대폰 시청' : '▶ QR: 직종 근무 영상', bold: true, color: C.green }, { text: `보고: ${sc.rep}`, size: 0.85, color: K.ink }], { max: 11, min: 8, gap: 1 })); }
          const steps = g.lines.filter(l => /^대처/.test(l)).map(l => l.replace(/^대처 \d+\.\s*/, '')), dont = g.lines.filter(l => /^금지/.test(l)).map(l => l.replace(/^금지:\s*/, ''));
          const area = dont.length ? 3.75 : 4.75, hS = Math.min(0.85, (area - 0.08 * (steps.length - 1)) / Math.max(1, steps.length));
          steps.forEach((t, k) => { const y = 1.6 + k * (hS + 0.08); o.push(Rc(6.35, y, 6.4, hS, k % 2 ? 'F7F9FC' : C.white, { line: K.line })); o.push(Rc(6.35, y, 0.5, hS, k % 2 ? K.blu : C.green)); o.push(T(6.35, y, 0.5, hS, [{ text: String(k + 1), bold: true }], { pt: 14, color: C.white, align: 'center', valign: 'middle' })); o.push(T(6.95, y + 0.02, 5.7, hS - 0.04, t, { max: 13, min: 8, valign: 'middle' })); });
          if (dont.length) { o.push(Rc(6.35, 5.45, 6.4, 1.0, 'FDF1EF', { line: 'F2B8AE' })); o.push(T(6.55, 5.5, 6.1, 0.9, [{ text: '하지 마세요', bold: true, color: C.brick }].concat(dont.map(t => ({ text: '✕  ' + t, size: 0.9 }))), { max: 12, min: 8, gap: 2 })); }
          S.push(o); no++; });
        return;
      }
      if (x.S.gen === 'forms') {
        const ids = []; G.forEach(g => g.lines.forEach(l => { const m = /^(F-[A-Z]+-\d+)/.exec(l); if (m && FORMS.find(z => z.id === m[1])) ids.push(m[1]); }));
        for (let k = 0; k < ids.length; k += 6) {
          const o = frame(`${ttl}${ids.length > 6 ? ` (${k / 6 + 1}/${Math.ceil(ids.length / 6)})` : ''}`, `${L.e} ${L.n} · 인쇄용 양식은 Word 붙임 「업무 서식」 수록`, no, p);
          ids.slice(k, k + 6).forEach((id, i) => { const fm = FORMS.find(z => z.id === id), cx = 0.6 + (i % 3) * 4.1, cy = 1.6 + Math.floor(i / 3) * 2.45, cw = 3.95, chh = 2.3;
            o.push(Rc(cx, cy, cw, chh, C.white, { line: K.line })); o.push(Rc(cx, cy, cw, 0.5, K.navy)); o.push(Rc(cx, cy, 0.08, chh, C.green));
            o.push(T(cx + 0.18, cy, cw - 0.25, 0.5, [{ text: `${fm.id}  ${fm.n}`, bold: true }], { max: 12.5, min: 8.5, color: C.white, valign: 'middle' }));
            o.push(T(cx + 0.18, cy + 0.55, cw - 0.3, 0.5, fm.pur, { max: 10.5, min: 7.5, color: K.ink }));
            const tw = cw - 0.36, tot = fm.cols.reduce((a, c) => a + c[1], 0); let xx = cx + 0.18;
            fm.cols.forEach(c => { const ww = tw * c[1] / tot; o.push(Rc(xx, cy + 1.1, ww, 0.34, K.tintG, { line: 'CFE6D7' })); o.push(T(xx + 0.02, cy + 1.1, ww - 0.04, 0.34, c[0], { max: 7.5, min: 5, align: 'center', valign: 'middle', color: C.greenD, bold: true })); xx += ww; });
            for (let r = 0; r < 3; r++) o.push(Rc(cx + 0.18, cy + 1.44 + r * 0.22, tw, 0.22, r % 2 ? 'F7F9FC' : C.white, { line: 'E3E7ED' }));
            o.push(T(cx + 0.18, cy + 2.1, cw - 0.3, 0.2, `보존 ${fm.keep}`, { pt: 7.5, color: K.mute })); });
          S.push(o); no++;
        }
        return;
      }
      if (x.S.gen === 'bad') {
        G.forEach(g => { const b = BAD.find(b => g.title.includes(b.t)); if (!b) return;
          const o = frame(`${sec}  ${g.title}`, '이런 행동은 안 됩니다 — Complaint 사례 영상(고객 불만 유발)', no, p);
          o.push(Rc(0.6, 1.6, 7.5, 4.25, '0F1530')); o.push(Vd(0.65, 1.65, 7.4, 4.15, b.k));
          o.push(Rc(0.6, 1.6, 1.35, 0.42, C.brick)); o.push(T(0.6, 1.6, 1.35, 0.42, [{ text: '❌ 잘못된 예', bold: true }], { pt: 11, color: C.white, align: 'center', valign: 'middle' }));
          o.push(Rc(8.35, 1.6, 4.4, 2.05, 'FDF1EF', { line: 'F2B8AE' })); o.push(T(8.55, 1.7, 4.0, 1.9, [{ text: '왜 문제인가', bold: true, color: C.brick }, { text: b.why }], { max: 14, min: 9, gap: 4 }));
          o.push(Rc(8.35, 3.8, 4.4, 2.05, K.tintG, { line: 'CFE6D7' })); o.push(T(8.55, 3.9, 4.0, 1.9, [{ text: '⭕ 바른 행동', bold: true, color: C.greenD }, { text: b.fix }], { max: 14, min: 9, gap: 4 }));
          o.push(T(0.6, 5.95, 12, 0.4, '▶ PPT에서 영상 재생 (PDF는 대표 장면) — 신규 배치·직무교육 때 함께 시청', { pt: 10.5, color: K.mute }));
          S.push(o); no++; });
        return;
      }
      const paras = listParas(G, { hcolor: C.greenD });
      const hasM = m.fig || m.poster, tw = hasM ? 7.3 : 12.1, tx = hasM ? 5.45 : 0.6;
      const pages = paginate(paras, tw - 0.3, 4.6, 10.5);
      pages.forEach((pg, k) => {
        const o = frame(`${ttl}${pages.length > 1 ? ` (${k + 1}/${pages.length})` : ''}`, `${L.e} ${L.n} · ${GRADE[x.S.g].label}`, no, p);
        if (hasM) {
          if (m.fig) { o.push(Rc(0.6, 1.6, 4.6, 4.85, 'F3F5F8')); o.push(figBox(m.fig, 0.75, 1.7, 4.3, 4.1)); }
          else { o.push(Rc(0.6, 1.6, 4.6, 2.62, '0F1530')); o.push(k === 0 && m.vid ? Vd(0.62, 1.62, 4.56, 2.58, m.vid) : Im(0.62, 1.62, 4.56, 2.58, posterOf(m.poster)));
            o.push(figBox(figName('cute', jobKey(p)), 0.6, 4.35, 1.55, 2.0));
            const qr = qrPng(vidUrl(m.vid || VIDEO_OF[jobKey(p)]), 200); if (qr) { o.push(Im(2.35, 4.45, 0.95, 0.95, qr)); o.push(T(3.4, 4.45, 1.8, 0.95, [{ text: '▶ 영상 QR', bold: true, color: C.green }, { text: '휴대폰 카메라로 시청', size: 0.8, color: K.mute }], { max: 11, min: 8, valign: 'middle' })); } }
          if (m.fig) { const qr = qrPng(vidUrl(m.vid || VIDEO_OF[jobKey(p)]), 200); if (qr) { o.push(Im(4.35, 5.6, 0.75, 0.75, qr)); } }
        }
        o.push(Rc(tx, 1.6, tw, 4.85, C.white, { line: K.line })); o.push(Rc(tx, 1.6, tw, 0.06, GRADE[x.S.g].color));
        o.push(T(tx + 0.2, 1.75, tw - 0.35, 4.6, pg, { max: 15, min: 9 }));
        const ls = x.S.l.filter(id => LAWS[id]); if (ls.length) o.push(T(0.6, 6.52, 12.1, 0.28, '법적 근거: ' + lawShort(ls), { max: 9.5, min: 7, color: '8A93A3' }));
        S.push(o); no++;
      });
    });
  });
  S.push(videoSlide(p, no, `현장 교육 — ${p.J.n} 근무 영상`, '신규 배치·직무교육 · 매뉴얼과 함께 시청', null, TEN_RULES.slice(0, 5), jobKey(p))); no++;
  S.push(closingSlide({ fig: 'team', tag: '매뉴얼대로 일하고, 기록으로 증명합니다 — 어느 현장에서나 같은 품질을 약속드립니다.', org: `${APP.org}  ·  ${f.dept}` }));
  return S;
}
