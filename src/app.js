/* =====================================================================
 * Program for Process Standardization and Manual Creation v1.0.0 — 앱 로직
 * 에스텍 그룹 업무표준화·매뉴얼 제작 시스템 (Program for Process Standardization and Manual Creation)
 * Program & Design by Rat Rae Choi (제작자 서명 — 하드코딩)
 * ===================================================================== */
const APP = {
  name: 'Program for Process Standardization and Manual Creation',
  ko: '업무표준화·매뉴얼 제작 시스템',
  en: 'Program for Process Standardization and Manual Creation',
  version: 'v1.5.0',
  build: '2026-11-15',
  shareUrl: 'https://sadness500-boop.github.io/Program-for-Process-Standardization-and-Manual-Creation/',
  apkUrl: 'https://github.com/sadness500-boop/Program-for-Process-Standardization-and-Manual-Creation/releases/download/app-latest/stos-latest.apk',
  repo: 'https://github.com/sadness500-boop/Program-for-Process-Standardization-and-Manual-Creation',
  maker: 'Rat Rae Choi',
  makerKo: '제작 · Rat Rae Choi',
  org: '에스텍 그룹',
  branch: '에스텍베스트 동부지사'
};
const K = { ink: '18224F', navy: '22348F', mute: '4B5563', line: 'E3E7EE', tint: 'F4F6FB', tintG: 'EEF7F1', red: 'C8553D', grn: '2E8B57', grn2: '3A9D6A', blu: '2B4C9B', blu2: '1F3A73', amber: 'D98E04' };
const C = { navy: '0B1F8F', navyD: '07124F', green: '1E8B3A', greenD: '17552F', brick: 'E34234', silver: 'C9CED6', silverL: 'EEF1F5', ink: '1C2333', gray: '5B6475', white: 'FFFFFF' };
const state = { picked: [], plan: null, sigDataUrl: null, sigPx: 0, site: null, job: 'sec', code: '', kind: 'std', level: 'L2' };

