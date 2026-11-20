/* =====================================================================
 * 견적 연동 · 엑셀/PDF 견적서 불러오기 — 에스텍 제안서 제작시스템(S-Tec Proposal Production System) v2.1.0과 같은 모듈
 *  (link.js · xlsest.js 이식, 금액 표시는 wonL) · Designed & Developed by Rat Rae Choi
 * ===================================================================== */
function libUrl(p) { return /^(https?|capacitor):/.test(location.protocol) || location.protocol === 'http:' ? new URL(p, location.href).href : APP.shareUrl + p; }
function loadScriptOnce(src) { return new Promise((ok, no) => { if (document.querySelector(`script[data-src="${src}"]`)) return ok(); const s = document.createElement('script'); s.src = src; s.dataset.src = src; s.onload = ok; s.onerror = () => no(new Error('불러오기 실패: ' + src)); document.head.appendChild(s); }); }
function readAs(file, how) { return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => no(r.error); r['readAs' + how](file); }); }
let _pdfjs = null;
async function pdfLib() {
  if (_pdfjs) return _pdfjs;
  _pdfjs = await import(libUrl('lib/pdf/pdf.min.mjs'));
  const src = await (await fetch(libUrl('lib/pdf/pdf.worker.min.mjs'))).text();
  _pdfjs.GlobalWorkerOptions.workerPort = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })), { type: 'module' });
  return _pdfjs;
}

/* =====================================================================
 * 견적 연동 — 3개 견적 프로그램 ↔ 제안서 제작시스템
 *   ① S-Tec-Quotation-System (용역인력 견적, stqs)
 *   ② Workload-Based Cost and Labor Estimation Method (업무량 기반 산정, wbe)
 *   ③ S-Tec short estimate (단기인력 견적, stse)
 * 연동 방식
 *   A. 각 견적 프로그램의 「📑 제안서로 보내기」 → 'stec_proposal_inbox' (이 기기 + 통합 로그인 서버)  ← 금액까지 정확
 *   B. 각 견적 프로그램이 저장한 견적 보관함(같은 주소·같은 계정 서버 동기화)을 직접 읽기     ← 인원·구성 위주
 *   C. 연동 파일(.json) 불러오기 · 직접 입력
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const LINK_KEY = 'stec_proposal_inbox';
const SRC = {
  stqs: { n: '용역인력 견적', full: 'S-Tec-Quotation-System', ic: '🧾', color: '0B1F8A', url: 'https://sadness500-boop.github.io/S-Tec-Quotation-System/', unit: '월' },
  wbe:  { n: '업무량 기반 산정', full: 'Workload-Based Cost and Labor Estimation Method', ic: '📐', color: 'E8750A', url: 'https://sadness500-boop.github.io/Workload-Based-Cost-and-Labor-Estimation-Method/', unit: '월' },
  stse: { n: '단기인력 견적', full: 'S-Tec short estimate', ic: '⏱', color: '7A2E8E', url: 'https://sadness500-boop.github.io/S-Ttec-short-estimate/', unit: '건' },
  manual: { n: '직접 입력', full: '제안서 제작시스템 직접 입력', ic: '✍', color: '475569', url: '', unit: '월' }
};
const LINK = { items: [], picked: new Set(), serverAt: null, serverMsg: '' };
const QCAT = { sec: '보안(경비)', cln: '미화', park: '주차', fac: '시설관리', spc: '특수직군', etc: '기타직군' };
const QSHIFT = k => ({ s32: '3조2교대', s42: '4조2교대', s52: '5조2교대', s22: '2조2교대', alt: '격일제', day5_8: '주5일 주간(8h)', day5_9: '주5일 주간(9h)', day6_8: '주6일 주간(8h)' }[k] || (k ? String(k) : ''));
const WBE_IND = { factory: '공장', building: '빌딩', hospital: '병원', retail: '유통', univ: '대학교', training: '연수원', power: '발전소', apt: '아파트', etc: '기타' };
const WBE_JOB = { sec: '보안', clean: '미화', park: '주차', fac: '시설', etc: '기타' };

function jparse(s) { try { return typeof s === 'string' ? JSON.parse(s) : s; } catch (e) { return null; } }
function lsJ(k) { try { return jparse(localStorage.getItem(k)); } catch (e) { return null; } }
function hashId(s) { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
const num = v => (v == null || v === '' || isNaN(+v)) ? null : +v;

/* ---------- 표준 연동 형식으로 정리 ---------- */
function normPkg(x, origin) {
  if (!x || typeof x !== 'object') return null;
  const src = SRC[x.src] ? x.src : 'manual';
  const rows = (Array.isArray(x.rows) ? x.rows : []).map(r => ({
    job: String(r.job || ''), title: String(r.title || ''), count: num(r.count) || 0, shift: String(r.shift || ''),
    unit: num(r.unit), amount: num(r.amount), days: num(r.days), date: r.date || '', note: r.note || ''
  }));
  const p = {
    id: String(x.id || ('p' + hashId(JSON.stringify(x).slice(0, 400)))), v: 1, src, origin: origin || x.origin || 'bridge',
    at: x.at || new Date().toISOString(), title: String(x.title || x.client || '견적'), client: String(x.client || ''), site: String(x.site || ''), addr: String(x.addr || ''),
    svc: String(x.svc || ''), industry: String(x.industry || ''), mode: x.mode || '', year: x.year || '', branch: x.branch || '', grpCo: x.grpCo || '',
    period: Object.assign({ from: '', to: '', months: null }, x.period || {}),
    heads: num(x.heads) ?? rows.reduce((a, r) => a + (r.count || 0), 0),
    monthly: num(x.monthly), vat: num(x.vat), yearly: num(x.yearly), supply: num(x.supply), total: num(x.total),
    unit: x.unit || SRC[src].unit, rows, mix: x.mix || null, tasks: Array.isArray(x.tasks) ? x.tasks : [], addons: Array.isArray(x.addons) ? x.addons : [],
    plan: x.plan || '', staff: x.staff || '', hours: num(x.hours), fte: num(x.fte), notes: Array.isArray(x.notes) ? x.notes : (x.notes ? [String(x.notes)] : []),
    needAmt: !!x.needAmt, by: x.by || ''
  };
  if (p.monthly == null && p.unit === '월') p.needAmt = true;
  if (p.unit === '건' && p.total == null && p.supply == null) p.needAmt = true;
  return p;
}