/* ---------- 유틸 ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const uniq = a => [...new Set(a.filter(Boolean))];
const pad = n => String(n).padStart(2, '0');
function kstNow() { const d = new Date(); return new Date(d.getTime() + (d.getTimezoneOffset() + 540) * 60000); }
function parseD(s) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], m[2] - 1, +m[3]) : kstNow(); }
const WK = ['日', '月', '火', '水', '木', '金', '土'];
const WKK = ['일', '월', '화', '수', '목', '금', '토'];
function fmtD(d) { return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}(${WKK[d.getDay()]})`; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function b64ToU8(b64) { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
function dataUrlB64(u) { return u.split(',')[1]; }
async function download(blob, name) {
  // 안드로이드 앱(APK, Capacitor): 파일을 만든 뒤 저장·보내기 창(근태관리 프로그램과 같은 방식)
  const P = window.Capacitor && window.Capacitor.Plugins;
  if (P && P.Filesystem) {
    try {
      const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
      const w = await P.Filesystem.writeFile({ path: name, data: b64, directory: 'CACHE' });
      if (P.Share) await P.Share.share({ title: name, files: [w.uri], dialogTitle: '파일 저장·보내기' });
      else toast('파일을 만들었습니다: ' + name);
      return;
    } catch (e) { if (e && /cancel/i.test(String(e.message || e))) return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
function toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), ms); }
function safeName(s) { return String(s || '').replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40); }

/* ---------- 바닥글 서명: 실행일 날짜를 Dancing Script로 다시 그림 ---------- */
async function buildSignature(date) {
  const ff = new FontFace('DancingSig', `url(data:font/woff2;base64,${ASSET.dancing})`);
  try { await ff.load(); document.fonts.add(ff); } catch (e) { }
  const base = await loadImg(ASSET.sigBase);
  const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const txt = `${M[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  const S = 4, cv = document.createElement('canvas'), ctx = cv.getContext('2d');
  ctx.font = `${72 * S}px DancingSig`;
  const tw = ctx.measureText(txt).width / S;
  const W = Math.ceil(1389 + tw + 24), H = 210;
  cv.width = W * S; cv.height = H * S;
  ctx.drawImage(base, 0, 0, base.width * S, base.height * S);
  ctx.font = `${72 * S}px DancingSig`; ctx.fillStyle = '#8A1C34'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(txt, 1389 * S, 138 * S);
  const out = document.createElement('canvas'); out.width = W; out.height = H;
  const o = out.getContext('2d'); o.imageSmoothingQuality = 'high'; o.drawImage(cv, 0, 0, W, H);
  state.sigDataUrl = out.toDataURL('image/png'); state.sigPx = W;
  // 날짜 없는 서명(업무 서식용): "Document prepared by RatRae Choi"까지만
  const NW = 1290, nd = document.createElement('canvas'); nd.width = NW; nd.height = H; nd.getContext('2d').drawImage(base, 0, 0);
  state.sigNoDate = nd.toDataURL('image/png'); state.sigNoDatePx = NW;
}
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
/* =====================================================================
 * 1) 화면 — 표준 분류 트리 / 작성 정보 / 추천
 * ===================================================================== */
const MAX_PICK = 80;
const TAXV = () => state.kind === 'man' ? MAN : STD;
function flatV() { const o = []; TAXV().forEach(L => L.mids.forEach(M => M.smalls.forEach(S => o.push({ L, M, S })))); return o; }
function findSmall(code) { for (const T0 of [STD, MAN]) for (const L of T0) for (const M of L.mids) for (const S of M.smalls) if (S.c === code) return { L, M, S }; return null; }
function manPack(level) { return MAN_PACK[level].flatMap(c => c === 'MF-*' ? flatV().filter(x => x.L.c === 'MF').map(x => x.S.c) : c === 'MT-*' ? flatV().filter(x => x.L.c === 'MT' && x.S.jobs.includes(state.job)).map(x => x.S.c) : [c]); }
function isRec(S) { if (state.kind === 'man') return manPack(state.level).includes(S.c); const pk = PACK.common.concat(PACK[state.job] || []); return pk.includes(S.c) || (S.jobs && S.jobs.includes(state.job)); }
function renderTree(filter = '') {
  const f = filter.trim();
  const box = $('#tree'); let h = '';
  TAXV().forEach(L => {
    let lh = '', nOn = 0;
    L.mids.forEach(M => {
      const smalls = M.smalls.filter(S => (!S.sop || S.jobs.includes(state.job)) && (!f || (S.n + M.n + L.n + S.k.join(' ') + S.c).includes(f)));
      if (!smalls.length) return;
      nOn += smalls.filter(S => state.picked.includes(S.c)).length;
      const flatM = L.mids.length === 1 && M.c === L.c;
      lh += (flatM ? '<ul class="flatm">' : `<details class="mid" ${f || smalls.some(S => state.picked.includes(S.c)) ? 'open' : ''}><summary><b>${M.c}</b> ${esc(M.n)} <i>${smalls.length}</i></summary><ul>`) +
        smalls.map(S => `<li class="sm ${state.picked.includes(S.c) ? 'on' : ''} ${S.jobs && !S.jobs.includes(state.job) ? 'dim' : ''}" data-c="${S.c}"><span class="sev g${S.g}">${GRADE[S.g].label}</span><span class="nm">${esc(S.n)}${isRec(S) ? ' <b class="rec" title="선택한 직종의 권장 표준">★</b>' : ''}${S.int ? ' <small class="int">내부</small>' : ''}${S.gen && state.kind !== 'man' ? ' <small class="lnk">연계</small>' : ''}${S.gen === 'scn' || S.gen === 'bad' ? ' <small class="lnk">영상</small>' : ''}</span><em>${S.c}</em></li>`).join('') + (flatM ? '</ul>' : '</ul></details>');
    });
    if (lh) h += `<details class="big" ${f || nOn ? 'open' : ''}><summary><span class="ic">${L.e}</span><b>${L.c}.</b> ${esc(L.n)}${nOn ? ` <span class="cnt">${nOn}</span>` : ''}</summary>${lh}</details>`;
  });
  box.innerHTML = h || '<p class="empty">검색 결과가 없습니다.</p>';
}
function togglePick(code, quiet) {
  const i = state.picked.indexOf(code);
  if (i >= 0) state.picked.splice(i, 1);
  else { if (state.picked.length >= MAX_PICK) { if (!quiet) toast(`표준 항목은 최대 ${MAX_PICK}개까지 선택할 수 있습니다.`); return; } state.picked.push(code); }
  sortPicked(); if (!quiet) { renderTree($('#q').value); renderPicked(); }
}
function sortPicked() { const order = flatV().map(x => x.S.c); state.picked.sort((a, b) => order.indexOf(a) - order.indexOf(b)); }
function renderPicked() {
  const box = $('#picked');
  if (!state.picked.length) { box.innerHTML = '<span class="hint">② 분류에서 표준 항목을 고르거나 [📦 직종 권장 패키지]를 누르세요.</span>'; $('#pickCnt').textContent = '0'; return; }
  box.innerHTML = state.picked.map(c => { const x = findSmall(c); return `<span class="chip g${x.S.g}" title="${esc(x.L.n + ' > ' + x.M.n)}">${x.S.c} ${esc(x.S.n)}<button data-x="${c}" aria-label="빼기">×</button></span>`; }).join('');
  $('#pickCnt').textContent = state.picked.length;
}
function pickPackage() {
  const pk = state.kind === 'man' ? manPack(state.level) : uniq(PACK.common.concat(PACK[state.job] || [])); let n = 0;
  pk.forEach(c => { if (!state.picked.includes(c) && state.picked.length < MAX_PICK) { state.picked.push(c); n++; } });
  sortPicked(); renderTree($('#q').value); renderPicked();
  toast(n ? (state.kind === 'man' ? `${MAN_LEVEL[state.level].n} 권장 구성 ${n}개 절을 선택했습니다.` : `${JOB[state.job].n} 권장 표준 ${n}개를 선택했습니다.`) : '권장 항목이 이미 모두 선택되어 있습니다.');
}
function suggest() {
  const txt = ($('#f_special').value + ' ' + $('#f_reason').value).toLowerCase();
  if (txt.trim().length < 2) return toast('사업장 특이사항·고객사 요구를 먼저 입력하세요.');
  const scored = flatV().map(x => ({ x, sc: x.S.k.reduce((a, k) => a + (txt.includes(k.toLowerCase()) ? (k.length >= 3 ? 2 : 1) : 0), 0) })).filter(o => o.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, 8);
  const box = $('#sugg');
  if (!scored.length) { box.innerHTML = '<span class="hint">일치하는 표준이 없습니다. ② 분류에서 직접 선택하세요.</span>'; return; }
  box.innerHTML = '<span class="lbl">추천</span>' + scored.map(o => `<button class="sg" data-c="${o.x.S.c}">${o.x.S.c} ${esc(o.x.S.n)} <small>${'●'.repeat(Math.min(3, o.sc))}</small></button>`).join('');
}
/* 직종 · 산업 · 근무형태 */
function renderJobChips() {
  $('#jobChips').innerHTML = JOB_ORDER.map(k => `<button type="button" data-job="${k}" aria-pressed="${k === state.job}">${JOB[k].e} ${JOB[k].n}</button>`).join('');
}
function codesFor(job) { const pre = JOB[job].ams; return AMS_CODES.filter(c => c.job === pre || (pre === 'ETC' && (c.job === 'ETC' || c.job === 'MGR'))); }
function renderCodes() {
  const list = codesFor(state.job), sel = $('#f_code');
  if (!list.find(c => c.id === state.code)) state.code = (list[0] || {}).id || '';
  sel.innerHTML = list.map(c => `<option value="${c.id}" ${c.id === state.code ? 'selected' : ''}>${esc(c.id)} · ${esc(c.name.replace(/^\S+\s/, ''))} (${c.ltype})</option>`).join('') || '<option value="">(해당 직종 코드 없음)</option>';
  const c = list.find(x => x.id === state.code); $('#codeInfo').innerHTML = c ? codeInfoHtml(c) : '';
}
function codeInfoHtml(c) { const m = shiftMetrics(c); return `<b>${esc(c.seq.split('').join(' '))}</b> 순환 ${m.len}일 · 월 근무 ${m.days.toFixed(1)}일 · 월 실근로 ${m.hours.toFixed(0)}h · 주 평균 ${m.week.toFixed(1)}h · 24시간 초소 ${m.crews}조${m.warn ? ` <span class="warn">⚠ ${esc(m.warn)}</span>` : ''}`; }
function setJob(k, silent) {
  if (!JOB[k]) return; state.job = k; renderJobChips(); renderCodes(); renderTree($('#q').value); autoTitle();
  if (!silent) toast(`적용 직종: ${JOB[k].n} — ★ 표시가 권장 표준입니다.`);
}
function autoTitle() { const t = $('#f_title'); if (!t || t.dataset.touched) return; const J = JOB[state.job].n, I = IND[($('#f_ind') || {}).value || 'etc'].n, cl = $('#f_client').value;
  t.value = state.kind !== 'man' ? `${J} 업무표준서${cl ? ' — ' + cl : ''}` : state.level === 'L1' ? '용역회사 운영 통합매뉴얼' : state.level === 'L2' ? `${J} 통합 업무매뉴얼` : state.level === 'L3' ? `${J} × ${I} 업무매뉴얼` : `${cl || '사업장'} ${J} 근무지침`; }
function setKind(k, silent) {
  state.kind = k; state.picked = [];
  document.querySelectorAll('[data-kind]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === k)));
  document.body.classList.toggle('mode-man', k === 'man');
  $('#treeTitle').textContent = k === 'man' ? '업무매뉴얼 장 · 절 선택' : '업무표준 항목 선택';
  $('#btnGen').textContent = k === 'man' ? '📘 업무매뉴얼 생성' : '⚙ 업무표준안 생성';
  $('#btnPack').textContent = k === 'man' ? '📦 계층 권장 구성' : '📦 직종 권장 패키지';
  $('#q').placeholder = k === 'man' ? '🔍 장·절·상황 검색 (예: 화재, 폭언, 순찰, 판례)' : '🔍 표준·키워드 검색 (예: 순찰, 휴게, 연차, 감정노동)';
  $('#outTitle').textContent = k === 'man' ? '업무매뉴얼 검토 · 출력' : '업무표준안 검토 · 출력';
  const t = $('#f_title'); if (t) delete t.dataset.touched; autoTitle(); renderTree($('#q').value); renderPicked();
  if (!silent) { if (k === 'man') pickPackage(); toast(k === 'man' ? '업무매뉴얼 제작 — Manual-Project 4계층 체계 · 사진·영상 포함' : '업무표준서 제작'); }
}
function jobFromWork(w) { w = w || ''; return /보안|경비/.test(w) ? 'sec' : /미화/.test(w) ? 'cln' : /주차/.test(w) ? 'prk' : /시설/.test(w) ? 'fac' : null; }

function readForm() {
  const g = id => ($('#' + id).value || '').trim();
  return {
    client: g('f_client'), title: g('f_title'), ind: g('f_ind') || 'etc', code: g('f_code'), rev: g('f_rev') || '0', eff: g('f_eff'),
    dept: g('f_dept') || APP.branch, author: g('f_author'), reviewer: g('f_reviewer'), approver: g('f_approver'),
    special: g('f_special'), reason: g('f_reason'), mode: document.querySelector('input[name=mode]:checked').value,
    job: state.job, siteObj: state.site, level: state.level, kind: state.kind
  };
}

/* =====================================================================
 * 2) 연계 계산 — 근무형태 지표 · 업무량 · 타임테이블 · 견적 기준
 * ===================================================================== */
const hm = s => { const [h, m] = String(s || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
const fmtHM = m => `${pad(Math.floor(((m % 1440) + 1440) % 1440 / 60))}:${pad(((m % 60) + 60) % 60)}`;
function spanH(t) { if (!t) return 0; let a = hm(t.s), b = hm(t.e); if (b <= a) b += 1440; return (b - a) / 60; }
function shiftMetrics(c) {
  const seq = c.seq || 'A', len = seq.length, cnt = s => seq.split('').filter(x => x === s).length;
  const nA = cnt('A'), nB = cnt('B'), nK = cnt('K'), work = nA + nB + nK;
  let hrs = 0; [['A', nA], ['B', nB], ['K', nK]].forEach(([s, n]) => { const t = c.times[s] || c.times.A; if (t && n) hrs += n * (spanH(t) - (t.b || 0)); });
  const perCycle = hrs, days = 30.4 * work / len, hours = perCycle * 30.4 / len, week = perCycle * 7 / len;
  const day = nA + nK ? Math.ceil(len / (nA + nK)) : 0, night = nB + nK ? Math.ceil(len / (nB + nK)) : 0;
  const crews = Math.max(day, night, 1);
  let warn = '';
  if (c.ltype !== '감시단속' && week > 52) warn = '일반직 주 평균 52시간 초과 — 근무형태·근로형태 재검토';
  else if (c.ltype !== '감시단속' && week > 40) warn = `주 ${(week - 40).toFixed(1)}h 연장근로 합의 필요`;
  else if (c.ltype === '감시단속') warn = '감시·단속적 근로 승인 필요';
  return { len, work, days, hours, week, crews, nA, nB, nK, warn };
}
const WBE_DAYS = { sec: () => 30.4, clean: k => ({ hospital: 30.4, retail: 30.4, training: 30.4, apt: 26 }[k] || 22), park: k => ({ retail: 30.4, hospital: 30.4, apt: 30.4, building: 26 }[k] || 22), fac: k => ({ hospital: 30.4, power: 30.4, apt: 26 }[k] || 22), etc: k => ({ hospital: 26, retail: 30.4, training: 30.4 }[k] || 22) };
const PER_N = { d: '매일', w: '매주', m: '매월', q: '분기', y: '매년' };
function sopRows(job, ind) {
  const jw = JOB[job].wbe, iw = IND[ind].wbe, ii = WBE.inds.findIndex(x => x[0] === iw);
  const days = WBE_DAYS[jw](iw), mult = per => per === 'd' ? days : per === 'w' ? 365 / 7 / 12 : per === 'm' ? 1 : per === 'q' ? 1 / 3 : 1 / 12;
  const rows = [];
  (WBE.tasks[jw] || []).forEach(t => {
    const q = t.qs[ii]; if (!q) return;
    const mon = t.m * q[0] * q[1] * mult(t.per);
    rows.push({ big: t.p[0] || '', mid: t.p[1] || '', small: t.p.slice(2).join(' › '), n: t.n, min: t.m, qty: q[0], unit: t.u, freq: q[1], per: t.per, post: t.post, g: t.g, mon });
  });
  const total = rows.reduce((a, r) => a + r.mon, 0) / 60;
  const avail = 40 * 365 / 7 / 12 * 0.94;            // 1인 월 가용시간(주40h, 비가동 6%)
  const byBig = {}; rows.forEach(r => byBig[r.big] = (byBig[r.big] || 0) + r.mon / 60);
  return { rows, total, fte: total / avail, avail, days, byBig, wbeJob: jw, wbeInd: iw };
}
/* 직종별 시간대 업무 틀 — 근무 시작~종료 비율 위치 */
const ROUTINE = {
  sec: [[0, '근무 인수인계 · 장비·무전 점검 · TBM'], [0.04, '출입통제(출근 시간대 집중) · 차량·방문객 확인'], [0.2, '정기순찰 1회차(외곽·건물 내부·체크포인트)'], [0.35, '출입통제 · 반출입 확인 · CCTV 감시'], [0.6, '정기순찰 2회차 · 소방·전기 이상 유무 확인'], [0.75, '출입통제(퇴근 시간대) · 택배·우편 처리'], [0.88, '문단속·소등·전열기구 확인 순찰'], [0.96, '근무일지 마감 · 미결 사항 인계']],
  cln: [[0, '출근 · 복장·장비·약품 점검 · TBM'], [0.03, '화장실 1차 청소·소모품 보충'], [0.15, '공용부(로비·복도·계단) 바닥 청소'], [0.35, '사무공간 청소 · 쓰레기 수거'], [0.55, '화장실 2차 순회 점검'], [0.68, '정기청소(유리·왁스·카펫 등 주간 계획분)'], [0.85, '화장실 3차 순회 · 분리배출 정리'], [0.95, '장비 세척·정리 · 청소 점검표 마감']],
  prk: [[0, '인수인계 · 정산기·차단기 작동 확인'], [0.05, '출근 차량 유도(혼잡 시간대)'], [0.25, '주차장 순찰 · 불법·장기 주차 계도'], [0.45, '방문 차량 정산·안내'], [0.65, '주차장 순찰 · 시설 이상 확인'], [0.8, '퇴근 차량 유도(혼잡 시간대)'], [0.95, '정산 마감 · 관제 일지 정리']],
  fac: [[0, '인수인계 · 중앙감시반 상태 확인 · TBM'], [0.05, '전기실·기계실 일상점검'], [0.25, '냉난방·환기 설비 운전 조정'], [0.4, '고장 접수 처리 · 응급 수리'], [0.6, '소방·승강기 설비 순회 점검'], [0.75, '에너지 검침·기록 · 외부 업체 작업 입회'], [0.92, '설비 일지·이력카드 정리 · 인계']],
  info: [[0, '근무 준비 · 방문객 대장·방문증 점검'], [0.03, '출근 시간대 로비 안내'], [0.2, '방문객 접수·방문증 발급 · 전화 응대'], [0.45, '회의·행사 안내 지원'], [0.65, '방문객 접수 · 분실물 처리'], [0.9, '방문증 회수 확인 · 일지 마감']],
  cook: [[0, '위생 점검(복장·손씻기) · 식재료 검수'], [0.1, '전처리·조리'], [0.35, '배식 · 보존식 채취'], [0.5, '퇴식·식기 세척·소독'], [0.65, '다음 식사 준비 · 재고 확인'], [0.85, '조리장 청소 · 온도 기록 · 위생점검표']],
  san: [[0, '작업 계획 확인 · 약품·보호구 점검 · TBM'], [0.1, '구역별 소독 작업(사용자 고지·환기)'], [0.4, '해충 트랩 점검·교체'], [0.6, '취약구역 방제 작업'], [0.85, '소독대장 기록 · 소독증명서 작성 · 장비 정리']]
};
function timetable(job, c) {
  if (!c) return [];
  const sym = (c.seq.match(/[ABK]/) || ['A'])[0];
  const out = [];
  ['A', 'B', 'K'].filter(s => c.seq.includes(s)).forEach(s => {
    const t = c.times[s] || c.times.A; if (!t) return;
    const st = hm(t.s), span = spanH(t) * 60, br = (t.b || 0) * 60;
    const label = { A: '주간', B: '야간', K: '격일(24h)' }[s];
    out.push({ head: `${label} 근무  ${t.s} ~ ${t.e}  (휴게 ${t.b || 0}h)` });
    out.push({ t: fmtHM(st - 10), a: '근무 10분 전 도착 · 복장·장비 점검 · 대면 인수인계' });
    const R = ROUTINE[job] || ROUTINE.sec;
    const breaks = br >= 120 ? [[0.45, br / 2], [0.8, br / 2]] : [[0.5, br]];
    const ev = R.map(([f, a]) => ({ m: st + Math.round(f * span / 10) * 10, a })).concat(breaks.filter(b => b[1] > 0).map(([f, d]) => ({ m: st + Math.round(f * span / 10) * 10, a: `휴게 ${Math.round(d)}분 (대체 근무자 지정 · 휴게 장소 이용)`, br: 1 })));
    ev.sort((a, b) => a.m - b.m).forEach(e => out.push({ t: fmtHM(e.m), a: e.a, br: e.br }));
    out.push({ t: fmtHM(st + span), a: '근무 종료 · 근무일지 서명 · 다음 근무자 인계' });
    void sym;
  });
  return out;
}
function insRate(y) { const r = RATE[y]; return r.pension + r.health + r.health * r.ltc / 100 + r.emp + r.acc; }
/* Complaint 유형 ↔ 예방 표준 (S-Tec Complaint Response System 분류 코드) */
const CMP_LINK = [
  ['A1-01', '무단 근무지 이탈', 'C1-01', ['sec', 'prk', 'info']], ['A2-01', '근무 중 수면(야간 취침)', 'C1-03', ['sec', 'fac']], ['A2-02', '근무 중 휴대폰·유튜브 시청', 'C1-03', ['sec', 'prk', 'info', 'cln']],
  ['A3-01', '상습 지각·조기 퇴근', 'C1-01', null], ['A4-01', '고객사 정당한 요청 불이행', 'C2-03', null], ['B1-01', '방문객·임직원 불친절 응대', 'C2-01', null],
  ['B2-01', '근무복 미착용·복장 불량', 'C1-02', null], ['C1-01', '미등록 외부인·차량 출입 허용', 'A3-01', ['sec']], ['C1-02', '차단기 무단 상시개방', 'A3-01', ['sec', 'prk']],
  ['C4-01', '사건사고 보고 지연·누락', 'D2-03', null], ['C4-03', '인수인계 누락으로 업무 공백', 'A2-03', null], ['D1-01', '화재경보 임의 복구·무시', 'D2-01', ['sec', 'fac']],
  ['D2-02', '보호구 미착용·안전수칙 위반', 'D1-02', ['cln', 'fac', 'san', 'cook', 'prk']], ['E1-01', '화장실 위생 불량', 'A3-02', ['cln']], ['E1-03', '쓰레기 분리배출 미흡', 'A3-02', ['cln']],
  ['E3-01', '법정 소독 주기 미준수', 'A3-07', ['san']], ['F1-01', '차량 유도 미흡·주차장 접촉사고', 'A3-03', ['prk']], ['F2-02', '법정·정기 점검 누락', 'A3-04', ['fac']],
  ['G1-01', '결원 발생·대체인력 투입 지연', 'B2-04', null], ['G3-01', '고객사 직원의 근무자 직접 업무지시', 'C2-03', null], ['G4-02', '연장·휴일근로 정산 분쟁', 'B2-03', null], ['H3-01', 'CCTV 영상 무단 열람·유출', 'F2-03', ['sec', 'info']]
];

/* =====================================================================
 * 3) 업무표준안 생성(Plan)
 * ===================================================================== */
function lines(s) { return String(s || '').split(/\n+/).map(x => x.replace(/^[\s\-•·○◦▪■□*]+/, '').trim()).filter(Boolean); }
function grpText(groups) { return groups.filter(g => g.lines.length).map(g => (g.title ? `■ ${g.title}\n` : '') + g.lines.map(l => `- ${l}`).join('\n')).join('\n\n'); }
function parseGrp(text) {
  const out = []; let cur = null;
  String(text || '').split('\n').forEach(raw => {
    const t = raw.trim(); if (!t) return;
    if (/^■/.test(t)) { cur = { title: t.replace(/^■\s*/, ''), lines: [] }; out.push(cur); return; }
    if (!cur) { cur = { title: '', lines: [] }; out.push(cur); }
    cur.lines.push(t.replace(/^[\-•·○◦▪*]\s*/, ''));
  });
  return out.filter(g => g.lines.length || g.title);
}
const JOBX = { 'A1-02': ['ban', '직종별 금지·제한 업무'], 'D1-01': ['risk', '직종 주요 위험요인'], 'D1-02': ['kit', '직종 지급 보호구·장비'], 'E1-01': ['qual', '직종 자격·교육 요건'], 'E1-03': ['qual', '직종 법정·필수 교육'], 'F1-01': ['kpi', '직종 품질 지표'], 'C1-02': ['kit', '직종 착용·지급 품목'] };
const INDX = ['A1-01', 'A3-01', 'A3-02', 'A3-03', 'A3-04', 'A3-05', 'A3-06', 'A3-07', 'D1-01', 'F1-01', 'D2-02'];
function itemGroups(S, f) {
  if (S.gen === 'task') return sopGroups(S);
  const J = JOB[f.job], I = IND[f.ind], G = [];
  G.push({ title: '목적', lines: [S.pur] });
  G.push({ title: '기준·절차', lines: S.st.slice() });
  if (S.gen === 'jobdesc') {
    G.push({ title: `${J.n} 핵심 직무`, lines: J.duty }, { title: '금지·제한 업무', lines: J.ban }, { title: '자격·교육 요건', lines: J.qual }, { title: '지급 장비·보호구', lines: J.kit }, { title: '주요 위험요인', lines: J.risk });
  }
  if (JOBX[S.c]) G.push({ title: `${JOBX[S.c][1]} (${J.n})`, lines: J[JOBX[S.c][0]] });
  if (INDX.includes(S.c)) G.push({ title: `산업 특성 반영 — ${I.n}`, lines: [I.feat].concat(I.risk.map(r => `${r}: 사업장 근무지침에 관리 기준 반영`)) });
  if (S.c === 'A1-02' && f.ind === 'apt') G.push({ title: '공동주택 경비원 허용 업무(공동주택관리법 제65조의2)', lines: ['청소·미화 보조, 재활용 분리배출 정리·감시', '안전·위험 발생 대응, 도난 등 예방 순찰', '택배물품 보관(배달 제외), 주차 질서 유지(대리주차 제외)', '입주민 등의 부당한 지시·명령은 거부하고 관리주체에 보고'] });
  if (S.c === 'A1-02' && f.ind === 'construction') G.push({ title: '건설현장 신호수 업무 경계', lines: ['신호수는 보안 업무가 아니므로 회사 승인과 계약 변경(업무·인원·안전교육) 후에만 배치', '차량 유도 시 반사조끼·경광봉 착용, 장비 작업반경 출입 금지'] });
  const sp = lines(f.special).filter(l => S.k.some(k => l.toLowerCase().includes(k.toLowerCase())));
  if (sp.length) G.push({ title: '사업장 특수 기준(고객사 요구 반영)', lines: sp });
  G.push({ title: '점검 항목', lines: S.ck.slice() });
  G.push({ title: '기록·양식', lines: S.rec.slice() });
  G.push({ title: '관리 지표(KPI)', lines: S.kpi.slice() });
  return G;
}
function buildPlan() {
  const f = readForm();
  if (!f.client) { toast('① 적용 사업장을 선택하세요(전사 공통이면 「전사 공통 표준」).'); document.getElementById('siteCard').scrollIntoView({ behavior: 'smooth' }); return null; }
  if (!state.picked.length) { toast('② 표준 항목을 1개 이상 선택하세요.'); return null; }
  const items = state.picked.map(findSmall).filter(Boolean);
  const J = JOB[f.job], I = IND[f.ind], code = AMS_CODES.find(c => c.id === f.code) || null;
  const now = kstNow(), eff = parseD(f.eff);
  const docNo = `STEC-OS-${f.job.toUpperCase()}-${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const st = f.siteObj;
  const title = f.title || `${J.n} 업무표준서`;
  const lawIds = uniq(items.flatMap(x => x.S.l).concat(I.laws));
  const gens = uniq(items.map(x => x.S.gen).filter(Boolean));
  const gen = {};
  if (gens.some(g => ['sop', 'wbe'].includes(g))) gen.sop = sopRows(f.job, f.ind);
  if (gens.some(g => ['time'].includes(g)) && code) gen.time = timetable(f.job, code);
  if (gens.some(g => ['shift', 'crew'].includes(g))) gen.shift = codesFor(f.job).map(c => ({ c, m: shiftMetrics(c), on: c.id === f.code }));
  if (gens.includes('att')) gen.att = ATT;
  if (gens.includes('complaint')) gen.cmp = CMP_LINK.filter(r => !r[3] || r[3].includes(f.job));
  if (gens.includes('quote') || gens.includes('short')) gen.quote = { y: [2026, 2027].map(y => ({ y, r: RATE[y], ins: insRate(y), base: RATE[y].wage * 209 })) };
  const where = st ? `[${st.br}지사] ${st.name}` : f.client;
  const summary = [
    `적용 범위: ${where} · ${J.n} 직종 · ${I.n} 사업장`,
    `표준 항목 ${items.length}개 — 법정 ${items.filter(x => x.S.g === 'M').length} · 핵심 ${items.filter(x => x.S.g === 'C').length} · 권장 ${items.filter(x => x.S.g === 'R').length}`,
    code ? `기준 근무형태: ${code.id} ${code.name} (${code.ltype}) — ${codeInfoHtml(code).replace(/<[^>]+>/g, '')}` : '기준 근무형태: 사업장 근무 편성표 기준',
    gen.sop ? `표준 업무 ${gen.sop.rows.length}개 · 월 업무시간 ${Math.round(gen.sop.total).toLocaleString()}h · 업무량 기준 ${gen.sop.fte.toFixed(1)}명(FTE)` : '',
    `시행일 ${fmtD(eff)} · ${Number(f.rev) ? `개정 ${f.rev}차` : '제정'} · 관련 법령 ${lawIds.length}개 조항`
  ].filter(Boolean);
  const scope = [
    `■ 목적`, `- 이 표준은 에스텍 그룹이 ${where}에서 수행하는 ${J.n} 업무의 기준·절차·점검 방법을 정하여 서비스 품질을 균일하게 유지하고 법령 위반과 사고를 예방하는 것을 목적으로 한다.`,
    `■ 적용 범위`, `- ${where}에 배치된 ${J.n} 근무자(정규·기간제·단시간·대체 근무자 포함)와 현장 관리자에게 적용한다.`, `- 고객사와 체결한 용역(도급)계약서, 회사 취업규칙, 관계 법령이 이 표준보다 우선한다.`,
    `■ 운영 원칙`, `- 감정이 아닌 구조로 관리한다 — 기록·점검표·증빙으로 이행을 확인한다.`, `- 개인 책임 이전에 절차 부재·기록 부재·물리적 통제 미비를 먼저 개선한다.`, `- 표준은 연 1회 정기 검토하고, 계약·법령·업무가 바뀌면 즉시 개정한다.`
  ].join('\n');
  const terms = [
    `■ 용어 정의`, `- 현장대리인: 사업장에 상주하며 고객사 요청 접수·근무자 지휘·보고를 맡는 회사 측 책임자`, `- 근무조 코드: 근무형태·출퇴근 시각·휴게·근로형태를 정한 코드(근태관리 프로그램 기준)`,
    `- 즉보: 사건사고 인지 후 10분 이내 유선 보고`, `- 3대 중대위반: 무단 근무지 이탈 · 근무 시작·종료 시간 미준수 · 정당한 지시 불이행`, `- 감시·단속적 근로자: 고용노동부 승인을 받아 근로시간·휴게·휴일 규정 적용이 제외되는 근로자(야간가산·연차는 적용)`
  ].join('\n') + (lines(f.special).length ? `\n\n■ 사업장 특수 기준(고객사 요구사항)\n${lines(f.special).map(l => '- ' + l).join('\n')}` : '');
  const raci = [['고객사', '요청·승인', '업무 요청은 현장대리인에게 서면(메일)으로'], ['지사장', '승인·책임', '표준 승인·인력 배치·징계 요청·공식 회신'], ['현장대리인', '실행 총괄', '교육·근태·품질 관리, 사건사고 1차 보고'], ['팀장·조장', '실행 관리', '근무 편성 이행, 인수인계 확인, 근무자 지도'], [`${J.n} 근무자`, '실행', '지정 위치 근무, 기록 작성, 이상 즉시 보고']];
  const text = {}; items.forEach(x => text[x.S.c] = grpText(itemGroups(x.S, f)));
  return { f, items, J, I, code, docNo, made: now, eff, title, site: st || null, where, summary: summary.join('\n'), scope, terms, raci, text, gen,
    lawIds, lawOn: Object.fromEntries(lawIds.map(id => [id, true])) };
}

/* 편집 패널 */
function renderEditor(p) {
  const L = p.lawIds.map(id => { const x = LAWS[id]; return `<label class="law"><input type="checkbox" data-law="${id}" ${p.lawOn[id] ? 'checked' : ''}> <b>${esc(x.law)} ${esc(x.art)}</b> ${esc(x.title)}<small>${esc(x.sum)}</small></label>`; }).join('');
  const g = p.gen, links = p.links ? p.links.slice() : [];
  if (g.sop) links.push(`📋 표준 업무목록 ${g.sop.rows.length}개 · 월 ${Math.round(g.sop.total).toLocaleString()}h · ${g.sop.fte.toFixed(1)}명(FTE) <small>WBE ${esc(p.J.n)}×${esc(p.I.n)}</small>`);
  if (g.time) links.push(`🕘 일일 타임테이블 ${g.time.filter(r => !r.head).length}개 시간대 <small>${esc(p.code.id)}</small>`);
  if (g.shift) links.push(`🔁 근무조 코드 ${g.shift.length}종 지표(조 수·월 근로시간·법정 확인) <small>근태관리 프로그램</small>`);
  if (g.att) links.push('🗓 근태 기호·시간가감 환산 기준 <small>근태관리 프로그램</small>');
  if (g.cmp) links.push(`📣 Complaint 유형 ↔ 예방 표준 ${g.cmp.length}개 <small>Complaint Response System</small>`);
  if (g.quote) links.push('💰 최저임금·4대보험 요율(2026·2027) · 단기 견적 산식 <small>견적시스템</small>');
  const isClient = p.f.mode === 'client';
  $('#editor').innerHTML = `<div class="ed-head"><div><b>${esc(p.title)}</b><br><small>${esc(p.where)} · ${esc(p.I.n)}${p.kind === 'man' ? ' · ' + esc(p.docNo) : ''}</small></div><span class="sevbig gC">${p.kind === 'man' ? p.lv.n.replace(/ .*/, '') + ' · ' + p.items.length + '절' : p.items.length + '개 표준'}</span></div>
   <p class="ed-tip">생성된 표준안을 그대로 쓰거나 고쳐서 출력하세요. <b>■</b>로 시작하는 줄은 소제목, <b>-</b>로 시작하는 줄은 항목입니다. 「점검 항목」은 붙임 점검표로도 출력됩니다.</p>
   ${links.length ? `<div class="links"><b>${p.kind === 'man' ? '매뉴얼 구성 · 멀티미디어' : '프로그램 연계 자동 산출'}</b>${links.map(x => `<span>${x}</span>`).join('')}</div>` : ''}
   <div class="ed"><label>□ 주요 내용</label><textarea data-k="summary" rows="5">${esc(p.summary)}</textarea></div>
   ${p.kind === 'man' ? '' : `<div class="ed"><label>Ⅰ. 총칙 — 목적·적용 범위·운영 원칙</label><textarea data-k="scope" rows="7">${esc(p.scope)}</textarea></div>
   <div class="ed"><label>Ⅰ. 총칙 — 용어 정의·사업장 특수 기준</label><textarea data-k="terms" rows="6">${esc(p.terms)}</textarea></div>`}` +
    p.items.map(x => `<div class="ed ${x.S.int && isClient ? 'muted' : ''}"><label><span class="sev g${x.S.g}">${GRADE[x.S.g].label}</span> ${x.S.c} ${esc(x.S.n)}${x.S.int ? ' <small>(내부 전용 — 고객사 제출용에서 제외)</small>' : ''}</label><textarea data-t="${x.S.c}" rows="9">${esc(p.text[x.S.c])}</textarea></div>`).join('') +
    `<div class="ed"><label>법적 근거 — 출력할 법령 선택</label><div class="laws">${L}</div></div>`;
  $('#outPanel').classList.add('ready');
}
function syncEditor() {
  const p = state.plan; if (!p) return null;
  document.querySelectorAll('#editor textarea[data-k]').forEach(t => p[t.dataset.k] = t.value);
  document.querySelectorAll('#editor textarea[data-t]').forEach(t => p.text[t.dataset.t] = t.value);
  document.querySelectorAll('#editor input[data-law]').forEach(c => p.lawOn[c.dataset.law] = c.checked);
  p.f.mode = document.querySelector('input[name=mode]:checked').value;
  return p;
}
function outItems(p) { return p.items.filter(x => !(x.S.int && p.f.mode === 'client')); }
function docTitle(p) { return p.title; }
function fileBase(p) { const d = p.made; return `${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${safeName(p.f.client)}_${safeName(p.J.n)}_${p.kind === 'man' ? safeName(p.docNo) + '_업무매뉴얼' : '업무표준서'}${p.f.mode === 'client' ? '(제출용)' : '(사내)'}`; }
function revLabel(p) { return Number(p.f.rev) ? `Rev.${p.f.rev} (개정)` : 'Rev.0 (제정)'; }


/* =====================================================================
 * 3) Word — docx 본문 생성 + stec-header-footer 머리글·바닥글 주입
 * ===================================================================== */
const W_FONT = { ascii: '맑은 고딕', eastAsia: '맑은 고딕', hAnsi: '맑은 고딕', cs: '맑은 고딕' };
const CW = 9638; // A4 본문폭(twips)
/* 시인성: 본문 최소 10pt~11pt, 회색 글자도 진하게 (서식집 등 칸이 정해진 양식은 R.raw = true 로 원래 크기) */
function R(text, o = {}) { let sz = o.size || 20; if (!R.raw && sz < 22) sz = Math.min(22, sz + 2); const col = o.color === C.gray && !R.raw ? '3F4757' : (o.color || C.ink); return new docx.TextRun({ text, font: W_FONT, size: sz, bold: o.bold, color: col, italics: o.it }); }
function P(children, o = {}) {
  return new docx.Paragraph({ children: Array.isArray(children) ? children : [children], alignment: o.align, spacing: { before: o.before ?? 0, after: o.after ?? 60, line: o.line || (R.raw ? 288 : 300) },
    indent: o.indent, keepNext: o.keepNext, border: o.border, shading: o.shading });
}
function noB() { const n = { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' }; return { top: n, bottom: n, left: n, right: n }; }
function bAll(color = 'B8C0CC', size = 4) { const b = { style: docx.BorderStyle.SINGLE, size, color }; return { top: b, bottom: b, left: b, right: b }; }
function cell(paras, o = {}) {
  return new docx.TableCell({ children: paras, width: { size: o.w, type: docx.WidthType.DXA }, columnSpan: o.span, verticalAlign: o.va || docx.VerticalAlign.CENTER,
    shading: o.fill ? { fill: o.fill, type: docx.ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: o.m != null ? { top: o.m, bottom: o.m, left: 90, right: 90 } : { top: 70, bottom: 70, left: 110, right: 110 }, borders: o.borders || bAll() });
}
function table(rows, widths, o = {}) {
  return new docx.Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: docx.WidthType.DXA }, columnWidths: widths, rows: rows.map((r, i) => new docx.TableRow({ cantSplit: true, tableHeader: o.header && i === 0, height: o.rowH && i > 0 ? { value: o.rowH, rule: docx.HeightRule.ATLEAST } : undefined, children: r })) });
}
function H1(t) {
  return P([R(t, { size: 26, bold: true, color: C.navy })], { before: 280, after: 120, keepNext: true,
    border: { left: { style: docx.BorderStyle.SINGLE, size: 36, color: C.green, space: 8 }, bottom: { style: docx.BorderStyle.SINGLE, size: 6, color: 'B8C0CC', space: 3 } } });
}
function H2(t) { return P([R('▶ ', { size: 21, bold: true, color: C.green }), R(t, { size: 21, bold: true, color: C.greenD })], { before: 160, after: 60, keepNext: true }); }
function bullets(groups, o = {}) {
  const out = [];
  groups.forEach(g => {
    if (g.title) out.push(P([R('■ ', { size: 20, color: C.navy, bold: true }), R(g.title, { size: 20, bold: true, color: C.navy })], { before: 80, after: 40, keepNext: true }));
    g.lines.forEach(l => out.push(P([R('○ ', { size: 20, color: C.green }), R(l, { size: 20 })], { indent: { left: 400, hanging: 260 }, after: 40 })));
  });
  return out;
}
function imgPara(src, wIn, caption, dims) {
  const d = dims || [16, 9], h = wIn * d[1] / d[0];
  const out = [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, spacing: { before: 80, after: 30 }, keepNext: !!caption,
    children: [new docx.ImageRun({ type: 'jpg', data: b64ToU8(dataUrlB64(src)), transformation: { width: Math.round(wIn * 96), height: Math.round(h * 96) } })] })];
  if (caption) out.push(P([R(caption, { size: 16, color: C.gray, it: true })], { align: docx.AlignmentType.CENTER, after: 100 }));
  return out;
}
function boxPara(paras, fill = 'F2F7F3', color = C.green) {
  const b = { style: docx.BorderStyle.SINGLE, size: 12, color };
  return table([[cell(paras, { w: CW, fill, borders: { top: b, bottom: b, left: b, right: b } })]], [CW]);
}
function th(t, w) { return cell([P([R(t, { bold: true, color: C.white, size: 19 })], { align: docx.AlignmentType.CENTER, after: 0 })], { w, fill: C.navy }); }
function td(t, w, o = {}) { const ls = String(t).split('\n'); return cell(ls.map(x => P([R(x, { size: o.size || 19, bold: o.bold, color: o.color })], { align: o.align, after: 0 })), { w, fill: o.fill, va: o.va }); }

const ROMAN = ['', 'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ'];
function lawShort(ids) { return ids.filter(id => LAWS[id]).map(id => `${LAWS[id].law} ${LAWS[id].art}`).join(' · '); }
const won = n => Math.round(n).toLocaleString('ko-KR');
/* 연계 표 — Word */
function genDocx(code, p) {
  const g = p.gen, out = [], AC = docx.AlignmentType.CENTER, AR = docx.AlignmentType.RIGHT;
  if ((code === 'A2-01') && g.sop) {
    const s = g.sop, w = [1500, 1500, 3138, 900, 1200, 800, 600];
    out.push(H2(`표준 업무목록·표준시간표 — ${p.J.n} × ${p.I.n} (WBE 업무 분류 라이브러리)`));
    out.push(P([R(`월 업무시간 합계 ${won(s.total)}시간 · 1인 월 가용 ${s.avail.toFixed(1)}시간(주40h·비가동 6%) · 업무량 기준 필요 인원 ${s.fte.toFixed(1)}명(FTE) · "매일" = 월 ${s.days}일`, { size: 17, color: C.gray })], { after: 20 }));
    out.push(P([R(`※ 수량·빈도는 WBE 「${p.I.n}」 사업장 기본규모 기준입니다. 실제 면적·출입량 등은 Workload-Based Cost and Labor Estimation Method에서 사업장 실측값으로 다시 산정하십시오.`, { size: 15, color: C.brick })], { after: 60 }));
    out.push(table([[th('대분류', w[0]), th('중분류', w[1]), th('업무(소·세부)', w[2]), th('단위(분)', w[3]), th('수량', w[4]), th('빈도', w[5]), th('월(h)', w[6])]].concat(
      s.rows.map(r => [td(r.big, w[0], { size: 16 }), td(r.mid, w[1], { size: 16 }), td((r.small ? r.small + ' › ' : '') + r.n + (r.post ? ' (상주)' : '') + (r.g === 'M' ? ' [남]' : r.g === 'F' ? ' [여]' : ''), w[2], { size: 16 }),
        td(String(r.min), w[3], { size: 16, align: AC }), td(`${r.qty}${r.unit}`, w[4], { size: 16, align: AC }), td(`${PER_N[r.per]} ${r.freq}회`, w[5], { size: 15, align: AC }), td((r.mon / 60).toFixed(1), w[6], { size: 16, align: AR })]))
      .concat([[cell([P([R('합계', { bold: true, size: 17 })], { align: AC, after: 0 })], { w: w[0] + w[1] + w[2] + w[3] + w[4] + w[5], span: 6, fill: C.silverL }), td(won(s.total), w[6], { bold: true, align: AR, fill: C.silverL, size: 16 })]]), w, { header: true }));
  }
  if (code === 'G1-01' && g.sop) {
    const s = g.sop, w = [4600, 2500, 2538];
    out.push(H2('업무량 기반 인력 산정 결과'));
    out.push(table([[th('대분류', w[0]), th('월 업무시간(h)', w[1]), th('비중', w[2])]].concat(Object.entries(s.byBig).map(([k, v]) => [td(k, w[0]), td(won(v), w[1], { align: AR }), td((100 * v / s.total).toFixed(1) + '%', w[2], { align: AR })]))
      .concat([[td('합계 → 필요 인원(FTE)', w[0], { bold: true, fill: C.silverL }), td(won(s.total), w[1], { bold: true, align: AR, fill: C.silverL }), td(`${s.fte.toFixed(2)}명`, w[2], { bold: true, align: AR, fill: C.silverL, color: C.navy })]]), w, { header: true }));
  }
  if (code === 'A2-02' && g.time && g.time.length) {
    const w = [1500, 8138];
    out.push(H2(`일일 근무 타임테이블 — ${p.code.id} ${p.code.name}`));
    out.push(table([[th('시각', w[0]), th('업무 · 휴게', w[1])]].concat(g.time.map(r => r.head ? [cell([P([R(r.head, { bold: true, color: C.white, size: 18 })], { after: 0 })], { w: w[0] + w[1], span: 2, fill: C.green })]
      : [td(r.t, w[0], { align: AC, bold: true }), td(r.a, w[1], { fill: r.br ? 'FFF6E0' : undefined })])), w, { header: true }));
  }
  if ((code === 'B1-01' || code === 'G1-02') && g.shift && !(code === 'G1-02' && p.items.some(x => x.S.c === 'B1-01'))) {
    const w = [1700, 3000, 900, 900, 1000, 900, 1238];
    out.push(H2(`${p.J.n} 근무조 코드 및 근무형태 지표 (근태관리 프로그램 기준)`));
    out.push(table([[th('코드', w[0]), th('근무형태·시간', w[1]), th('근로형태', w[2]), th('월 근무일', w[3]), th('월 실근로(h)', w[4]), th('24h 초소 조 수', w[5]), th('법정 확인', w[6])]].concat(
      g.shift.map(({ c, m, on }) => [td(c.id + (on ? ' ★' : ''), w[0], { size: 16, bold: on }), td(c.name.replace(/^\S+\s/, '') + `\n${c.seq.split('').join(' ')}`, w[1], { size: 15 }), td(c.ltype, w[2], { size: 16, align: AC }),
        td(m.days.toFixed(1), w[3], { size: 16, align: AC }), td(m.hours.toFixed(0), w[4], { size: 16, align: AC }), td(m.crews + '조', w[5], { size: 16, align: AC }), td(m.warn || '적합', w[6], { size: 14, color: /초과/.test(m.warn) ? C.brick : C.gray })])), w, { header: true }));
    out.push(P([R('※ 기호: A 주간 · B 야간 · K 격일(24h) · D 휴무 / ★ 이 표준의 기준 근무형태 / 조 수 = 순환 일수 ÷ 근무일 수(주·야 중 큰 값), 연차·결원 예비 인력 별도', { size: 15, color: C.gray })], { after: 80 }));
  }
  if (code === 'B2-01' && g.att) {
    const w = [900, 3919, 900, 3919], sy = g.att.syms, half = Math.ceil(sy.length / 2);
    out.push(H2('근태 기호 (근태관리 프로그램 기준)'));
    out.push(table([[th('기호', w[0]), th('의미', w[1]), th('기호', w[2]), th('의미', w[3])]].concat(Array.from({ length: half }, (_, i) => { const a = sy[i], b = sy[i + half] || ['', '']; return [td(a[0], w[0], { align: AC, bold: true, color: C.navy }), td(a[1], w[1]), td(b[0], w[2], { align: AC, bold: true, color: C.navy }), td(b[1], w[3])]; })), w, { header: true }));
    out.push(H2('시간가감 환산 기준'));
    out.push(...bullets([{ title: '', lines: g.att.conv }]));
  }
  if (code === 'F1-02' && g.cmp) {
    const w = [1300, 3600, 1300, 3438];
    out.push(H2('Complaint 유형 ↔ 예방 표준 연계 (S-Tec Complaint Response System 분류)'));
    out.push(table([[th('Complaint 코드', w[0]), th('Complaint 유형', w[1]), th('예방 표준', w[2]), th('표준 명칭', w[3])]].concat(g.cmp.map(r => { const s = findSmall(r[2]); return [td(r[0], w[0], { align: AC, size: 16 }), td(r[1], w[1], { size: 17 }), td(r[2], w[2], { align: AC, bold: true, color: C.green, size: 16 }), td(s ? s.S.n : '', w[3], { size: 17 })]; })), w, { header: true }));
  }
  if ((code === 'G2-01' || (code === 'G2-02' && !p.items.some(x => x.S.c === 'G2-01'))) && g.quote) {
    const w = [2200, 1600, 1500, 1500, 1500, 1338];
    out.push(H2('견적 기준 요율 (에스텍시스템 견적 기준 · S-Tec-Quotation-System)'));
    out.push(table([[th('연도', w[0]), th('최저시급', w[1]), th('월 209h', w[2]), th('국민연금', w[3]), th('고용보험', w[4]), th('사업주 4대보험 계', w[5])]].concat(g.quote.y.map(q => [td(`${q.y}년`, w[0], { align: AC, bold: true }), td(won(q.r.wage) + '원', w[1], { align: AR }), td(won(q.base) + '원', w[2], { align: AR }), td(q.r.pension + '%', w[3], { align: AC }), td(q.r.emp + '%', w[4], { align: AC }), td(q.ins.toFixed(2) + '%', w[5], { align: AC, bold: true, color: C.navy })])), w, { header: true }));
    out.push(P([R('※ 건강보험 3.595% · 장기요양 건강보험료의 13.14% · 산재 0.86%(업종별 상이) 포함. 2027년 최저임금 10,700원(월 2,236,300원) 고시 기준.', { size: 15, color: C.gray })], { after: 60 }));
  }
  if (code === 'G2-02' && g.quote) {
    const q = g.quote.y[0], d = 8 * q.r.wage, tot = d * (1 + q.ins / 100) * 1.05;
    out.push(H2('단기인력 견적 산식 (S-Tec short estimate)'));
    out.push(boxPara([P([R(SHORT_FORMULA, { size: 19, bold: true, color: C.navy })], { after: 40 }),
      P([R(`예시(2026년, 주간 8시간·수당 없음): (8h × ${won(q.r.wage)}원) = ${won(d)}원 × (1 + ${q.ins.toFixed(2)}%) × 1.05 = 1인 1일 ${won(tot)}원 (VAT 별도)`, { size: 18 })], { after: 0 })], 'F4F6FA', C.navy));
  }
  return out;
}
function checkTable(ckLines) {
  const w = [700, 6038, 900, 900, 1100];
  return table([[th('No', w[0]), th('점검 항목', w[1]), th('양호', w[2]), th('미흡', w[3]), th('비고', w[4])]].concat(ckLines.map((l, i) => [td(String(i + 1), w[0], { align: docx.AlignmentType.CENTER, size: 17 }), td(l, w[1], { size: 18 }), td('□', w[2], { align: docx.AlignmentType.CENTER }), td('□', w[3], { align: docx.AlignmentType.CENTER }), td('', w[4])])), w, { header: true });
}
async function makeDocx(p) {
  const f = p.f, isClient = f.mode === 'client', AC = docx.AlignmentType.CENTER, ch = [];
  const items = outItems(p);
  ch.push(P([R(isClient ? '고객사 제출용' : '사내 표준 (내부)', { size: 18, bold: true, color: isClient ? C.green : C.brick })], { align: docx.AlignmentType.RIGHT, after: 40 }));
  ch.push(P([R(p.title, { size: 40, bold: true, color: C.navy })], { align: AC, before: 120, after: 60 }));
  ch.push(P([R(`${p.where}  |  ${p.J.n} · ${p.I.n}`, { size: 21, color: C.gray })], { align: AC, after: 80 }));
  ch.push(P([R(`문서번호 ${p.docNo}   ·   ${revLabel(p)}   ·   시행일 ${fmtD(p.eff)}`, { size: 17, color: C.gray })],
    { align: AC, after: 160, border: { bottom: { style: docx.BorderStyle.DOUBLE, size: 6, color: C.navy, space: 6 } } }));
  // 결재란
  const sw = [1600, 2679, 1785, 1787, 1787], sg = (t, w) => cell([P([R(t, { size: 17, color: C.gray })], { align: AC, after: 0 })], { w, va: docx.VerticalAlign.BOTTOM });
  ch.push(table([
    [td('적용 범위', sw[0], { fill: C.silverL, bold: true, align: AC }), td(`${p.where}\n${p.J.n} 직종 전원`, sw[1], { size: 17 }), th('작 성', sw[2]), th('검 토', sw[3]), th('승 인', sw[4])],
    [td('작성 부서', sw[0], { fill: C.silverL, bold: true, align: AC }), td(f.dept, sw[1], { size: 17 }), sg(f.author || '', sw[2]), sg(f.reviewer || '', sw[3]), sg(f.approver || '', sw[4])],
    [td('기준 근무형태', sw[0], { fill: C.silverL, bold: true, align: AC }), td(p.code ? `${p.code.id}\n${p.code.name.replace(/^\S+\s/, '')}` : '사업장 편성표 기준', sw[1], { size: 16 }), sg('(서명)', sw[2]), sg('(서명)', sw[3]), sg('(서명)', sw[4])]
  ], sw));
  ch.push(P([R('')], { after: 60 }));
  ch.push(boxPara([P([R('□ 주요 내용', { size: 22, bold: true, color: C.greenD })], { after: 80 })]
    .concat(lines(p.summary).map(l => P([R('· ', { bold: true, color: C.green }), R(l, { size: 20 })], { indent: { left: 240, hanging: 200 }, after: 30 })))));
  // 개정 이력
  ch.push(H2('제·개정 이력'));
  const rw = [1300, 2000, 4538, 1800];
  ch.push(table([[th('개정', rw[0]), th('일자', rw[1]), th('내용', rw[2]), th('작성', rw[3])], [td(revLabel(p).split(' ')[0], rw[0], { align: AC }), td(fmtD(p.made), rw[1], { align: AC }), td(f.reason || (Number(f.rev) ? '정기 검토에 따른 개정' : '업무표준 제정'), rw[2]), td(f.author || f.dept, rw[3], { align: AC })]], rw, { header: true }));
  // Ⅰ 총칙
  let n = 1;
  ch.push(H1(`${ROMAN[n++]}. 총칙`));
  ch.push(...bullets(parseGrp(p.scope)));
  ch.push(...bullets(parseGrp(p.terms)));
  ch.push(H2('책임과 권한 (R&R)'));
  const aw = [2000, 1700, 5938];
  ch.push(table([[th('구분', aw[0]), th('역할', aw[1]), th('주요 책임', aw[2])]].concat(p.raci.map(r => [td(r[0], aw[0], { bold: true, color: C.navy }), td(r[1], aw[1], { align: AC }), td(r[2], aw[2])])), aw, { header: true }));
  // Ⅱ 사업장·직무 개요
  ch.push(H1(`${ROMAN[n++]}. 적용 사업장 및 직무 개요`));
  if (p.site) {
    const s2 = p.site, rows = [['사업장명', s2.name, '관할 지사', s2.br + '지사'], ['주소', s2.addr || '-', null, null], ['계약일', s2.since || '-', '사업장 유형', s2.type || '-'],
      ['계약 업종', s2.work || '-', '근무형태', s2.shift || '-'], ['계약 인원', `총 ${s2.total}명 (남 ${s2.m} · 여 ${s2.f})`, '업종별 인원', `보안 ${s2.sec} · 미화 ${s2.cln} · 기타 ${s2.etc}`],
      ['현장 책임자', ([s2.pos, s2.mgr].filter(Boolean).join(' ') || '-') + (s2.mtel ? ` (${s2.mtel})` : ''), '사업장 전화', s2.stel || '-']];
    const fk = figName('dio', jobKey(p)), w5 = [1300, 2550, 1300, 2550, 1938];
    const imgCell = new docx.TableCell({ rowSpan: rows.length, width: { size: w5[4], type: docx.WidthType.DXA }, verticalAlign: docx.VerticalAlign.CENTER, borders: bAll(), margins: { top: 60, bottom: 60, left: 60, right: 60 },
      children: [new docx.Paragraph({ alignment: AC, children: [new docx.ImageRun({ type: 'jpg', data: b64ToU8(dataUrlB64(ASSET.fig[fk])), transformation: { width: 112, height: Math.round(112 * ASSET.figDim[fk][1] / ASSET.figDim[fk][0]) } })] }),
        P([R(`${p.J.n} 현장`, { size: 15, color: C.gray })], { align: AC, after: 0 })] });
    const lab5 = t => td(t, 1300, { fill: 'E8F5EC', bold: true, align: AC, color: C.greenD });
    ch.push(H2('적용 사업장 (에스텍베스트 사업장 목록 기준)'));
    ch.push(new docx.Table({ width: { size: 9638, type: docx.WidthType.DXA }, columnWidths: w5, rows: rows.map((r, i) => new docx.TableRow({ cantSplit: true, children:
      (r[2] === null ? [lab5(r[0]), cell([P([R(r[1], { size: 19 })], { after: 0 })], { w: 6400, span: 3 })] : [lab5(r[0]), td(r[1], 2550), lab5(r[2]), td(r[3], 2550)]).concat(i === 0 ? [imgCell] : []) })) }));
  } else ch.push(P([R(`적용 범위: ${p.where} (사업장 목록 외 직접 지정)`, { size: 19 })], { after: 60 }));
  ch.push(H2(`${p.J.n} 직무 개요`));
  ch.push(...bullets([{ title: '핵심 직무', lines: p.J.duty }, { title: `산업 특성 — ${p.I.n}`, lines: [p.I.feat].concat(p.I.risk) }]));
  { const v = VIDEO_OF[jobKey(p)]; ch.push(...imgPara(ASSET.poster[v], 3.6, `▶ 표준 교육 자료: ${p.J.n} 근무 영상 (업무표준 PPT에서 재생)`, [16, 9])); }
  n = linkDocx(ch, p, n);
  // Ⅲ 체계표
  ch.push(H1(`${ROMAN[n++]}. 업무표준 항목 체계`));
  const cw2 = [2300, 2500, 3638, 1200];
  ch.push(table([[th('대분류', cw2[0]), th('중분류', cw2[1]), th('표준 항목(소분류)', cw2[2]), th('등급', cw2[3])]].concat(
    items.map(x => [td(`${x.L.c}. ${x.L.n}`, cw2[0], { size: 17 }), td(`${x.M.c} ${x.M.n}`, cw2[1], { size: 17 }), td(`${x.S.c} ${x.S.n}`, cw2[2], { bold: true, size: 18 }), td(GRADE[x.S.g].label, cw2[3], { align: AC, bold: true, color: GRADE[x.S.g].color })])), cw2, { header: true }));
  ch.push(P([R('등급: 법정 = 법령상 의무 · 핵심 = 에스텍 그룹 공통 필수 · 권장 = 품질 향상 권장', { size: 15, color: C.gray })], { after: 60 }));
  // Ⅳ 세부 기준
  ch.push(H1(`${ROMAN[n++]}. 업무표준 세부 기준`));
  items.forEach((x, i) => {
    ch.push(P([R(`${i + 1}. `, { size: 23, bold: true, color: C.green }), R(`[${x.S.c}] ${x.S.n}`, { size: 23, bold: true, color: C.navy }), R(`   ${GRADE[x.S.g].label}`, { size: 17, bold: true, color: GRADE[x.S.g].color })],
      { before: 240, after: 80, keepNext: true, border: { bottom: { style: docx.BorderStyle.SINGLE, size: 6, color: 'B8C0CC', space: 3 } } }));
    if (x.S.gen === 'task') { ch.push(boxPara([P([R('목적  ', { bold: true, color: C.greenD, size: 21 }), R(x.S.pur, { size: 21 })], { after: 0 })], 'F2F7F3', C.green)); ch.push(...sopDocx(x.S, p)); ch.push(P([R('법적 근거  ', { bold: true, size: 17, color: C.navy }), R(lawShort(x.S.l.filter(id => p.lawOn[id] !== false)), { size: 17, color: C.gray })], { before: 60, after: 80 })); return; }
    const G = parseGrp(p.text[x.S.c]);
    G.forEach(g => {
      if (/^목적/.test(g.title)) { ch.push(boxPara(g.lines.map(l => P([R('목적  ', { bold: true, color: C.greenD, size: 19 }), R(l, { size: 19 })], { after: 0 })), 'F2F7F3', C.green)); return; }
      if (/^점검 항목/.test(g.title)) { ch.push(H2('점검 항목')); ch.push(checkTable(g.lines)); return; }
      if (/^기준·절차/.test(g.title)) { ch.push(H2('기준·절차')); g.lines.forEach((l, k) => ch.push(P([R(`${k + 1}) `, { bold: true, color: C.navy, size: 20 }), R(l, { size: 20 })], { indent: { left: 400, hanging: 300 }, after: 40 }))); return; }
      ch.push(...bullets([g]));
    });
    ch.push(...genDocx(x.S.c, p));
    ch.push(P([R('법적 근거  ', { bold: true, size: 16, color: C.navy }), R(lawShort(x.S.l.filter(id => p.lawOn[id] !== false)), { size: 16, color: C.gray })], { before: 60, after: 80 }));
  });
  // Ⅴ 법령
  ch.push(H1(`${ROMAN[n++]}. 법적 근거 종합`));
  const laws = p.lawIds.filter(id => p.lawOn[id]).map(id => LAWS[id]), lw = [1900, 2000, 5738];
  ch.push(table([[th('법령', lw[0]), th('조항', lw[1]), th('주요 내용 및 적용', lw[2])]].concat(laws.map(x => [td(x.law, lw[0], { bold: true, color: C.navy, size: 17 }), td(`${x.art}\n${x.title}`, lw[1], { size: 16, align: AC }), td(x.sum, lw[2], { size: 17 })])), lw, { header: true }));
  ch.push(H2('표준 운영·개정 원칙'));
  ch.push(...bullets([{ title: '', lines: ['표준은 연 1회 정기 검토하고, 계약·법령·업무 변경 시 수시 개정한다.', '개정 시 개정 이력에 사유를 기록하고 근무자 교육(교육 확인서) 후 시행한다.', '이행 여부는 월간 품질점검(붙임 점검표)으로 확인하고 미흡 항목은 7일 내 개선한다.'] }]));
  // 붙임
  ch.push(H1('붙임 1. 업무표준 이행 점검표'));
  ch.push(P([R(`점검일 :            점검자 :            사업장 : ${p.where}`, { size: 18 })], { after: 80 }));
  const allCk = []; items.forEach(x => { const g = parseGrp(p.text[x.S.c]).find(g => /^점검 항목/.test(g.title)); (g ? g.lines : []).forEach(l => allCk.push(`[${x.S.c}] ${l}`)); });
  ch.push(checkTable(allCk));
  ch.push(H1('붙임 2. 업무표준 교육 확인서'));
  ch.push(P([R(`본인은 「${p.title}」(${revLabel(p)})의 내용을 교육받고 이해하였으며, 이를 준수할 것을 확인합니다.`, { size: 19 })], { after: 80 }));
  const ew = [700, 2000, 1800, 2000, 3138];
  ch.push(table([[th('No', ew[0]), th('성명', ew[1]), th('직책', ew[2]), th('교육일', ew[3]), th('서명', ew[4])]].concat(Array.from({ length: 12 }, (_, i) => [td(String(i + 1), ew[0], { align: AC }), td('', ew[1]), td('', ew[2]), td('', ew[3]), td('', ew[4])])), ew, { header: true }));
  ch.push(...imgPara(ASSET.fig.team, 2.3, 'The Best Choice, S-Tec — 표준으로 일하는 에스텍 그룹', ASSET.figDim.team));
  ch.push(P([R('- 끝 -', { size: 20, bold: true })], { align: AC, before: 200, after: 120 }));
  ch.push(P([R(`※ 법령 요약은 실무 참고용입니다. 적용 전 국가법령정보센터(law.go.kr) 원문 및 노무 자문으로 확인하십시오.  |  ${APP.name} ${APP.version}`, { size: 15, color: '8A93A3' })], { align: AC }));
  return await packDocx(ch, docTitle(p));
}