/* ---------- B. 견적 보관함 직접 읽기 (금액은 견적 프로그램에서 「제안서로 보내기」로 확정) ---------- */
function rawFromQuote(st, name, at) {
  if (!st || !st.meta || !Array.isArray(st.roles)) return null;
  const m = st.meta;
  return normPkg({ id: 'raw-stqs-' + hashId((name || m.client) + '|' + m.year), src: 'stqs', at: at || '', title: name || `${m.client || '이름없음'} · ${m.year || ''}`,
    client: m.client, addr: m.addr, svc: m.svc, year: m.year, mode: m.mode, branch: m.branch, grpCo: m.grpCo,
    period: { from: m.from, to: m.to, months: null },
    rows: st.roles.map(r => ({ job: QCAT[r.cat] || r.cat || '', title: (r.rank || r.title || '') + (r.detail ? ` (${r.detail})` : ''), count: +r.count || 0, shift: QSHIFT(r.shift), unit: null, amount: null })),
    addons: [].concat((st.vehicles || []).map(v => ({ k: '차량', n: v.name || v.type || '업무차량', q: v.qty || 1 })), (st.equips || []).map(e => ({ k: '장비', n: e.name || '장비', q: e.qty || 1 })), (st.others || []).map(o => ({ k: '기타', n: o.name || '부대비용', q: o.qty || 1 }))),
    needAmt: true, notes: ['견적 보관함에서 읽은 자료입니다. 금액은 용역인력 견적에서 「📑 제안서로 보내기」를 누르면 함께 연동됩니다.'] }, 'raw');
}
function rawFromShort(it) {
  const P = it && (it.p || it); if (!P || !Array.isArray(P.lines)) return null;
  const tot = num(it.total);
  return normPkg({ id: 'raw-stse-' + hashId((P.name || '') + '|' + (P.date || '')), src: 'stse', at: it.at || '', title: P.name || '단기인력 견적', client: P.client, site: P.site,
    period: { from: P.date || '', to: '', months: null }, unit: '건',
    rows: P.lines.map(L => ({ job: L.ind || '', title: L.role || '', count: +L.heads || 0, shift: [L.start, L.end].filter(Boolean).join('~'), days: +L.days || null, date: L.date || '', unit: null, amount: null })),
    total: tot, supply: tot != null ? Math.round(tot / 1.1) : null, vat: tot != null ? tot - Math.round(tot / 1.1) : null,
    needAmt: tot == null, notes: ['단기인력 견적 보관함에서 읽은 자료입니다(합계는 보관 당시 금액).'] }, 'raw');
}
function rawFromWbe(S, at) {
  if (!S || !S.est) return [];
  return Object.entries(S.est).map(([k, E]) => {
    const [ind, job] = k.split('|'); if (!E || !Array.isArray(E.tree)) return null;
    const q = E.quote || {}, p = E.params || {};
    const heads = num(q.n) || (p.plan === 'contract' ? num(p.cFull) : null) || num(p.cFull) || 0;
    return normPkg({ id: 'raw-wbe-' + hashId(k + '|' + (S.site || '')), src: 'wbe', at: at || '', title: `${S.site || '업무량 기반 산정'} · ${WBE_IND[ind] || ind} ${WBE_JOB[job] || job}`,
      client: S.site || '', industry: WBE_IND[ind] || ind,
      rows: [{ job: WBE_JOB[job] || job, title: `${WBE_JOB[job] || job} 인력`, count: heads, shift: '', unit: null, amount: q.amount ? +q.amount : null }],
      monthly: q.amount ? +q.amount : null, tasks: E.tree.map(n => ({ name: n.name, share: null, cost: null, hours: null })),
      needAmt: !q.amount, notes: ['업무량 기반 산정 자료에서 업무 분류(대분류)를 읽었습니다. 업무별 시간·비용은 산정 프로그램에서 「📑 제안서로 보내기」를 누르면 연동됩니다.'] }, 'raw');
  }).filter(Boolean);
}
function rawAll(get) {
  const out = [];
  const qs = get('stec_quotes'); if (Array.isArray(qs)) qs.forEach(q => { const p = rawFromQuote(q.state, q.name, q.at); if (p) out.push(p); });
  const qd = get('stec_quote_draft'); if (qd && qd.meta && qd.meta.client) { const p = rawFromQuote(qd, `작성 중 · ${qd.meta.client}`, ''); if (p) { p.id = 'raw-stqs-draft'; out.push(p); } }
  const ss = get('stse_saved'); if (Array.isArray(ss)) ss.forEach(it => { const p = rawFromShort(it); if (p) out.push(p); });
  const sp = get('stse_project'); if (sp && sp.lines && sp.lines.length) { const p = rawFromShort({ p: sp }); if (p) { p.id = 'raw-stse-cur'; p.title = '작성 중 · ' + p.title; out.push(p); } }
  let w = get('wbe-estimator-v16'); if (w && w.raw) w = jparse(w.raw); out.push(...rawFromWbe(w));
  return out;
}

/* ---------- 불러오기: 이 기기 + 서버 ---------- */
function readInboxLocal() { const a = lsJ(LINK_KEY); return Array.isArray(a) ? a : []; }
function mergeItems(list) {
  const map = new Map();
  list.filter(Boolean).forEach(p => { const o = map.get(p.id); if (!o || String(p.at) > String(o.at) || (o.origin === 'raw' && p.origin !== 'raw')) map.set(p.id, p); });
  // 같은 견적이 「보내기」 자료로 있으면 보관함 원자료(raw)는 숨김
  const sent = [...map.values()].filter(p => p.origin !== 'raw').map(p => p.src + '|' + (p.client || p.title));
  return [...map.values()].filter(p => p.origin !== 'raw' || !sent.includes(p.src + '|' + (p.client || p.title)))
    .sort((a, b) => (a.origin === 'raw') - (b.origin === 'raw') || String(b.at).localeCompare(String(a.at)));
}
async function loadLinks(withServer) {
  const local = readInboxLocal().map(x => normPkg(x, 'bridge'));
  const files = (lsJ('stec_pp_files') || []).map(x => normPkg(x, x.origin || 'file'));
  let raw = rawAll(lsJ), server = [];
  if (withServer) {
    const A = window.STOS_AUTH || window.APP_AUTH;
    if (A && A.client && A.profile) {
      try {
        const { data, error } = await A.client.rpc('sync_pull');
        if (error) throw error;
        const cloud = {}; (data || []).forEach(r => cloud[r.k] = r.v);
        if (Array.isArray(cloud[LINK_KEY])) server = cloud[LINK_KEY].map(x => normPkg(x, 'bridge'));
        raw = raw.concat(rawAll(k => jparse(cloud[k])));
        LINK.serverAt = new Date(); LINK.serverMsg = `서버 동기화 ${pad(LINK.serverAt.getHours())}:${pad(LINK.serverAt.getMinutes())}`;
      } catch (e) { LINK.serverMsg = '서버 읽기 실패 — 이 기기 자료만 표시'; }
    } else LINK.serverMsg = '로그인하면 다른 기기에서 보낸 견적도 함께 보입니다';
  }
  const hidden = new Set(lsJ('stec_pp_hidden') || []);
  LINK.items = mergeItems(local.concat(server, files, raw)).filter(p => !hidden.has(p.id));
  [...LINK.picked].forEach(id => { if (!LINK.items.find(p => p.id === id)) LINK.picked.delete(id); });
  return LINK.items;
}
function pickedPkgs() { return LINK.items.filter(p => LINK.picked.has(p.id)); }