/* Office 파일 정리: 폴더 항목 제거(OneDrive·클라우드 폴더에서 열기 오류 방지), [Content_Types] 맨 앞,
   PPT 슬라이드 도형 ID 중복 제거(영상 슬라이드 복구 오류 방지) + 영상 재생 타이밍 */
async function ooxmlPack(zip, mime, pptx) {
  const out = new JSZip(), names = Object.keys(zip.files).filter(n => !zip.files[n].dir);
  names.sort((a, b) => (a === '[Content_Types].xml' ? -1 : b === '[Content_Types].xml' ? 1 : a.startsWith('_rels/') ? -1 : b.startsWith('_rels/') ? 1 : 0));
  for (const n of names) {
    if (pptx && /^ppt\/slides\/slide\d+\.xml$/.test(n)) {
      let x = await zip.file(n).async('string'), id = 0; const vids = [];
      x = x.replace(/<p:cNvPr id="\d+"([^>]*)>(<a:hlinkClick r:id="" action="ppaction:\/\/media"\/>)?/g, (m, rest, media) => { id++; if (media) vids.push(id); return `<p:cNvPr id="${id}"${rest}>${media || ''}`; });
      if (vids.length && !x.includes('<p:timing>')) {
        let t = 2; const nodes = vids.map(v => `<p:video><p:cMediaNode vol="80000"><p:cTn id="${t++}" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${v}"/></p:tgtEl></p:cMediaNode></p:video>`).join('');
        const tm = `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>${nodes}</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>`;
        x = x.replace(/(<\/p:clrMapOvr>|<\/p:cSld>)(?![\s\S]*<\/p:clrMapOvr>)/, '$1' + tm);
      }
      out.file(n, x, { createFolders: false });
    } else out.file(n, await zip.file(n).async('uint8array'), { createFolders: false });
  }
  return await out.generateAsync({ type: 'blob', mimeType: mime, compression: 'DEFLATE' });
}
/* 붙임: 고객사 접수 원문(공문·메일·카톡·사진) — 📎 불러오기로 올린 파일 */
function attachDocx(ch) {
  const att = typeof intakeAtt === 'function' ? intakeAtt() : []; if (!att.length) return;
  ch.push(H1('붙임. 고객사 접수 원문'));
  ch.push(P([R(att.map((a, k) => `${k + 1}. ${a.name} (${a.kind})`).join('   '), { size: 18, color: C.gray })], { after: 60 }));
  att.forEach((a, k) => {
    ch.push(H2(`${k + 1}. ${a.name}`));
    a.imgs.slice(0, 3).forEach((im, j) => ch.push(...imgPara(im.src, Math.min(6.0, 5.2 * im.w / im.h), a.imgs.length > 1 ? `${a.name} — ${j + 1}` : null, [im.w, im.h])));
    if (!a.imgs.length && a.text) ch.push(boxPara(a.text.slice(0, 3000).split('\n').filter(l => l.trim()).map(l => P([R(l, { size: 18 })], { after: 20 })), 'FFFFFF', C.silver));
  });
}
function attachSlides(S, no, p) {
  const att = typeof intakeAtt === 'function' ? intakeAtt() : [], ims = [];
  att.forEach(a => { if (a.imgs.length) a.imgs.slice(0, 2).forEach(im => ims.push({ a, im })); else if (a.text) ims.push({ a, txt: a.text }); });
  for (let i = 0; i < Math.min(ims.length, 4); i += 2) {
    const pair = ims.slice(i, i + 2), o = frame('붙임  고객사 접수 원문', pair.map(x => x.a.name).join(' · '), no++, p), cw = pair.length > 1 ? 5.95 : 12.1;
    pair.forEach((x, j) => {
      const X = 0.6 + j * 6.15, Y = 1.55, H = 4.95;
      if (x.im) { const r = Math.min(cw / x.im.w, (H - 0.35) / x.im.h), w = x.im.w * r, h = x.im.h * r, xx = X + (cw - w) / 2; o.push(Rc(xx - 0.03, Y - 0.03, w + 0.06, h + 0.06, K.line)); o.push(Im(xx, Y, w, h, x.im.src)); o.push(T(X, Y + h + 0.06, cw, 0.3, `▲ ${x.a.kind} · ${x.a.name}`, { pt: 10, color: K.mute, align: 'center' })); }
      else { o.push(Rc(X, Y, cw, H, K.tint, { line: K.line })); o.push(T(X + 0.2, Y + 0.12, cw - 0.4, H - 0.24, x.txt.slice(0, 900).split('\n').filter(Boolean).map(t => ({ text: t })), { max: 12, min: 7.5, color: '2A3150', lh: 1.25 })); }
    });
    S.push(o);
  }
  return no;
}
async function packDocx(ch, title) {
  const doc = new docx.Document({
    creator: APP.maker, title, description: `${APP.name} ${APP.version}`,
    styles: { default: { document: { run: { font: W_FONT, size: 20 } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1850, bottom: 1831, left: 1134, right: 1134, header: 1020, footer: 973 } } }, children: ch }]
  });
  const blob = await docx.Packer.toBlob(doc);
  return await applyHeaderFooter(blob);
}