/* ---------- 합산 ---------- */
function moneyOf(pkgs) {
  const m = { monthly: 0, vat: 0, yearly: 0, once: 0, onceVat: 0, heads: 0, months: 12, need: false, rows: [] };
  pkgs.forEach(p => {
    m.heads += p.heads || 0;
    if (p.unit === '건') { const sup = p.supply ?? (p.total != null ? Math.round(p.total / 1.1) : null); if (sup == null) m.need = true; else { m.once += sup; m.onceVat += p.vat ?? Math.round(sup * 0.1); } }
    else {
      if (p.monthly == null) m.need = true; else { m.monthly += p.monthly; m.vat += p.vat ?? Math.round(p.monthly * 0.1); }
      const months = p.period && p.period.months ? +p.period.months : monthsBetween(p.period && p.period.from, p.period && p.period.to);
      if (p.yearly != null) m.yearly += p.yearly; else if (p.monthly != null) m.yearly += p.monthly * months;
      m.months = months;
    }
    p.rows.forEach(r => m.rows.push(Object.assign({ src: p.src, pkg: p.title }, r)));
  });
  return m;
}
function monthsBetween(a, b) {
  if (!a || !b) return 12; const A = new Date(a), B = new Date(b); if (isNaN(A) || isNaN(B)) return 12;
  return Math.max(1, (B.getFullYear() - A.getFullYear()) * 12 + (B.getMonth() - A.getMonth()) + (B.getDate() >= A.getDate() - 1 ? 1 : 0));
}
const wonL = v => v == null ? '-' : Math.round(v).toLocaleString('ko-KR');
function korWon(n) {
  n = Math.floor(n || 0); if (!n) return '영';
  const d = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'], u = ['', '십', '백', '천'], b = ['', '만', '억', '조']; let s = '', bi = 0;
  while (n > 0) { const part = n % 10000; n = Math.floor(n / 10000); if (part) { let p = '', x = part, ui = 0; while (x > 0) { const dg = x % 10; if (dg) p = d[dg] + u[ui] + p; x = Math.floor(x / 10); ui++; } s = p + b[bi] + s; } bi++; }
  return s;
}

/* ---------- C. 파일 · 직접 입력 ---------- */
function saveFiles(list) { try { localStorage.setItem('stec_pp_files', JSON.stringify(list.slice(0, 40))); } catch (e) { } }
async function importLinkFile(file) {
  const t = await file.text(); const j = jparse(t);
  if (!j) throw new Error('연동 파일(JSON)을 읽을 수 없습니다.');
  let arr = Array.isArray(j) ? j : j.packages || j.items || [j];
  // 견적 프로그램 JSON 백업(원자료)도 받음
  arr = arr.flatMap(x => x && x.src ? [normPkg(x, 'file')] : x && x.meta && x.roles ? [rawFromQuote(x, file.name, '')] : x && x.lines ? [rawFromShort({ p: x })] : x && x.est ? rawFromWbe(x) : []).filter(Boolean);
  if (!arr.length) throw new Error('견적 연동 자료를 찾지 못했습니다.');
  arr.forEach(p => { p.origin = 'file'; p.id = 'f-' + hashId(p.id + file.name); });
  const cur = (lsJ('stec_pp_files') || []).filter(x => !arr.find(a => a.id === x.id));
  saveFiles(arr.concat(cur)); return arr;
}
function exportLinkFile(pkgs) {
  const blob = new Blob([JSON.stringify({ format: 'stec.proposal.link', v: 1, at: new Date().toISOString(), packages: pkgs }, null, 1)], { type: 'application/json' });
  return blob;
}
function saveManual(p) {
  p = normPkg(Object.assign({ src: 'manual', origin: 'manual', at: new Date().toISOString() }, p), 'manual');
  const cur = (lsJ('stec_pp_files') || []).filter(x => x.id !== p.id); cur.unshift(Object.assign(p, { origin: 'manual' })); saveFiles(cur); return p;
}
function removeLocalPkg(id) {
  try { const h = lsJ('stec_pp_hidden') || []; if (!h.includes(id)) h.push(id); localStorage.setItem('stec_pp_hidden', JSON.stringify(h.slice(-300))); } catch (e) { }
  saveFiles((lsJ('stec_pp_files') || []).filter(x => x.id !== id));
  try { const a = readInboxLocal().filter(x => x.id !== id); localStorage.setItem(LINK_KEY, JSON.stringify(a)); } catch (e) { }
}