/* stec-header-footer 스킬(apply_header_footer.py)과 동일한 주입 로직 — JS 이식판 */
async function applyHeaderFooter(blob, opt = {}) {
  const zip = await JSZip.loadAsync(blob);
  const EMU_PER_PX = 2520000 / 1860; // 원본 서명 1860px = 2520000 EMU
  const sigUrl = opt.noDate ? state.sigNoDate : state.sigDataUrl, sigW = opt.noDate ? state.sigNoDatePx : state.sigPx;
  const cx = Math.round(sigW * EMU_PER_PX);
  let ftr = HF_FOOTER_XML.replace(/cx="2520000"/g, `cx="${cx}"`);
  zip.file('word/stecHeader.xml', HF_HEADER_XML);
  zip.file('word/stecFooter.xml', ftr);
  zip.file('word/media/stec-header-thebestchoice.png', b64ToU8(dataUrlB64(ASSET.headerTbc)));
  zip.file('word/media/stec-footer-signature.png', b64ToU8(dataUrlB64(sigUrl)));
  const rel = (id, t) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${t}"/></Relationships>`;
  zip.file('word/_rels/stecHeader.xml.rels', rel('rId1', 'media/stec-header-thebestchoice.png'));
  zip.file('word/_rels/stecFooter.xml.rels', rel('rId2', 'media/stec-footer-signature.png'));
  let ct = await zip.file('[Content_Types].xml').async('string');
  if (!/Extension="png"/i.test(ct)) ct = ct.replace(/(<Types[^>]*>)/, '$1<Default Extension="png" ContentType="image/png"/>');
  [['stecHeader.xml', 'header'], ['stecFooter.xml', 'footer']].forEach(([pt, k]) => { const ov = `<Override PartName="/word/${pt}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${k}+xml"/>`; if (!ct.includes(ov)) ct = ct.replace('</Types>', ov + '</Types>'); });
  zip.file('[Content_Types].xml', ct);
  let rl = await zip.file('word/_rels/document.xml.rels').async('string');
  rl = rl.replace('</Relationships>', '<Relationship Id="rIdStecHdr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="stecHeader.xml"/><Relationship Id="rIdStecFtr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="stecFooter.xml"/></Relationships>');
  zip.file('word/_rels/document.xml.rels', rl);
  let d = await zip.file('word/document.xml').async('string');
  const refs = ['default', 'first', 'even'].map(t => `<w:headerReference w:type="${t}" r:id="rIdStecHdr"/><w:footerReference w:type="${t}" r:id="rIdStecFtr"/>`).join('');
  d = d.replace(/<w:sectPr[^>]*>[\s\S]*?<\/w:sectPr>|<w:sectPr[^>]*\/>/g, s => {
    s = s.replace(/<w:(header|footer)Reference[^>]*\/>/g, '');
    if (/\/>$/.test(s) && !/<\/w:sectPr>/.test(s)) s = s.replace(/\/>$/, '>') + '</w:sectPr>';
    return s.replace(/(<w:sectPr[^>]*>)/, '$1' + refs);
  });
  if (!/xmlns:r=/.test(d.slice(0, 2000))) d = d.replace('<w:document ', '<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ');
  zip.file('word/document.xml', d);
  return await ooxmlPack(zip, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

/* =====================================================================
 * 4) 슬라이드 모델 — 하나의 모델을 PPT(pptxgenjs)와 PDF(html2canvas)로 동시 렌더
 *    13.333 × 7.5 in (16:9), 96 px/in
 * ===================================================================== */
const SW = 13.333, SH = 7.5, DPI = 96, PT = 96 / 72;
const SFONT = "'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo','Noto Sans KR','Noto Sans CJK KR',sans-serif";
const MCTX = document.createElement('canvas').getContext('2d');
function wrapCount(text, px, maxW, bold) {
  MCTX.font = `${bold ? '700 ' : '400 '}${px}px ${SFONT}`;
  let n = 0;
  String(text).split('\n').forEach(seg => {
    const words = seg.split(/(\s+)/); let line = ''; n++;
    words.forEach(w => {
      const t = line + w;
      if (MCTX.measureText(t).width <= maxW || !line.trim()) {
        if (MCTX.measureText(t).width > maxW) { // 긴 단어 글자 단위 분할
          let cur = line; for (const ch of w) { if (MCTX.measureText(cur + ch).width > maxW && cur) { n++; cur = ch; } else cur += ch; } line = cur;
        } else line = t;
      } else { n++; line = w.trimStart(); }
    });
  });
  return n;
}
/* paras: [{text,bold,color,size(배수),indent(in)}] */
function fit(paras, w, h, maxPt, minPt = 9, lh = 1.22, gapPt = 3) {
  for (let pt = maxPt; pt >= minPt; pt -= 0.5) {
    let H = 0;
    paras.forEach((p, i) => { const s = pt * (p.size || 1); const n = wrapCount(p.text, s * PT, (w - (p.indent || 0)) * DPI * 0.93, p.bold); H += n * s * PT * lh + (i < paras.length - 1 ? (p.gap ?? gapPt) * PT : 0); });
    if (H <= h * DPI * 0.97) return { pt, ok: true };
  }
  return { pt: minPt, ok: false };
}
function T(x, y, w, h, paras, o = {}) {
  if (typeof paras === 'string') paras = [{ text: paras }];
  const mn = Math.max(o.min || 9, 9.5), mx = Math.max(o.max || 16, mn);
  const r = o.pt ? { pt: o.pt, ok: true } : fit(paras, w, h, mx, mn, o.lh || 1.22, o.gap ?? 3);
  return { t: 'text', x, y, w, h, paras, pt: r.pt, ok: r.ok, color: o.color || C.ink, bold: o.bold, align: o.align || 'left', valign: o.valign || 'top', lh: o.lh || 1.22, gap: o.gap ?? 3, font: o.font };
}
const Rc = (x, y, w, h, fill, o = {}) => ({ t: 'shape', k: o.k || 'rect', x, y, w, h, fill, line: o.line, lw: o.lw, alpha: o.alpha });
const Im = (x, y, w, h, src) => ({ t: 'img', x, y, w, h, src });

function gradient(w, h, stops, dir = 'h') {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  const gr = dir === 'h' ? g.createLinearGradient(0, 0, w, 0) : dir === 'd' ? g.createLinearGradient(0, 0, w, h) : g.createLinearGradient(0, 0, 0, h);
  stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); return cv.toDataURL('image/png');
}
let GR = null;
function grads() {
  if (GR) return GR;
  GR = {
    navy: gradient(640, 360, [[0, '#0E2AA8'], [0.55, '#0B1F8F'], [1, '#050C3E']], 'd'),
    silver: gradient(400, 40, [[0, '#F7F8FA'], [0.5, '#E3E7EC'], [1, '#C9CED6']], 'h'),
    silverV: gradient(40, 400, [[0, '#FFFFFF'], [0.6, '#F1F3F6'], [1, '#DDE2E8']], 'v'),
    green: gradient(400, 40, [[0, '#2BA24A'], [1, '#17552F']], 'h'),
    fade: gradient(600, 20, [[0, 'rgba(30,139,58,1)'], [1, 'rgba(30,139,58,0)']], 'h'),
    fadeN: gradient(600, 20, [[0, 'rgba(11,31,143,1)'], [1, 'rgba(11,31,143,0)']], 'h')
  };
  return GR;
}

/* 공통 프레임: 상단 제목바 + 하단 바 */
/* ---------- 현장 사진·영상 (★ Project Resources) ---------- */
const VIDEO_OF = { sec: 'sec1', cln: 'cln', prk: 'prk', fac: 'fac', info: 'off', grd: 'grd', san: 'san1', spc: 'spc', off: 'off2' };
const JOB_NAME = { sec: '보안', cln: '미화', prk: '주차', fac: '시설관리', info: '안내', grd: '경호', san: '소독방역', spc: '특수직군', off: '사무관리' };
const VIDEO_TITLE = { sec1: '보안근무 영상', cln: '미화근무 영상', prk: '주차근무 영상', fac: '시설근무 영상', off2: '사무관리 영상', grd: '경호근무 영상', san1: '세니텍(소독방역) 근무 영상', spc: '특수직군 근무 영상' };
function jobKey(p) { return p.J.fig; }
function figName(kind, key) { const alt = { grd: 'sec', spc: 'fac', san: 'fac' }; return ASSET.fig[kind + '_' + key] ? kind + '_' + key : kind + '_' + (alt[key] || 'sec'); }
function figBox(name, x, y, maxW, maxH, align) {
  const d = ASSET.figDim[name] || [600, 760]; const r = Math.min(maxW / d[0], maxH / d[1]); const w = d[0] * r, h = d[1] * r;
  return Im(align === 'left' ? x : x + (maxW - w) / 2, y + (maxH - h) / 2, w, h, ASSET.fig[name]);
}
const Vd = (x, y, w, h, key) => ({ t: 'video', x, y, w, h, key, src: ASSET.poster[key] });
async function fetchVideo(k) {
  const rel = (k.includes('/') ? 'media/' + k : 'media/videos/' + k) + '.mp4';
  for (const u of [rel, APP.shareUrl + rel]) {
    try { const r = await fetch(u); if (r.ok) { const b = await r.blob(); if (b.size > 10000) return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.readAsDataURL(b); }); } } catch (e) { }
  }
  return null;
}
async function toPng(u) { const im = await loadImg(u); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/png'); }
/* 현장 재교육 영상 슬라이드 (공통) */
function videoSlide(p, no, title, sub, foot, points, key) {
  const v = VIDEO_OF[key] || 'sec1', o = frame(title, sub, no, p, foot);
  o.push(Rc(0.6, 1.62, 7.5, 4.3, '0F1530'));
  o.push(Vd(0.65, 1.67, 7.4, 4.2, v));
  o.push(T(0.6, 6.0, 7.5, 0.35, `▶ ${VIDEO_TITLE[v] || '현장 근무 영상'} — PPT 파일에서 바로 재생됩니다 (PDF는 대표 장면)`, { pt: 10.5, color: K.mute }));
  o.push(Rc(8.35, 1.62, 4.4, 4.75, 'FAFBFC', { line: K.line })); o.push(Rc(8.35, 1.62, 4.4, 0.06, C.green));
  o.push(figBox(figName('cute', key), 8.5, 1.8, 1.35, 1.75));
  o.push(T(9.95, 1.85, 2.7, 1.6, [{ text: '현장 재교육', bold: true, color: C.greenD }, { text: `${JOB_NAME[key] || ''} 근무 기준`, size: 0.85, color: K.ink, bold: true }, { text: '교육 후 전 근무자 서명 · 사진 기록', size: 0.75, color: K.mute }], { max: 15, min: 9, gap: 3 }));
  o.push(Rc(8.6, 3.62, 3.9, 0.012, K.line));
  o.push(T(8.6, 3.72, 3.95, 2.55, points.slice(0, 5).map(t => ({ text: '•  ' + t })), { max: 12, min: 8.5 }));
  return o;
}
function frame(title, sub, no, p, foot) {
  const E = [];
  E.push(Rc(0, 0, SW, SH, C.white));
  E.push(Rc(0, 0, 0.12, SH, K.ink));                       // 좌측 얇은 세로 띠
  E.push(Rc(0.12, 0, 0.05, SH, C.green));
  [0, 1, 2].forEach(i => E.push(Rc(0.62 - i * 0.05, 0.42 + i * 0.13, 0.42 + i * 0.04, 0.08, i === 1 ? K.grn2 : C.green, { k: 'para' })));
  E.push(T(1.3, 0.3, 9.4, 0.6, [{ text: title, bold: true }], { pt: 24, color: K.ink, valign: 'middle' }));
  if (sub) E.push(T(1.3, 0.86, 9.6, 0.3, sub, { pt: 11.5, color: K.mute }));
  E.push(Im(SW - 1.95, 0.36, 1.45, 1.45 * 340 / 900, ASSET.logo));
  E.push(Rc(0.6, 1.3, 1.1, 0.04, C.green));
  E.push(Rc(1.7, 1.315, SW - 2.2, 0.012, K.line));
  // 하단: 가는 선 + 회색 문구 + 쪽번호
  E.push(Rc(0.6, SH - 0.48, SW - 1.1, 0.012, K.line));
  E.push(T(0.6, SH - 0.44, 8.5, 0.32, foot || `${APP.org} · ${p.f.client} ${docTitle(p)}`, { pt: 9.5, color: '8A93A3', valign: 'middle' }));
  E.push(Rc(SW - 0.95, SH - 0.36, 0.1, 0.1, C.green));
  E.push(T(SW - 0.82, SH - 0.44, 0.4, 0.32, String(no).padStart(2, '0'), { pt: 11, color: K.ink, bold: true, valign: 'middle' }));
  return E;
}
/* 세련된 표지(공통) */
function coverSlide(o) {
  const c = [];
  c.push(Rc(0, 0, SW, SH, C.white));
  c.push(Rc(7.75, 0, SW - 7.75, SH, 'F3F5F8'));
  c.push(Rc(7.75, 0, 0.04, SH, K.line));
  if (o.fig) c.push(figBox(o.fig, 8.1, 0.55, 4.95, 5.55)); else c.push(Im(8.45, 0.95, 4.2, 4.2 * (o.ratio || 1046 / 1024), o.img || ASSET.cube));
  c.push(Rc(0, 0, 0.12, SH, K.ink)); c.push(Rc(0.12, 0, 0.05, SH, C.green));
  c.push(Im(0.85, 0.55, 1.55, 1.55, ASSET.osi));  /* 표지 로고 = 앱 아이콘(업무표준화·매뉴얼 제작 시스템) */
  c.push(Rc(0.85, 2.55, 0.5, 0.05, C.green));
  c.push(T(0.85, 2.7, 6.6, 0.4, o.eyebrow, { pt: 13, color: C.green, bold: true }));
  c.push(T(0.85, 3.1, 6.7, 1.25, [{ text: o.title, bold: true }], { max: 36, min: 24, color: K.ink, lh: 1.15 }));
  c.push(T(0.85, 4.45, 6.6, 0.95, o.lines.map((t, i) => ({ text: t, size: i ? 0.8 : 1, color: i ? K.mute : '3A4366', bold: !i })), { max: 17, min: 10.5, gap: 4 }));
  c.push(Rc(0.85, 5.65, 6.4, 0.012, K.line));
  c.push(T(0.85, 5.75, 6.6, 0.4, o.meta, { pt: 10.5, color: K.mute }));
  if (o.badge) { c.push(Rc(0.85, 6.3, 1.7, 0.36, o.badgeColor || K.ink, { k: 'para' })); c.push(T(0.85, 6.3, 1.7, 0.36, o.badge, { pt: 10.5, bold: true, color: C.white, align: 'center', valign: 'middle' })); }
  c.push(sigEl(SW - 4.25, SH - 0.62, 0.4));
  return c;
}
/* 맺음(공통) */
function closingSlide(o) {
  const e = [];
  e.push(Rc(0, 0, SW, SH, C.white));
  e.push(Rc(0, SH - 1.15, SW, 1.15, 'F3F5F8'));
  e.push(Rc(0, 0, 0.12, SH, K.ink)); e.push(Rc(0.12, 0, 0.05, SH, C.green));
  e.push(Im(0.75, 0.55, 1.75, 1.75 * 340 / 900, ASSET.logo));
  e.push(figBox(o.fig || 'team', SW / 2 - 2.6, 0.75, 5.2, 3.3));
  e.push(T(1, 4.15, SW - 2, 0.6, [{ text: 'The Best Choice, S-Tec', bold: true }], { pt: 28, color: K.ink, align: 'center' }));
  e.push(T(1, 4.75, SW - 2, 0.42, o.tag, { pt: 13.5, color: K.mute, align: 'center' }));
  e.push(Rc(SW / 2 - 0.6, 5.3, 1.2, 0.04, C.green));
  e.push(T(1, 5.4, SW - 2, 0.36, o.org, { pt: 11, color: K.mute, align: 'center' }));
  e.push(Im(0.85, SH - 0.88, 1.5, 1.5 * 53 / 127, ASSET.sanitec));
  e.push(sigEl(SW - 4.25, SH - 0.7, 0.4));
  return e;
}
function sigEl(x, y, h) { return Im(x, y, h * state.sigPx / 210, h, state.sigDataUrl); }
function listParas(groups, o = {}) {
  const out = [];
  groups.forEach((g, gi) => {
    if (g.title) out.push({ text: g.title, bold: true, color: o.hcolor || C.navy, gap: 2 });
    g.lines.forEach((l, i) => out.push({ text: `•  ${l}`, indent: 0, color: C.ink, gap: (i === g.lines.length - 1 && gi < groups.length - 1) ? 7 : 3 }));
  });
  return out;
}
/* 문단을 여러 장으로 분할 */
function paginate(paras, w, h, minPt = 12) {
  const pages = []; let cur = [];
  paras.forEach(p => { const test = cur.concat([p]); if (cur.length && !fit(test, w, h, minPt, minPt).ok) { pages.push(cur); cur = p.bold ? [p] : [p]; } else cur = test; });
  if (cur.length) pages.push(cur);
  return pages;
}

/* 표 그리기(슬라이드) */
function tbl(o, x, y, cols, rows, o2 = {}) {
  const rh = o2.rh || 0.36, hh = o2.hh || 0.42, W = cols.reduce((a, c) => a + c.w, 0);
  o.push(Rc(x, y, W, hh, o2.hfill || K.navy));
  let cx = x; cols.forEach(c => { o.push(T(cx + 0.06, y, c.w - 0.12, hh, [{ text: c.t, bold: true }], { pt: o2.hpt || 11, color: C.white, align: c.al || 'center', valign: 'middle' })); cx += c.w; });
  rows.forEach((r, i) => {
    const yy = y + hh + i * rh;
    o.push(Rc(x, yy, W, rh, r._fill || (i % 2 ? 'F7F9FC' : C.white), { line: K.line }));
    let cx2 = x; cols.forEach((c, j) => { const v = r[j]; o.push(T(cx2 + 0.07, yy, c.w - 0.14, rh, typeof v === 'object' && v ? [v] : [{ text: String(v ?? '') }], { max: o2.pt || 10.5, min: 7, color: c.color || C.ink, align: c.al || 'left', valign: 'middle', bold: c.b })); cx2 += c.w; });
  });
  return y + hh + rows.length * rh;
}
function buildSlides(p) {
  if (p.kind === 'man') return buildManSlides(p);
  const f = p.f, isClient = f.mode === 'client', S = [], items = outItems(p), g = p.gen;
  let no = 1, sec = 0;
  JOB_NAME[jobKey(p)] = p.J.n;
  const H = t => `${String(++sec).padStart(2, '0')}  ${t}`;
  /* 1. 표지 */
  S.push(coverSlide({ eyebrow: `${APP.org}  ·  ${isClient ? '고객사 제출용' : '사내 표준'}  ·  업무표준화`, title: p.title,
    lines: [p.where, `${p.J.n} · ${p.I.n} · 표준 ${items.length}개`], meta: `${fmtD(p.made)}   |   ${revLabel(p)}   |   ${p.docNo}`,
    badge: `시행 ${fmtD(p.eff).slice(2)}`, badgeColor: K.ink, fig: figName('dio', jobKey(p)) })); no++;
  /* 2. 목차 */
  const hasGen = Object.keys(g).length > 0;
  const toc = ['총칙 — 목적·적용 범위·R&R', p.site ? '적용 사업장 · 직무 개요' : '직무 개요', '업무표준 항목 체계', `업무표준 세부 기준 (${items.length}개)`].concat(hasGen ? ['프로그램 연계 산출 기준'] : []).concat(['현장 표준 교육', '법적 근거', '이행 점검 · 교육 · 개정']);
  const t2 = frame('목차', 'CONTENTS', no, p), colN = Math.ceil(toc.length / 2);
  toc.forEach((t, i) => {
    const col = i < colN ? 0 : 1, row = col ? i - colN : i, x = 1.2 + col * 5.9, y = 1.95 + row * 1.12;
    t2.push(Rc(x, y, 0.95, 0.72, i % 2 ? K.tint : K.tintG, { k: 'para' }));
    t2.push(T(x, y, 0.95, 0.72, String(i + 1).padStart(2, '0'), { pt: 22, bold: true, color: i % 2 ? K.navy : C.green, align: 'center', valign: 'middle' }));
    t2.push(T(x + 1.15, y, 4.4, 0.72, [{ text: t, bold: true }], { max: 19, min: 12, color: C.ink, valign: 'middle' }));
    t2.push(Rc(x + 1.15, y + 0.74, 4.3, 0.015, C.silver));
  });
  S.push(t2); no++;
  /* 3. 총칙 */
  const o3 = frame(H('총칙'), '목적 · 적용 범위 · 운영 원칙 · 책임과 권한', no, p);
  o3.push(Rc(0.6, 1.65, 6.2, 4.8, K.tint, { line: K.line })); o3.push(Rc(0.6, 1.65, 0.07, 4.8, C.green));
  o3.push(T(0.9, 1.75, 5.75, 4.6, listParas(parseGrp(p.scope), { hcolor: C.greenD }), { max: 13.5, min: 8.5 }));
  o3.push(T(7.1, 1.65, 5.6, 0.4, [{ text: '책임과 권한 (R&R)', bold: true }], { pt: 14, color: K.navy }));
  tbl(o3, 7.1, 2.1, [{ t: '구분', w: 1.45, b: 1, color: K.navy }, { t: '역할', w: 1.0, al: 'center' }, { t: '주요 책임', w: 3.2 }], p.raci, { rh: 0.78, pt: 11 });
  S.push(o3); no++;
  /* 4. 사업장 · 직무 개요 */
  if (p.site) {
    const st = p.site, o = frame(H('적용 사업장 현황'), `에스텍베스트 사업장 목록 기준 · ${st.br}지사 관할`, no, p);
    o.push(Rc(0.6, 1.7, 7.2, 4.72, C.white, { line: K.line })); o.push(Rc(0.6, 1.7, 7.2, 1.05, K.tint)); o.push(Rc(0.6, 1.7, 0.07, 1.05, C.green));
    o.push(Rc(0.85, 1.88, 1.25, 0.42, C.green, { k: 'para' })); o.push(T(0.85, 1.88, 1.25, 0.42, st.br + '지사', { pt: 12.5, bold: true, color: C.white, align: 'center', valign: 'middle' }));
    o.push(T(2.25, 1.78, 5.4, 0.9, [{ text: st.name, bold: true }], { max: 24, min: 14, color: K.ink, valign: 'middle' }));
    const kv2 = [['주소', st.addr || '-'], ['계약일', st.since || '-'], ['사업장 유형', st.type || '-'], ['계약 업종', st.work || '-'], ['근무형태', st.shift || '-'], ['현장 책임자', ([st.pos, st.mgr].filter(Boolean).join(' ') || '-') + (st.mtel ? `  ${st.mtel}` : '')], ['사업장 전화', st.stel || '-']];
    kv2.forEach((r, i) => { const y = 2.92 + i * 0.49; o.push(T(0.85, y, 1.55, 0.44, r[0], { pt: 12.5, bold: true, color: C.greenD, valign: 'middle' })); o.push(T(2.45, y, 5.2, 0.44, r[1], { max: 13, min: 9, valign: 'middle' })); if (i < kv2.length - 1) o.push(Rc(0.85, y + 0.46, 6.75, 0.012, 'E3E7ED')); });
    o.push(Rc(8.05, 1.7, 4.7, 4.72, 'FAFBFC', { line: K.line }));
    o.push(T(8.3, 1.8, 4.2, 0.4, [{ text: '계약 인원 구성', bold: true }], { pt: 15, color: C.navy }));
    o.push(T(8.3, 2.2, 2.2, 0.9, [{ text: String(st.total || 0), bold: true }], { pt: 46, color: C.navy }));
    o.push(T(9.75, 2.55, 1.3, 0.45, '명 (총원)', { pt: 14, color: C.gray }));
    o.push(figBox(figName('cute', jobKey(p)), 11.05, 1.75, 1.6, 1.7));
    const bar = (y, label, val, tot, col) => { o.push(T(8.3, y, 1.0, 0.36, label, { pt: 12, bold: true, valign: 'middle' })); o.push(Rc(9.3, y + 0.06, 2.75, 0.24, 'E1E5EC')); if (val > 0) o.push(Rc(9.3, y + 0.06, Math.max(0.06, 2.75 * val / Math.max(1, tot)), 0.24, col)); o.push(T(12.1, y, 0.6, 0.36, String(val), { pt: 12.5, bold: true, color: col, align: 'right', valign: 'middle' })); };
    const T0 = Math.max(1, st.total || 0);
    o.push(T(8.3, 3.25, 4, 0.3, '성별', { pt: 11, color: C.gray })); bar(3.55, '남', st.m || 0, T0, '5B7BD5'); bar(3.95, '여', st.f || 0, T0, 'C46A8E');
    o.push(T(8.3, 4.45, 4, 0.3, '업종별', { pt: 11, color: C.gray })); bar(4.75, '보안', st.sec || 0, T0, K.blu); bar(5.15, '미화', st.cln || 0, T0, K.grn); bar(5.55, '기타', st.etc || 0, T0, K.amber);
    S.push(o); no++;
  }
  { const o = frame(H(`${p.J.n} 직무 개요`), `${p.I.n} 사업장 특성 반영`, no, p);
    o.push(figBox(figName('dio', jobKey(p)), 0.6, 1.65, 2.7, 3.3));
    o.push(T(0.6, 5.05, 2.7, 0.4, `${p.J.e} ${p.J.n}`, { pt: 15, bold: true, color: K.navy, align: 'center' }));
    o.push(Rc(3.55, 1.65, 4.65, 4.8, 'FAFBFC', { line: K.line })); o.push(Rc(3.55, 1.65, 4.65, 0.06, C.green));
    o.push(T(3.75, 1.78, 4.3, 4.6, [{ text: '핵심 직무', bold: true, color: C.greenD }].concat(p.J.duty.map(t => ({ text: '•  ' + t }))), { max: 13, min: 8.5 }));
    o.push(Rc(8.4, 1.65, 4.35, 2.55, K.tint, { line: K.line })); o.push(Rc(8.4, 1.65, 4.35, 0.06, K.navy));
    o.push(T(8.6, 1.78, 4.0, 2.35, [{ text: `산업 특성 — ${p.I.n}`, bold: true, color: K.navy }, { text: p.I.feat, size: 0.9 }].concat(p.I.risk.map(t => ({ text: '•  ' + t, size: 0.9 }))), { max: 12.5, min: 8 }));
    o.push(Rc(8.4, 4.35, 4.35, 2.1, 'FDF1EF', { line: 'F2B8AE' }));
    o.push(T(8.6, 4.45, 4.0, 1.95, [{ text: '금지·제한 업무', bold: true, color: C.brick }].concat(p.J.ban.map(t => ({ text: '•  ' + t, size: 0.9 }))), { max: 12, min: 7.5 }));
    S.push(o); no++; }
  no = linkSlides(p, S, no, H);
  /* 5. 체계 */
  { const o = frame(H('업무표준 항목 체계'), `대 · 중 · 소 분류 — 법정 ${items.filter(x => x.S.g === 'M').length} · 핵심 ${items.filter(x => x.S.g === 'C').length} · 권장 ${items.filter(x => x.S.g === 'R').length}`, no, p);
    const cols = items.length > 16 ? 4 : items.length > 8 ? 3 : 2, rowsN = Math.ceil(items.length / cols), cw = (12.15 - (cols - 1) * 0.15) / cols, chh = Math.min(0.9, (4.75 - (rowsN - 1) * 0.1) / rowsN);
    items.forEach((x, i) => { const cx = 0.6 + (i % cols) * (cw + 0.15), cy = 1.68 + Math.floor(i / cols) * (chh + 0.1);
      o.push(Rc(cx, cy, cw, chh, C.white, { line: K.line })); o.push(Rc(cx, cy, 0.08, chh, GRADE[x.S.g].color));
      o.push(T(cx + 0.2, cy + 0.03, cw - 0.3, chh - 0.06, [{ text: `${x.S.c}  ${x.S.n}`, bold: true }, { text: `${x.L.n} › ${x.M.n} · ${GRADE[x.S.g].label}`, size: 0.78, color: C.gray }], { max: 12.5, min: 7.5, gap: 1, valign: 'middle' })); });
    S.push(o); no++; }
  /* 6. 세부 기준 — 항목별 */
  const secItems = String(++sec).padStart(2, '0');
  items.forEach(x => {
    if (x.S.gen === 'task') { no = sopSlides(x.S, p, S, no, secItems); return; }
    const G = parseGrp(p.text[x.S.c]);
    const pur = (G.find(gg => /^목적/.test(gg.title)) || { lines: [] }).lines.join(' ');
    const steps = (G.find(gg => /^기준·절차/.test(gg.title)) || { lines: [] }).lines;
    const ck = (G.find(gg => /^점검 항목/.test(gg.title)) || { lines: [] }).lines;
    const kpi = (G.find(gg => /^관리 지표/.test(gg.title)) || { lines: [] }).lines;
    const rec = (G.find(gg => /^기록/.test(gg.title)) || { lines: [] }).lines;
    const extra = G.filter(gg => !/^(목적|기준·절차|점검 항목|관리 지표|기록)/.test(gg.title));
    const sub = `${x.L.n} › ${x.M.n}  ·  ${GRADE[x.S.g].label} 표준`;
    const o = frame(`${secItems}  [${x.S.c}] ${x.S.n}`, sub, no, p);
    o.push(Rc(0.6, 1.6, 12.15, 0.62, K.tintG, { line: 'CFE6D7' })); o.push(Rc(0.6, 1.6, 0.07, 0.62, C.green));
    o.push(T(0.85, 1.6, 11.75, 0.62, [{ text: '목적 │ ' + pur }], { max: 13, min: 8.5, valign: 'middle', color: '1F3A2A' }));
    o.push(T(0.6, 2.36, 7.3, 0.36, [{ text: '기준 · 절차', bold: true }], { pt: 13, color: K.navy }));
    o.push(Rc(0.6, 2.74, 7.3, 0.02, K.navy));
    const exP = listParas(extra, { hcolor: C.greenD }), exIn = extra.length && fit(exP, 6.95, 1.12, 11, 9).ok;
    const areaS = exIn ? 2.38 : 3.62;
    const nS = Math.max(1, steps.length), gapS = 0.08, hS = Math.min(0.78, (areaS - gapS * (nS - 1)) / nS);
    if (exIn) { o.push(Rc(0.6, 5.3, 7.3, 1.15, K.tintG, { line: 'CFE6D7' })); o.push(Rc(0.6, 5.3, 0.07, 1.15, C.green)); o.push(T(0.8, 5.34, 7.0, 1.07, exP, { max: 11.5, min: 8.5 })); }
    steps.forEach((t, k) => { const y = 2.86 + k * (hS + gapS);
      o.push(Rc(0.6, y, 7.3, hS, k % 2 ? 'F7F9FC' : C.white, { line: K.line }));
      o.push(Rc(0.6, y, 0.55, hS, k % 2 ? K.blu : C.green));
      o.push(T(0.6, y, 0.55, hS, [{ text: String(k + 1), bold: true }], { pt: 15, color: C.white, align: 'center', valign: 'middle' }));
      o.push(T(1.3, y + 0.02, 6.5, hS - 0.04, t, { max: 14.5, min: 8, valign: 'middle', lh: 1.18 })); });
    o.push(Rc(8.15, 2.38, 4.6, 4.05, 'FAFBFC', { line: K.line })); o.push(Rc(8.15, 2.38, 4.6, 0.06, GRADE[x.S.g].color));
    o.push(T(8.35, 2.5, 4.25, 3.85, [{ text: '점검 항목', bold: true, color: K.navy }].concat(ck.map(t => ({ text: '☐  ' + t, size: 0.92 }))).concat(kpi.length ? [{ text: '관리 지표', bold: true, color: C.greenD }].concat(kpi.map(t => ({ text: '◆  ' + t, size: 0.92 }))) : []).concat(rec.length ? [{ text: '기록·양식: ' + rec.join(', '), size: 0.82, color: C.gray }] : []), { max: 14, min: 7.5, gap: 4 }));
    o.push(T(0.6, 6.5, 12.1, 0.3, '법적 근거: ' + lawShort(x.S.l), { max: 9.5, min: 7, color: '8A93A3' }));
    S.push(o); no++;
    if (extra.length && !exIn) {
      const pages = paginate(listParas(extra, { hcolor: C.greenD }), 11.6, 4.55, 11.5);
      pages.forEach((pg, j) => { const o2 = frame(`${secItems}  [${x.S.c}] ${x.S.n} — 세부 기준${pages.length > 1 ? ` (${j + 1}/${pages.length})` : ''}`, `${p.J.n} · ${p.I.n} 반영`, no, p);
        o2.push(Rc(0.6, 1.7, 0.14, 4.7, C.green)); o2.push(T(0.95, 1.72, 11.75, 4.65, pg, { max: 16, min: 9 })); S.push(o2); no++; });
    }
    no = genSlides(x.S.c, p, S, no, secItems);
  });
  /* 7. 현장 표준 교육 영상 */
  S.push(videoSlide(p, no, `${String(++sec).padStart(2, '0')}  현장 표준 교육 — ${p.J.n}`, `${p.J.n} 근무 영상 · TBM·직무교육 자료`, null, items.map(x => `[${x.S.c}] ${x.S.n}`), jobKey(p))); no++;
  /* 8. 법적 근거 */
  const lawsOn = Object.keys(LAWS).filter(id => p.lawIds.includes(id) && p.lawOn[id]).map(id => LAWS[id]), lsec = String(++sec).padStart(2, '0');
  const byLaw = []; lawsOn.forEach(x => { let gL = byLaw.find(b => b.law === x.law); if (!gL) byLaw.push(gL = { law: x.law, arts: [] }); gL.arts.push(`${x.art}  ${x.title}`); });
  const cards = byLaw.map(gL => ({ gL, h: 0.42 + gL.arts.length * 0.27 + 0.1 })), colsL = 3, cwL = (12.15 - 0.3) / colsL, maxH = 4.75, pagesL = [];
  { let pg = [[], [], []], hs = [0, 0, 0];
    cards.forEach(cd => { let ci = hs.indexOf(Math.min(...hs)); if (hs[ci] + cd.h > maxH) { pagesL.push(pg); pg = [[], [], []]; hs = [0, 0, 0]; ci = 0; } pg[ci].push(Object.assign({ y: hs[ci] }, cd)); hs[ci] += cd.h + 0.12; });
    if (cards.length) pagesL.push(pg); }
  pagesL.forEach((pg, k) => {
    const o = frame(`${lsec}  법적 근거${pagesL.length > 1 ? ` (${k + 1}/${pagesL.length})` : ''}`, `관계 법령 ${lawsOn.length}개 조항 — 조항별 요지는 Word 문서 「법적 근거 종합」 참조 · 적용 전 원문 확인`, no, p);
    pg.forEach((col, ci) => col.forEach(cd => { const x = 0.6 + ci * (cwL + 0.15), y = 1.65 + cd.y;
      o.push(Rc(x, y, cwL, cd.h, C.white, { line: K.line })); o.push(Rc(x, y, cwL, 0.38, K.tint)); o.push(Rc(x, y, 0.07, cd.h, C.green));
      o.push(T(x + 0.18, y, cwL - 0.3, 0.38, [{ text: cd.gL.law, bold: true }], { max: 12.5, min: 9, color: K.navy, valign: 'middle' }));
      o.push(T(x + 0.18, y + 0.44, cwL - 0.3, cd.h - 0.48, cd.gL.arts.map(t => ({ text: '·  ' + t, gap: 1 })), { max: 10.5, min: 7.5, lh: 1.15 })); }));
    S.push(o); no++;
  });
  /* 9. 이행 점검 · 교육 · 개정 */
  { const o = frame(`${String(++sec).padStart(2, '0')}  이행 점검 · 교육 · 개정`, '표준은 만드는 것이 아니라 지키는 것 — PDCA 순환', no, p);
    const ph = [['교육', '시행 전 전원 교육\n교육 확인서 서명', C.green], ['이행', 'TBM · 점검표\n근무일지 기록', K.grn2], ['점검', '월 1회 현장 순회\nA·B·C 평가', K.blu], ['개선', 'C 등급 7일 내 개선\n수평 전개', K.blu2], ['개정', '연 1회 정기 검토\n계약·법령 변경 시', K.ink]];
    ph.forEach((t, i) => { const x = 0.6 + i * 2.45; o.push(Rc(x, 1.75, 2.35, 0.72, t[2], { k: 'chevron' })); o.push(T(x + 0.3, 1.75, 1.75, 0.72, [{ text: t[0], bold: true }], { pt: 18, color: C.white, align: 'center', valign: 'middle' }));
      o.push(Rc(x + 0.05, 2.65, 2.25, 1.15, 'FAFBFC', { line: K.line })); o.push(T(x + 0.15, 2.7, 2.05, 1.05, t[1], { max: 12.5, min: 9, align: 'center', valign: 'middle', color: C.ink })); });
    const nCk = items.reduce((a, x) => a + ((parseGrp(p.text[x.S.c]).find(gg => /^점검 항목/.test(gg.title)) || { lines: [] }).lines.length), 0);
    o.push(Rc(0.6, 4.05, 6.0, 2.35, K.tintG, { line: 'CFE6D7' }));
    o.push(T(0.85, 4.12, 5.6, 2.2, [{ text: '붙임 양식 (Word 문서 수록)', bold: true, color: C.greenD }, { text: `•  붙임 1. 업무표준 이행 점검표 — 점검 항목 ${nCk}개` }, { text: '•  붙임 2. 업무표준 교육 확인서 — 교육 후 전원 서명' }, { text: `•  제·개정 이력 — ${revLabel(p)} · 시행 ${fmtD(p.eff)}` }], { max: 13.5, min: 9 }));
    o.push(Rc(6.85, 4.05, 5.9, 2.35, C.white, { line: K.line }));
    const mg = (typeof UI !== 'undefined' && UI.manager) || null, mph = mg && mg.photo ? mg.photo : (mg && /최민영/.test(mg.name) ? ASSET.fig.mgr : null);
    if (mph) o.push(mph === ASSET.fig.mgr ? figBox('mgr', 7.05, 4.25, 1.3, 1.6) : Im(7.05, 4.35, 1.3, 1.3, mph));
    o.push(T(mph ? 8.55 : 7.1, 4.25, 4.0, 2.0, [{ text: '표준 관리 책임', size: 0.8, color: K.mute }, { text: mg ? `${mg.title || ''} ${mg.name}`.trim() : (f.approver || f.dept), bold: true, color: K.ink }, { text: mg ? (mg.org || f.dept) : f.dept, size: 0.8, color: K.mute }, { text: `작성 ${f.author || '-'} · 검토 ${f.reviewer || '-'} · 승인 ${f.approver || '-'}`, size: 0.75, color: K.mute }], { max: 15, min: 9, gap: 2 }));
    S.push(o); no++; }
  /* 10. 맺음 */
  S.push(closingSlide({ fig: 'team', tag: '표준으로 일하고, 기록으로 증명합니다 — 어느 현장에서나 같은 품질을 약속드립니다.', org: `${APP.org}  ·  ${f.dept}` }));
  return S;
}
/* 연계 산출 슬라이드 */
function genSlides(code, p, S, no, secN) {
  const g = p.gen;
  if (code === 'A2-01' && g.sop) {
    const s = g.sop, o = frame(`${secN}  표준 업무량 요약 — ${p.J.n} × ${p.I.n}`, `업무량 기반 산정 프로그램(WBE) 업무 분류 · 업무 ${s.rows.length}개`, no, p);
    o.push(Rc(0.6, 1.65, 3.6, 4.8, K.tint, { line: K.line }));
    o.push(T(0.8, 1.75, 3.2, 0.4, [{ text: '월 업무시간', bold: true }], { pt: 13, color: C.gray }));
    o.push(T(0.8, 2.1, 3.2, 0.9, [{ text: won(s.total) + 'h', bold: true }], { max: 40, min: 20, color: K.navy }));
    o.push(T(0.8, 3.1, 3.2, 0.4, [{ text: '업무량 기준 필요 인원', bold: true }], { pt: 13, color: C.gray }));
    o.push(T(0.8, 3.45, 3.2, 0.9, [{ text: s.fte.toFixed(1) + '명', bold: true }], { pt: 40, color: C.green }));
    o.push(T(0.8, 4.5, 3.2, 1.8, [{ text: `1인 월 가용 ${s.avail.toFixed(1)}h (주40h · 비가동 6%)` }, { text: `"매일" 업무 = 월 ${s.days}일 기준` }, { text: '상주 업무는 교대 조 수로 별도 확인' }, { text: `수량·빈도: WBE「${p.I.n}」 기본규모 기준 — 실측값은 WBE에서 재산정`, color: C.brick }], { max: 11, min: 8, color: C.gray }));
    const big = Object.entries(s.byBig).sort((a, b) => b[1] - a[1]).slice(0, 7), mx = Math.max(...big.map(b => b[1]), 1);
    o.push(T(4.5, 1.65, 8, 0.4, [{ text: '대분류별 월 업무시간', bold: true }], { pt: 13, color: K.navy }));
    big.forEach(([k, v], i) => { const y = 2.12 + i * 0.6; o.push(T(4.5, y, 2.4, 0.45, k, { max: 12, min: 8, bold: true, valign: 'middle' })); o.push(Rc(6.95, y + 0.1, 4.6, 0.26, 'E1E5EC')); o.push(Rc(6.95, y + 0.1, Math.max(0.05, 4.6 * v / mx), 0.26, i % 2 ? K.blu : C.green)); o.push(T(11.6, y, 1.1, 0.45, won(v) + 'h', { pt: 11, bold: true, align: 'right', valign: 'middle' })); });
    S.push(o); no++;
    const rows = s.rows.slice().sort((a, b) => b.mon - a.mon).slice(0, 12).map(r => [r.big, r.n + (r.post ? ' (상주)' : ''), r.min, `${r.qty}${r.unit}`, `${PER_N[r.per]} ${r.freq}회`, (r.mon / 60).toFixed(1)]);
    const o2 = frame(`${secN}  표준시간표 — 월 업무시간 상위 12개`, '전체 목록은 Word 문서 표준시간표 참조', no, p);
    tbl(o2, 0.6, 1.65, [{ t: '대분류', w: 2.0 }, { t: '업무', w: 5.35 }, { t: '단위(분)', w: 1.1, al: 'center' }, { t: '수량', w: 1.3, al: 'center' }, { t: '빈도', w: 1.3, al: 'center' }, { t: '월(h)', w: 1.1, al: 'right', b: 1, color: K.navy }], rows, { rh: 0.37, pt: 10.5 });
    S.push(o2); no++;
  }
  if (code === 'A2-02' && g.time && g.time.length) {
    const rowsAll = g.time; const perP = 13;
    for (let k = 0; k < rowsAll.length; k += perP) {
      const ch = rowsAll.slice(k, k + perP), o = frame(`${secN}  일일 근무 타임테이블${rowsAll.length > perP ? ` (${k / perP + 1}/${Math.ceil(rowsAll.length / perP)})` : ''}`, `${p.code.id} ${p.code.name} · ${p.code.ltype}`, no, p);
      ch.forEach((r, i) => { const y = 1.62 + i * 0.37;
        if (r.head) { o.push(Rc(0.6, y, 12.15, 0.34, C.green)); o.push(T(0.8, y, 11.8, 0.34, [{ text: r.head, bold: true }], { pt: 11.5, color: C.white, valign: 'middle' })); return; }
        o.push(Rc(0.6, y, 12.15, 0.34, r.br ? 'FFF6E0' : (i % 2 ? 'F7F9FC' : C.white), { line: K.line }));
        o.push(T(0.75, y, 1.2, 0.34, [{ text: r.t, bold: true }], { pt: 11.5, color: K.navy, valign: 'middle' })); o.push(T(2.1, y, 10.5, 0.34, r.a, { max: 11.5, min: 8, valign: 'middle' })); });
      o.push(figBox(figName('cute', jobKey(p)), 11.3, 5.2, 1.3, 1.2)); S.push(o); no++;
    }
  }
  if ((code === 'B1-01' || code === 'G1-02') && g.shift && !(code === 'G1-02' && p.items.some(x => x.S.c === 'B1-01'))) {
    const all = g.shift.slice().sort((a, b) => b.on - a.on), perP = 9;
    for (let k = 0; k < Math.min(all.length, 27); k += perP) {
      const o = frame(`${secN}  근무조 코드 · 근무형태 지표${all.length > perP ? ` (${k / perP + 1}/${Math.ceil(Math.min(all.length, 27) / perP)})` : ''}`, `근태관리 프로그램 근무조 코드 · ${p.J.n} ${all.length}종 · ★ 기준 근무형태`, no, p);
      tbl(o, 0.6, 1.65, [{ t: '코드', w: 1.7, b: 1, color: K.navy }, { t: '근무형태 · 시간', w: 3.9 }, { t: '순환', w: 1.4, al: 'center' }, { t: '근로형태', w: 1.05, al: 'center' }, { t: '월 실근로', w: 1.05, al: 'center' }, { t: '24h 조 수', w: 0.95, al: 'center' }, { t: '법정 확인', w: 2.1 }],
        all.slice(k, k + perP).map(({ c, m, on }) => Object.assign([(on ? '★ ' : '') + c.id, c.name.replace(/^\S+\s/, ''), c.seq, c.ltype, m.hours.toFixed(0) + 'h', m.crews + '조', m.warn || '적합'], on ? { _fill: 'E8F5EC' } : {})), { rh: 0.48, pt: 10 });
      o.push(T(0.6, 6.45, 12, 0.3, 'A 주간 · B 야간 · K 격일(24h) · D 휴무 — 조 수 = 순환 일수 ÷ 근무일 수(주·야 중 큰 값), 연차·결원 예비 인력 별도', { pt: 9.5, color: '8A93A3' }));
      S.push(o); no++;
    }
  }
  if (code === 'B2-01' && g.att) {
    const o = frame(`${secN}  근태 기호 · 시간가감 환산`, '근태관리 프로그램 기준 — 급여와 연동되는 가장 중요한 항목', no, p);
    g.att.syms.forEach((s, i) => { const x = 0.6 + (i % 4) * 1.6, y = 1.7 + Math.floor(i / 4) * 0.95; o.push(Rc(x, y, 1.5, 0.85, i < 4 ? K.tint : K.tintG, { line: K.line })); o.push(T(x, y + 0.04, 1.5, 0.42, [{ text: s[0], bold: true }], { pt: 18, color: i < 4 ? K.navy : C.green, align: 'center' })); o.push(T(x + 0.05, y + 0.45, 1.4, 0.38, s[1], { max: 10, min: 7, align: 'center', color: C.gray })); });
    o.push(Rc(7.2, 1.7, 5.55, 4.7, 'FAFBFC', { line: K.line })); o.push(Rc(7.2, 1.7, 5.55, 0.06, C.green));
    o.push(T(7.4, 1.82, 5.2, 4.5, [{ text: '시간가감 환산', bold: true, color: K.navy }].concat(g.att.conv.map(t => ({ text: '•  ' + t }))), { max: 13.5, min: 9, gap: 6 }));
    S.push(o); no++;
  }
  if (code === 'F1-02' && g.cmp) {
    const o = frame(`${secN}  Complaint 유형 ↔ 예방 표준`, 'S-Tec Complaint Response System 분류 코드 연계 — 접수 시 대응, 평소에는 표준으로 예방', no, p);
    const half = Math.ceil(g.cmp.length / 2);
    [g.cmp.slice(0, half), g.cmp.slice(half)].forEach((part, j) => tbl(o, 0.6 + j * 6.15, 1.65, [{ t: 'Complaint', w: 2.95 }, { t: '예방 표준', w: 3.0, b: 1, color: C.green }],
      part.map(r => { const s = findSmall(r[2]); return [`${r[0]} ${r[1]}`, `${r[2]} ${s ? s.S.n : ''}`]; }), { rh: Math.min(0.45, 4.6 / half), pt: 10 }));
    S.push(o); no++;
  }
  if ((code === 'G2-01' || (code === 'G2-02' && !p.items.some(x => x.S.c === 'G2-01'))) && g.quote) {
    const o = frame(`${secN}  견적 기준 요율 · 산식`, '에스텍시스템 견적 기준 (S-Tec-Quotation-System · S-Tec short estimate)', no, p);
    tbl(o, 0.6, 1.7, [{ t: '연도', w: 1.4, al: 'center', b: 1 }, { t: '최저시급', w: 1.8, al: 'right' }, { t: '월 209h', w: 1.9, al: 'right' }, { t: '국민연금', w: 1.4, al: 'center' }, { t: '고용보험', w: 1.4, al: 'center' }, { t: '사업주 4대보험 계', w: 2.2, al: 'center', b: 1, color: K.navy }],
      g.quote.y.map(q => [q.y + '년', won(q.r.wage) + '원', won(q.base) + '원', q.r.pension + '%', q.r.emp + '%', q.ins.toFixed(2) + '%']), { rh: 0.55, pt: 13, hh: 0.5 });
    const q = g.quote.y[0], d = 8 * q.r.wage, tot = d * (1 + q.ins / 100) * 1.05;
    o.push(Rc(0.6, 3.55, 12.15, 2.85, K.tint, { line: K.line })); o.push(Rc(0.6, 3.55, 0.07, 2.85, K.navy));
    o.push(T(0.9, 3.65, 11.6, 2.7, [{ text: '단기인력 견적 산식', bold: true, color: K.navy }, { text: SHORT_FORMULA }, { text: `예시(2026년 · 주간 8시간): 8h × ${won(q.r.wage)}원 = ${won(d)}원 → × (1 + ${q.ins.toFixed(2)}%) × 1.05 = 1인 1일 ${won(tot)}원 (VAT 별도)`, color: C.greenD, bold: true }, { text: '건강 3.595% · 장기요양 건강보험료의 13.14% · 산재 0.86%(업종별 상이) 포함 — 견적서 상호 「에스텍」, 요율 「에스텍시스템」 기준', size: 0.8, color: C.gray }], { max: 15, min: 9, gap: 6 }));
    S.push(o); no++;
  }
  return no;
}


/* ---------- PPT 렌더 (pptxgenjs) ---------- */
async function makePptx(p, slidesIn, titleIn) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; pptx.author = APP.maker; pptx.company = APP.org; pptx.title = titleIn || docTitle(p);
  const SHP = { rect: pptx.ShapeType.rect, para: pptx.ShapeType.parallelogram, chevron: pptx.ShapeType.chevron, homePlate: pptx.ShapeType.homePlate, ellipse: pptx.ShapeType.ellipse };
  const slides = slidesIn || buildSlides(p);
  const vids = {}, covers = {};
  for (const el of slides.flat()) if (el.t === 'video' && !(el.key in vids)) { vids[el.key] = await fetchVideo(el.key); covers[el.key] = await toPng(el.src); }
  slides.forEach(els => {
    const s = pptx.addSlide();
    els.forEach(e => {
      if (e.t === 'img') s.addImage({ data: e.src, x: e.x, y: e.y, w: e.w, h: e.h });
      else if (e.t === 'video') {
        if (vids[e.key]) s.addMedia({ type: 'video', data: 'video/mp4;base64,' + vids[e.key], cover: covers[e.key], x: e.x, y: e.y, w: e.w, h: e.h, extn: 'mp4' });
        else { s.addImage({ data: e.src, x: e.x, y: e.y, w: e.w, h: e.h, hyperlink: { url: vidUrl(e.key), tooltip: '영상 재생' } }); s.addText('▶ 누르면 영상 재생(인터넷 연결 시)', { x: e.x, y: e.y + e.h - 0.45, w: e.w, h: 0.4, fontSize: 12, bold: true, color: 'FFFFFF', fill: { color: '0B1757', transparency: 20 }, align: 'center', fontFace: '맑은 고딕', hyperlink: { url: vidUrl(e.key) } }); }
      }
      else if (e.t === 'shape') s.addShape(SHP[e.k], { x: e.x, y: e.y, w: e.w, h: e.h, fill: { color: e.fill }, line: e.line ? { color: e.line, width: e.lw || 0.75 } : { type: 'none' } });
      else if (e.t === 'text') {
        const runs = e.paras.map((q, i) => ({ text: q.text, options: { bold: q.bold ?? e.bold, color: q.color || e.color, fontSize: +(e.pt * (q.size || 1)).toFixed(1), breakLine: i < e.paras.length - 1, paraSpaceAfter: i < e.paras.length - 1 ? (q.gap ?? e.gap) : 0 } }));
        s.addText(runs, { x: e.x, y: e.y, w: e.w, h: e.h, fontFace: '맑은 고딕', fontSize: e.pt, color: e.color, align: e.align, valign: e.valign, margin: 0, lineSpacingMultiple: e.lh, wrap: true, fit: 'none' });
      }
    });
  });
  return await ooxmlPack(await JSZip.loadAsync(await pptx.write({ outputType: 'blob' })), 'application/vnd.openxmlformats-officedocument.presentationml.presentation', true);
}

/* ---------- PDF 렌더 (같은 슬라이드 모델 → HTML → 이미지 → PDF) ---------- */
function slideDom(els) {
  const d = document.createElement('div'); d.className = 'slide';
  els.forEach(e => {
    const n = document.createElement('div'); n.style.cssText = `position:absolute;left:${e.x * DPI}px;top:${e.y * DPI}px;width:${e.w * DPI}px;height:${e.h * DPI}px;`;
    if (e.t === 'img' || e.t === 'video') { const im = document.createElement('img'); im.src = e.src; im.style.cssText = 'width:100%;height:100%;display:block;object-fit:cover'; n.appendChild(im);
      if (e.t === 'video') { n.dataset.vid = e.key; const cap = document.createElement('div'); cap.style.cssText = 'position:absolute;left:0;right:0;bottom:0;padding:6px 10px;background:rgba(11,23,87,.82);color:#fff;font:700 15px/1.3 ' + SFONT + ';text-align:center'; cap.textContent = '▶ 누르면 영상 재생 (PPT·웹 매뉴얼에서는 바로 재생)'; n.appendChild(cap); const pl = document.createElement('div'); pl.style.cssText = 'position:absolute;left:50%;top:50%;width:92px;height:92px;margin:-46px 0 0 -46px;border-radius:50%;background:rgba(15,21,48,.72);box-shadow:0 0 0 4px rgba(255,255,255,.85)'; pl.innerHTML = '<div style="position:absolute;left:36px;top:26px;width:0;height:0;border-left:30px solid #fff;border-top:20px solid transparent;border-bottom:20px solid transparent"></div>'; n.appendChild(pl); } }
    else if (e.t === 'shape') {
      n.style.background = '#' + e.fill; if (e.line) n.style.boxShadow = `inset 0 0 0 1px #${e.line}`;
      const o = Math.min(e.w, e.h) * DPI, W = e.w * DPI;
      if (e.k === 'para') n.style.clipPath = `polygon(${o * 0.25}px 0,100% 0,${W - o * 0.25}px 100%,0 100%)`;
      if (e.k === 'chevron') n.style.clipPath = `polygon(0 0,${W - o * 0.5}px 0,100% 50%,${W - o * 0.5}px 100%,0 100%,${o * 0.5}px 50%)`;
      if (e.k === 'homePlate') n.style.clipPath = `polygon(0 0,${W - o * 0.5}px 0,100% 50%,${W - o * 0.5}px 100%,0 100%)`;
      if (e.k === 'ellipse') n.style.borderRadius = '50%';
    } else {
      n.style.display = 'flex'; n.style.flexDirection = 'column'; n.style.justifyContent = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[e.valign];
      n.style.textAlign = e.align; n.style.fontFamily = SFONT; n.style.wordBreak = 'keep-all'; n.style.overflowWrap = 'anywhere';
      e.paras.forEach((q, i) => {
        const pdv = document.createElement('div'); pdv.textContent = q.text;
        pdv.style.cssText = `font-size:${e.pt * (q.size || 1) * PT}px;line-height:${e.lh};color:#${q.color || e.color};font-weight:${(q.bold ?? e.bold) ? 700 : 400};margin-bottom:${i < e.paras.length - 1 ? (q.gap ?? e.gap) * PT : 0}px;white-space:pre-wrap`;
        n.appendChild(pdv);
      });
    }
    d.appendChild(n);
  });
  return d;
}
async function makePdf(p, onProgress, slidesIn, titleIn) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [SW, SH], compress: true });
  const host = $('#render'); host.innerHTML = '';
  const slides = slidesIn || buildSlides(p);
  for (let i = 0; i < slides.length; i++) {
    onProgress && onProgress(i + 1, slides.length);
    const d = slideDom(slides[i]); host.innerHTML = ''; host.appendChild(d);
    await Promise.all([...d.querySelectorAll('img')].map(im => im.decode ? im.decode().catch(() => { }) : null));
    const cv = await html2canvas(d, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
    if (i) pdf.addPage([SW, SH], 'landscape');
    pdf.addImage(cv.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, SW, SH);
    slides[i].filter(e => e.t === 'video').forEach(e => { try { pdf.link(e.x, e.y, e.w, e.h, { url: vidUrl(e.key) }); } catch (er) { } });
  }
  host.innerHTML = '';
  pdf.setProperties({ title: titleIn || docTitle(p), author: APP.maker, creator: `${APP.name} ${APP.version}` });
  return pdf.output('blob');
}