/* =====================================================================
 * 엑셀·PDF 견적서 불러오기 — 사용자가 엑셀로 만든 견적서(.xlsx·.xls·.xlsm·.csv)나
 * 그 PDF 출력본에서 고객사·용역기간·월 견적금액·투입 인력·단가·원가 구성을 읽어
 * 제안서 연동 견적(normPkg 형식)으로 만듭니다. 모든 처리는 이 기기 안에서만 합니다.
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const XL_EXT = /\.(xlsx|xlsm|xls|xlsb|ods|csv)$/i;
async function xlsxLib() { if (!window.XLSX) await loadScriptOnce(libUrl('lib/xlsx/xlsx.full.min.js')); return window.XLSX; }

/* ---------- 공통 도우미 ---------- */
const xS = v => String(v ?? '').replace(/ /g, ' ').trim();
const xK = v => xS(v).replace(/\s+/g, '');
function xN(v) {
  if (typeof v === 'number' && isFinite(v)) return v;
  const s = xS(v).replace(/[₩원명,\s]/g, '').replace(/^\((.*)\)$/, '-$1');
  if (/^[+\-]?\d+(\.\d+)?$/.test(s)) return +s;
  const m = /^([+\-]?\d{1,3}(?:,\d{3})+)\s+\S/.exec(xS(v)); return m ? +m[1].replace(/,/g, '') : null;   // PDF에서 이웃 칸과 붙은 경우
}
/* 시트 = { name, rows: [[{v, x, w}]] } — 엑셀은 x=열 번호, PDF는 x=좌표 */
function gridFromAoa(name, aoa) { return { name, rows: aoa.map(r => (r || []).map((v, i) => ({ v, x: i, w: 1 })).filter(c => xS(c.v) !== '')) }; }
const rowText = r => r.map(c => xS(c.v)).join(' ');
const cx = c => c.x + (c.w || 1) / 2;
function nearest(cols, c) { let best = null, d = 1e9; cols.forEach(h => { const dd = Math.abs(cx(h) - cx(c)); if (dd < d) { d = dd; best = h; } }); return best; }

/* ---------- 파일 → 시트 ---------- */
async function sheetsFromFile(file) {
  if (XL_EXT.test(file.name)) {
    const X = await xlsxLib(), wb = X.read(new Uint8Array(await file.arrayBuffer()), { type: 'array', cellDates: false });
    return wb.SheetNames.map(n => gridFromAoa(n, X.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: '', blankrows: true })));
  }
  if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') {
    const pdfjs = await pdfLib(), doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), cMapUrl: libUrl('lib/pdf/cmaps/'), cMapPacked: true }).promise;
    const out = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const pg = await doc.getPage(i), tc = await pg.getTextContent();
      const it = tc.items.filter(t => t.str && t.str.trim()).map(t => ({ s: t.str, x: t.transform[4], y: t.transform[5], w: t.width || t.str.length * 5, f: Math.abs(t.transform[3]) || 9 }));
      it.sort((a, b) => b.y - a.y || a.x - b.x);
      const lines = []; it.forEach(t => { const L = lines.find(l => Math.abs(l.y - t.y) < Math.max(2.5, t.f * 0.35)); L ? L.items.push(t) : lines.push({ y: t.y, items: [t] }); });
      const rows = lines.sort((a, b) => b.y - a.y).map(l => { const s = l.items.sort((a, b) => a.x - b.x), cells = [];
        s.forEach(t => { const c = cells[cells.length - 1]; if (c && t.x - (c.x + c.w) < t.f * 1.6) { c.v += (t.x - (c.x + c.w) > t.f * 0.2 ? ' ' : '') + t.s; c.w = t.x + t.w - c.x; } else cells.push({ v: t.s, x: t.x, w: t.w }); });
        return cells; });
      out.push({ name: 'p' + i, rows });
    }
    return out;
  }
  throw new Error('엑셀(.xlsx·.xls·.csv) 또는 PDF 견적서만 읽을 수 있습니다.');
}

/* ---------- 항목(라벨 → 값) ---------- */
function labelVal(sheets, re) {
  for (const sh of sheets) for (const r of sh.rows) for (let i = 0; i < r.length; i++) {
    const k = xK(r[i].v);
    if (re.test(k)) { const rest = r.slice(i + 1).map(c => xS(c.v)).filter(Boolean); if (rest.length) return rest.join(' '); const m = xS(r[i].v).replace(/^[^\s:：]+[\s:：]+/, ''); if (m && m !== xS(r[i].v)) return m; }
  }
  return '';
}
function allText(sheets) { return sheets.map(sh => sh.rows.map(rowText).join('\n')).join('\n'); }
function parsePeriod(t) {
  const m = /(\d{4})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})\s*일?\s*[~∼\-–]\s*(\d{4})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})/.exec(t || '');
  if (!m) return null; const p2 = n => String(n).padStart(2, '0');
  const mm = /\((\d+)\s*개월\)/.exec(t);
  return { from: `${m[1]}-${p2(m[2])}-${p2(m[3])}`, to: `${m[4]}-${p2(m[5])}-${p2(m[6])}`, months: mm ? +mm[1] : null };
}
function cleanClient(s) { return xS(s).replace(/(貴中|귀중|御中|귀하)\s*$/, '').replace(/\s*원가\s*분석\S*\s*(\d{4})?.*$/, '').replace(/\s*(견적서|見積書)\s*$/, '').trim(); }