/* =====================================================================
 * 5) 이벤트 / 기록
 * ===================================================================== */
function busy(on, msg) { $('#busy').classList.toggle('on', on); if (msg) $('#busyMsg').textContent = msg; }
async function run(kind) {
  const p = syncEditor(); if (!p) return toast('먼저 [생성] 버튼을 누르세요.');
  try {
    const base = fileBase(p);
    if (kind === 'docx' || kind === 'all') { busy(true, p.kind === 'man' ? 'Word 업무매뉴얼 생성 중… (사진·QR 포함)' : 'Word 업무표준서 생성 중…'); await download(await (p.kind === 'man' ? makeManDocx(p) : makeDocx(p)), base + '.docx');
      if (p.kind === 'man' && formIdsOf(p, outItems(p)).length) { busy(true, '업무 서식집 Word 생성 중…'); await download(await makeFormsDocx(p.f), formsFileName(p.f)); } }
    if (kind === 'pptx' || kind === 'all') { busy(true, 'PPT 생성 중… (현장 영상 포함)'); await download(await makePptx(p), base + '.pptx'); }
    if (kind === 'pdf' || kind === 'all') { await download(await makePdf(p, (i, n) => busy(true, `PDF 변환 중… ${i}/${n}`)), base + '.pdf'); }
    if (kind === 'web') { busy(true, '웹 매뉴얼 만드는 중…'); await download(await makeWebShow(p, null, null, m => busy(true, '웹 매뉴얼 — ' + m)), base + '_웹매뉴얼(영상재생).html'); }
    saveHistory(p); toast('출력 완료 — 다운로드 폴더를 확인하세요.');
  } catch (e) { console.error(e); toast('생성 오류: ' + e.message, 5000); }
  finally { busy(false); }
}
const HKEY = 'stos_hist';
function saveHistory(p) {
  try {
    const h = readHist();
    const f2 = Object.assign({}, p.f); delete f2.siteObj;
    h.unshift({ at: fmtD(kstNow()), kind: p.kind || 'std', client: p.f.client, title: p.title, names: p.items.map(x => x.S.c), f: f2, siteId: p.site ? p.site.id : null, picked: p.items.map(x => x.S.c) });
    storeHistory(h.slice(0, 20)); renderHistory();
  } catch (e) { }
}
function storeHistory(h) { localStorage.setItem(HKEY, JSON.stringify(h)); }   // 로그인 시 서버 동기화(auth 모듈이 이 함수를 감쌈)
function readHist() { try { return JSON.parse(localStorage.getItem(HKEY) || '[]'); } catch (e) { return []; } }
const HSEL = new Set();
function renderHistory() {
  const h = readHist();
  [...HSEL].forEach(i => { if (i >= h.length) HSEL.delete(i); });
  $('#histTools').innerHTML = h.length ? `<label class="hchk"><input type="checkbox" id="hAll" ${HSEL.size && HSEL.size === h.length ? 'checked' : ''}> 전체 선택</label>
    <span class="hcnt">${h.length}건${HSEL.size ? ` · ${HSEL.size}건 선택` : ''}</span>
    <button class="btn l" id="hDelSel" ${HSEL.size ? '' : 'disabled'}>🗑 선택 삭제</button><button class="btn l" id="hDelAll">전체 삭제</button>` : '';
  $('#hist').innerHTML = h.length ? h.map((x, i) => `<li data-i="${i}" class="${HSEL.has(i) ? 'sel' : ''}"><input type="checkbox" class="hsel" data-i="${i}" ${HSEL.has(i) ? 'checked' : ''} aria-label="선택">
      <div class="hb"><b>${x.kind === 'man' ? '📘 ' : '📋 '}${esc(x.title || x.client)}</b><span>${esc(x.client)} · ${x.kind === 'man' ? '매뉴얼' : '표준'} ${(x.picked || []).length}개</span><em>${esc(x.at)}</em></div>
      <button class="hdel" data-del="${i}" title="이 기록 삭제">🗑</button></li>`).join('') : '<li class="empty">출력 기록이 없습니다.</li>';
  if (!h.length) return;
  $('#hAll').onchange = e => { HSEL.clear(); if (e.target.checked) h.forEach((_, i) => HSEL.add(i)); renderHistory(); };
  $('#hDelSel').onclick = () => confirmDel(`선택한 ${HSEL.size}건을 삭제할까요?`, () => { storeHistory(readHist().filter((_, i) => !HSEL.has(i))); HSEL.clear(); renderHistory(); toast('선택한 기록을 삭제했습니다'); });
  $('#hDelAll').onclick = () => confirmDel(`출력 기록 ${h.length}건을 모두 삭제할까요?`, () => { storeHistory([]); HSEL.clear(); renderHistory(); toast('출력 기록을 모두 삭제했습니다'); });
}
function confirmDel(msg, ok) {
  openModal(`<h2>기록 삭제</h2><div class="sub">${esc(msg)}<br>삭제한 기록은 되살릴 수 없습니다. (로그인 시 다른 기기에서도 함께 지워집니다)</div>
    <div class="mrow"><button class="btn" id="mClose">취소</button><button class="btn pri" id="dOk" style="background:#C62828">삭제</button></div>`, md => {
    md.querySelector('#mClose').onclick = closeModal; md.querySelector('#dOk').onclick = () => { closeModal(); ok(); };
  });
}
function histClick(e) {
  const del = e.target.closest('[data-del]');
  if (del) { const i = +del.dataset.del, h = readHist(); confirmDel(`「${h[i] ? (h[i].title || h[i].client) : ''}」 기록을 삭제할까요?`, () => { const hh = readHist(); hh.splice(i, 1); HSEL.clear(); storeHistory(hh); renderHistory(); toast('기록을 삭제했습니다'); }); return; }
  const cb = e.target.closest('.hsel');
  if (cb) { const i = +cb.dataset.i; cb.checked ? HSEL.add(i) : HSEL.delete(i); renderHistory(); return; }
  const li = e.target.closest('li[data-i]'); if (li) loadHistory(+li.dataset.i);
}
function loadHistory(i) {
  const h = readHist()[i]; if (!h) return;
  setKind(h.kind || 'std', true); if (h.f.level) { state.level = h.f.level; $('#f_level').value = h.f.level; }
  if (h.siteId) { const st = SITES.find(x => x.id === h.siteId); if (st) selectSite(st, true); }
  const map = { client: 'f_client', title: 'f_title', ind: 'f_ind', rev: 'f_rev', eff: 'f_eff', dept: 'f_dept', author: 'f_author', reviewer: 'f_reviewer', approver: 'f_approver', special: 'f_special', reason: 'f_reason' };
  if (h.f.job) setJob(h.f.job, true);
  Object.entries(map).forEach(([k, id]) => { if (h.f[k] != null) $('#' + id).value = h.f[k]; });
  if (h.f.title) $('#f_title').dataset.touched = '1';
  if (h.f.code) { state.code = h.f.code; renderCodes(); }
  state.picked = (h.picked || []).filter(findSmall); renderTree(); renderPicked(); toast('불러왔습니다. [생성]을 눌러 주세요.');
}
function sample() {
  const tcc = SITES.find(x => x.id === 25) || SITES[0]; selectSite(tcc, true);
  setJob('sec', true); $('#f_ind').value = 'factory';
  state.code = 'SEC-S32-01'; renderCodes();
  $('#f_special').value = '정문 차량 출입 시 차단기 상시개방 금지 — 등록 차량만 개방\n화재경보 발생 시 수신기 임의 복구 금지, 방재실 보고 후 복구\n야간 순찰 2시간 간격, 순찰 체크포인트 6개소 기록\n협력업체 차량은 사전 등록 명단으로만 출입 허용';
  $('#f_reason').value = '고객사 Complaint(차단기·화재경보) 재발방지를 위한 업무표준 제정';
  state.picked = []; pickPackage(); if (state.kind === 'std') ['A2-04', 'B2-01', 'F1-01'].forEach(c => { if (!state.picked.includes(c)) state.picked.push(c); }); sortPicked();
  autoTitle(); renderTree(); renderPicked(); toast('예시(보안 · 제조공장)를 채웠습니다. [생성]을 누르세요.');
}
function siteCommon() {
  state.site = null; $('#f_client').value = '에스텍 그룹 전사 공통'; renderSiteInfo(); renderSites(); autoTitle(); toast('전사 공통 표준으로 작성합니다.');
}
async function init() {
  sopTaxInit(); emgTaxInit();
  $('#f_ind').innerHTML = IND_ORDER.map(k => `<option value="${k}">${IND[k].n}</option>`).join('');
  $('#f_level').innerHTML = Object.entries(MAN_LEVEL).map(([k, v]) => `<option value="${k}" ${k === state.level ? 'selected' : ''}>${v.n} — ${v.s}</option>`).join('');
  const t = kstNow(); $('#f_eff').value = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
  $('#f_dept').value = APP.branch;
  renderJobChips(); renderCodes();
  uiInit();
  const nS = kbFlat().length, nM = STD.reduce((a, L) => a + L.mids.length, 0);
  if ($('#stat')) $('#stat').textContent = `표준 ${nS} · 매뉴얼 ${MAN.length}장 ${MAN.reduce((a, L) => a + L.mids[0].smalls.length, 0)}절 · 상황별 대처 ${SCN.length} · 판례 ${CASES.length} · 서식 ${FORMS.length} · 법령 ${Object.keys(LAWS).length - 1} · 업무 ${Object.values(WBE.tasks).reduce((a, r) => a + r.length, 0)} · 근무조 ${AMS_CODES.length}`;
  void nM;
  renderTree(); renderPicked(); renderHistory();
  $('#q').addEventListener('input', e => renderTree(e.target.value));
  $('#tree').addEventListener('click', e => { const li = e.target.closest('li.sm'); if (li) togglePick(li.dataset.c); });
  $('#picked').addEventListener('click', e => { const b = e.target.closest('button[data-x]'); if (b) togglePick(b.dataset.x); });
  $('#sugg').addEventListener('click', e => { const b = e.target.closest('button.sg'); if (b && !state.picked.includes(b.dataset.c)) togglePick(b.dataset.c); });
  document.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => setKind(b.dataset.kind));
  $('#f_level').onchange = e => { state.level = e.target.value; autoTitle(); renderTree($('#q').value); if (state.kind === 'man') { state.picked = []; pickPackage(); } };
  $('#f_ind').addEventListener('change', autoTitle);
  $('#jobChips').onclick = e => { const b = e.target.closest('button[data-job]'); if (b) setJob(b.dataset.job); };
  $('#f_code').onchange = e => { state.code = e.target.value; renderCodes(); };
  $('#f_title').addEventListener('input', e => e.target.dataset.touched = '1');
  $('#f_client').addEventListener('input', autoTitle);
  $('#btnSugg').onclick = suggest; $('#btnSample').onclick = sample; $('#btnPack').onclick = pickPackage; $('#siteCommon').onclick = siteCommon;
  $('#btnClear').onclick = () => { state.picked = []; renderTree($('#q').value); renderPicked(); };
  $('#btnGen').onclick = () => { const p = state.kind === 'man' ? buildManPlan(readForm()) : buildPlan(); if (!p) return; state.plan = p; renderEditor(p); toast(p.kind === 'man' ? '업무매뉴얼이 생성되었습니다. 검토 후 출력하세요.' : '업무표준안이 생성되었습니다. 검토 후 출력하세요.'); if (innerWidth < 1100) $('#outPanel').scrollIntoView({ behavior: 'smooth' }); };
  document.querySelectorAll('input[name=mode]').forEach(r => r.onchange = () => { if (state.plan) { syncEditor(); renderEditor(state.plan); } });
  $('#btnDocx').onclick = () => run('docx'); $('#btnPptx').onclick = () => run('pptx'); $('#btnPdf').onclick = () => run('pdf'); $('#btnAll').onclick = () => run('all'); $('#btnForms').onclick = runForms; $('#btnPkg').onclick = runPackage;
  $('#hist').addEventListener('click', histClick);
  try { initLinkUI(); } catch (e) { console.error('견적 연동 화면', e); }
  await buildSignature(kstNow());
  $('#sigImg').src = state.sigDataUrl;
}
window.addEventListener('DOMContentLoaded', init);