/* ---------- 견적 내역표 (직종·인원·단가) ---------- */
function findQuoteTable(sheets) {
  for (const sh of sheets) for (let ri = 0; ri < sh.rows.length; ri++) {
    const hdr = sh.rows[ri], ks = hdr.map(c => xK(c.v));
    if (!(ks.some(k => /^직종|직종$|^직무$/.test(k)) && ks.some(k => /^인원/.test(k)))) continue;
    const col = re => hdr.filter((c, i) => re.test(ks[i]));
    const H = { job: col(/^직종|^직무$/)[0], title: col(/^직책|^직급|^구분$/)[0], place: col(/근무지|업무내용|담당업무/)[0], shift: col(/운영형태|근무형태|근무제|교대/)[0], count: col(/^인원/)[0],
      unit: col(/단가|1인|인당/), amount: col(/월합계|^금액|월금액|합계금액|^합계$/), note: col(/^비고/)[0] };
    const heads = hdr; const out = [], meta = {};
    for (let j = ri + 1; j < Math.min(sh.rows.length, ri + 60); j++) {
      const r = sh.rows[j], t = xK(rowText(r)); if (!r.length) { if (out.length) break; continue; }
      const at = h => { if (!h) return null; const hit = r.filter(c => nearest(heads, c) === h); return hit.length ? hit.map(c => c.v) : null; };
      const one = h => { const a = at(h); return a ? a.map(xS).join(' ') : ''; };
      const numAt = h => { const a = at(h); if (!a) return null; for (const v of a) { const n = xN(v); if (n != null) return n; } return null; };
      if (/^(월)?합계|^소계|^계$|^총계/.test(t) || /월합계/.test(t)) { meta.sum = numAt(H.amount[H.amount.length - 1]) ?? Math.max(...r.map(c => xN(c.v) || 0)); meta.sumPrev = H.unit.length > 1 ? numAt(H.unit[0]) : null; continue; }
      if (/부가가치세|부가세/.test(t)) { meta.vat = Math.max(...r.map(c => xN(c.v) || 0)) || null; continue; }
      if (/VAT포함|총계/.test(t)) { meta.withVat = Math.max(...r.map(c => xN(c.v) || 0)) || null; continue; }
      if (/계약기간총액|연간|총액/.test(t)) { meta.yearly = Math.max(...r.map(c => xN(c.v) || 0)) || null; continue; }
      const cnt = numAt(H.count), job = one(H.job), title = one(H.title);
      if (cnt == null || cnt <= 0 || cnt > 500 || !(job || title) || /^\d+$/.test(job + title)) { if (out.length && !/^[■□○※]/.test(t)) continue; if (out.length) break; continue; }
      const uLast = H.unit.length ? numAt(H.unit[H.unit.length - 1]) : null, uPrev = H.unit.length > 1 ? numAt(H.unit[0]) : null;
      const amt = H.amount.length ? numAt(H.amount[H.amount.length - 1]) : null;
      out.push({ job, title: [title, one(H.place)].filter(Boolean).join(' · ').replace(/^(.+) · \1/, '$1'), count: cnt, shift: one(H.shift), unit: uLast ?? (amt != null ? Math.round(amt / cnt) : null), amount: amt ?? (uLast != null ? uLast * cnt : null), prev: uPrev, note: one(H.note) });
    }
    if (out.length) { const yrs = H.unit.map(h => (/(20\d\d)/.exec(xS(h.v)) || [])[1]).filter(Boolean); return { rows: out, meta, years: yrs, sheet: sh.name }; }
  }
  return null;
}

/* ---------- 원가분석표 (직책별 열 · 12. 계) ---------- */
function findCostSheets(sheets) {
  const res = [];
  for (const sh of sheets) {
    const R = sh.rows, find = re => R.findIndex(r => r.length && re.test(xK(r[0].v) + '|' + xK(rowText(r.slice(0, 2)))));
    const iN = R.findIndex(r => r.length && /^인원/.test(xK(r[0].v)) && r.some(c => /\d+\s*명/.test(xS(c.v))));
    const iT = R.findIndex(r => r.length && /^12\.?.*계|^(합계|총계)\(?VAT/.test(xK(rowText(r.slice(0, 2)))));
    if (iN < 0 || iT < 0) continue;
    const nCells = R[iN].filter(c => /\d+\s*명/.test(xS(c.v)));
    const iH = R.slice(0, iN).map((r, i) => [r, i]).filter(([r]) => r.some(c => /^구분/.test(xK(c.v)))).map(x => x[1]).pop() ?? Math.max(0, iN - 2);
    const valAt = (ri, ref) => { if (ri < 0) return null; const r = R[ri]; let best = null, d = 1e9; r.forEach(c => { const n = xN(c.v); if (n == null) return; const dd = Math.abs(cx(c) - cx(ref)); if (dd < d) { d = dd; best = n; } }); return d <= (sh.name.startsWith('p') ? 40 : 0.6) ? best : null; };
    const cols = nCells.map(c => ({ c, count: +(/(\d+)\s*명/.exec(xS(c.v))[1]), title: R.slice(iH, iN).map(r => r.filter(h => Math.abs(cx(h) - cx(c)) <= (sh.name.startsWith('p') ? 30 : 0.6) && !/^구분|^항목/.test(xK(h.v))).map(h => xS(h.v)).join(' ')).filter(Boolean).join(' ').trim() }));
    const units = cols.map(o => valAt(iT, o.c));
    if (units.some(u => u == null)) continue;
    const pdfMode = sh.name.startsWith('p'), xs = nCells.map(cx).sort((a, b) => a - b), posMax = xs[xs.length - 1], gap = xs.length > 1 ? (posMax - xs[0]) / (xs.length - 1) : (pdfMode ? 70 : 1);
    const rightOf = ri => { if (ri < 0) return null; const c = R[ri].filter(c => xN(c.v) != null && cx(c) > posMax + (pdfMode ? gap * 0.55 : 0.4)).sort((a, b) => a.x - b.x)[0]; return c ? xN(c.v) : null; };
    let total = rightOf(iT);
    if (total == null) total = Math.max(...R[iT].map(c => xN(c.v)).filter(n => n != null));
    const perHead = Math.abs(cols.reduce((a, o, i) => a + o.count * units[i], 0) - total) < Math.max(1000, total * 0.002);
    const tval = re => { const i = find(re); if (i < 0) return null; const v = rightOf(i); if (v != null) return v; const nums = R[i].map(c => xN(c.v)).filter(n => n != null); return nums[nums.length - 1]; };
    const mix = { labor: (tval(/^4\.?.*인건비|인건비계/) || 0) + (tval(/^5\.?.*복리후생|복리후생비계/) || 0), expense: tval(/^7\.?.*제비용|제비용계|^경비계/) || 0, addon: 0, marg: (tval(/^9\.?.*일반관리비|일반관리비/) || 0) + (tval(/^11\.?.*이익|이윤|기업이윤/) || 0) };
    const title = R.slice(0, iH).map(rowText).find(t => /원가|분석|산출/.test(t)) || sh.name;
    res.push({ sheet: sh.name, title: xS(title), total, rows: cols.map((o, i) => ({ job: '', title: o.title, count: o.count, shift: (/\d조\d교대|주간|야간|격일|상주/.exec(o.title) || [''])[0], unit: perHead ? units[i] : Math.round(units[i] / o.count), amount: perHead ? units[i] * o.count : units[i] })), mix: (mix.labor + mix.expense + mix.marg) > 0 ? mix : null });
  }
  return res;
}

/* ---------- 엑셀 견적서 → 연동 견적 ---------- */
function estimateFromSheets(sheets, fileName) {
  const txt = allText(sheets);
  const csTitle = (/^(.+?)\s*원가\s*분석/m.exec(txt) || [])[1] || '';
  const client = cleanClient(labelVal(sheets, /^수신|^고객사$|^발주처$|^업체명$/)) || cleanClient((/^(.+?)\s*(貴中|귀중)/m.exec(txt) || [])[1] || '') || cleanClient(csTitle) || xS(fileName).replace(/\.[^.]+$/, '').replace(/^[\d_\-\s]+/, '').replace(/_/g, ' ');
  const svc = labelVal(sheets, /^용역명$|^사업명$|^용역내용$|^건명$/);
  const per = parsePeriod(labelVal(sheets, /^용역기간$|^계약기간$/)) || parsePeriod(txt);
  const addr = labelVal(sheets, /^사업장$|^현장주소$|^근무장소$|^주소$/).replace(/\s*(허가|등록).*$/, '');
  const amtLine = labelVal(sheets, /^견적금액/);
  const moM = /월\s*([\d,]{5,})\s*원/.exec(amtLine) || /견적금액[^\n]*?월\s*([\d,]{5,})\s*원/.exec(txt) || /₩\s*([\d,]{5,})/.exec(txt);
  const q = findQuoteTable(sheets), cs = findCostSheets(sheets);
  let monthly = moM ? +moM[1].replace(/,/g, '') : null;
  if (q && q.meta.sum) monthly = monthly || q.meta.sum;
  /* 원가분석표: 견적 금액과 같은 표를 본안으로, 나머지는 대안으로 */
  let main = null;
  if (cs.length) main = cs.find(c => monthly && Math.abs(c.total - monthly) < 1000) || cs.filter(c => !/증원|대안|변경|감원|추가/.test(c.title + c.sheet)).sort((a, b) => ((/(20\d\d)/.exec(b.title + b.sheet) || [0, 0])[1]) - ((/(20\d\d)/.exec(a.title + a.sheet) || [0, 0])[1]))[0] || cs[0];
  let rows = q ? q.rows : main ? main.rows : [];
  if (!rows.length) throw new Error('견적서에서 「직종·인원·단가」 표나 원가분석표(인원 · 12. 계)를 찾지 못했습니다.');
  if (!q && main) monthly = monthly || main.total;
  if (q && main) { /* 견적표 직책명이 비어 있으면 원가분석표 이름으로 보충 */ rows.forEach((r, i) => { if (!r.shift && main.rows[i]) r.shift = main.rows[i].shift; }); }
  monthly = monthly || rows.reduce((a, r) => a + (r.amount || 0), 0) || null;
  const heads = rows.reduce((a, r) => a + (r.count || 0), 0);
  const months = per && per.months ? per.months : 12;
  const year = (per && per.from ? per.from.slice(0, 4) : '') || ((/(20\d\d)\s*년\s*(용역|견적|도급)/.exec(txt) || [])[1]) || (q && q.years.length ? q.years[q.years.length - 1] : '');
  const notes = [];
  const prevLine = labelVal(sheets, /^전년대비/); if (prevLine) notes.push('전년 대비: ' + prevLine);
  else if (q && q.meta.sumPrev && monthly) notes.push(`전년 대비: 월 ${wonL(q.meta.sumPrev)}원 → 월 ${wonL(monthly)}원 (${monthly >= q.meta.sumPrev ? '▲' : '▼'} ${(Math.abs(monthly / q.meta.sumPrev - 1) * 100).toFixed(1)}%)`);
  const yOf = c => +((/(20\d\d)/.exec(c.title + ' ' + c.sheet) || [])[1] || 0), my = main ? yOf(main) : 0;
  cs.filter(c => c !== main).forEach(c => notes.push(`${my && yOf(c) && yOf(c) < my ? '전년 산출' : '대안 산출'} — ${c.title.replace(/\s+/g, ' ')}: 월 ${wonL(c.total)}원 · ${c.rows.reduce((a, r) => a + r.count, 0)}명`));
  txt.split('\n').map(l => l.trim()).filter(l => /^[○◦•]\s*/.test(l) && /:|：/.test(l)).slice(0, 8).forEach(l => notes.push('견적 조건 ' + l.replace(/^[○◦•]\s*/, '')));
  notes.push(`엑셀 견적서 「${fileName}」에서 읽음${q ? ` (견적표: ${q.sheet})` : ''}${main ? ` · 원가분석: ${main.sheet}` : ''}`);
  const vat = (q && q.meta.vat) || (monthly ? Math.round(monthly * 0.1) : null);
  return normPkg({ id: 'x-' + hashId(fileName + '|' + client + '|' + monthly + '|' + heads), src: 'stqs', origin: 'excel', at: new Date().toISOString(),
    title: `${client || '고객사'}${svc ? ' · ' + svc : ''}${year ? ` (${year})` : ''}`, client, addr, svc, year,
    period: per || { from: '', to: '', months: null }, heads, monthly, vat, yearly: (q && q.meta.yearly) || (monthly ? monthly * months : null),
    rows: rows.map(r => ({ job: r.job || (/(보안|경비|미화|청소|시설|주차|안내|조리|방역|소독|경호)/.exec(r.title) || [''])[0], title: r.title, count: r.count, shift: r.shift, unit: r.unit, amount: r.amount, note: [r.note, r.prev ? `전년 ${wonL(r.prev)}원` : ''].filter(Boolean).join(' · ') })),
    mix: main ? main.mix : null, notes, by: 'excel' }, 'excel');
}
async function importEstimateFile(file) {
  const sheets = await sheetsFromFile(file);
  const p = estimateFromSheets(sheets, file.name); p.origin = 'excel';
  const cur = (lsJ('stec_pp_files') || []).filter(x => x.id !== p.id); cur.unshift(p); saveFiles(cur);
  return p;
}
