/* =====================================================================
 * 제안요청서(RFP)·과업지시서·공고문 불러오기 + 요구사항 분석
 *  에스텍 제안서 제작시스템 rfp.js와 같은 엔진 (PDF·Word·한글 HWPX·메일·사진 글자 인식 — 이 기기 안에서만 처리)
 *  분석한 요구사항은 업무표준서·업무매뉴얼 「과업 요구사항 대응표」로 출력되고, 관련 표준 항목을 추천·선택합니다.
 *  Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const INTAKE = { att: [], busy: false };
const RFP_CATS = [
  { k: '인력·자격', kw: ['인원', '명 이상', '배치', '자격', '경력', '면허', '자격증', '연령', '선임', '상주'], std: ['A1-01', 'A1-03', 'E1-01'], man: ['MB-01', 'MB-02'] },
  { k: '근무형태', kw: ['근무형태', '교대', '격일', '주간', '야간', '근무시간', '휴게', '24시간'], std: ['B1-01', 'B1-02', 'B1-03', 'B2-04'], man: ['MB-02', 'MC-01'] },
  { k: '업무 범위', kw: ['과업', '업무 범위', '업무범위', '수행', '순찰', '청소', '점검', '출입', '관리 업무'], std: ['A1-02', 'A2-01', 'A2-02'], man: ['MB-04', 'MD-01', 'MD-02'] },
  { k: '교육', kw: ['교육', '훈련', '이수'], std: ['E1-03', 'D1-01'], man: ['MG-01'] },
  { k: '안전·보건', kw: ['안전', '재해', '보건', '중대재해', '사고', '보호구', '위험성'], std: ['D1-01', 'D1-02', 'D1-03'], man: ['MG-01', 'MG-02'] },
  { k: '법규·노무', kw: ['법령', '준수', '최저임금', '근로기준', '4대보험', '퇴직', '노임단가', '파견'], std: ['E1-02', 'B1-02', 'F2-02'], man: ['MI-01'] },
  { k: '품질·평가', kw: ['평가', '품질', '만족도', '패널티', '지체상금', '감점', '점검표', '보고서', '보고'], std: ['F1-01', 'F1-02', 'F1-03'], man: ['MD-03', 'MH-02'] },
  { k: '장비·물품', kw: ['장비', '물품', '피복', '소모품', '차량', '비품'], std: ['D1-02'], man: ['MB-03'] },
  { k: '고용승계', kw: ['고용승계', '승계', '기존 근로자', '고용 유지'], std: ['E1-01', 'E1-02'], man: [] },
  { k: '인수인계·개시', kw: ['인수인계', '착수', '개시', '전환', '준비기간'], std: ['A2-03'], man: ['MC-01', 'MJ-01'] },
  { k: '보험·보증', kw: ['보험', '배상', '보증', '이행보증'], std: [], man: [] },
  { k: '가격·대가', kw: ['가격', '단가', '금액', '예산', '대가', '산출내역', '견적', '원가'], std: ['G1-01', 'G2-01'], man: [] },
  { k: '제출서류', kw: ['제출', '서류', '증빙', '사업자등록', '허가증', '확약서', '실적증명'], std: ['A2-04'], man: ['MK-01'] },
  { k: '비상·보고', kw: ['비상', '화재', '응급', '재난', '대피', '신고', '연락체계'], std: ['D2-01', 'D2-02', 'D2-03'], man: ['MF-01', 'MH-01', 'MX-01'] }
];
const RFP_IND = { factory: ['공장', '제조', '플랜트', '생산', '화학', '제철', '제지', '석유', '조선', '산단'], building: ['빌딩', '오피스', '사옥', '업무시설'], hospital: ['병원', '의료', '요양', '의원'], retail: ['백화점', '마트', '쇼핑', '유통', '판매'], logistics: ['물류', '창고', '택배', '하역'], univ: ['대학', '학교', '캠퍼스', '교육청'], training: ['연수원', '리조트', '호텔', '콘도'], power: ['발전소', '국가중요시설', '변전소', '항만', '공항'], apt: ['아파트', '공동주택', '관리사무소', '입주자'], public: ['공공기관', '관공서', '청사', '시청', '구청', '공단', '공사'], construction: ['건설', '공사현장', '현장사무소'] };
const RFP_JOB = { sec: ['보안', '경비', '경비원', '초소', '출입통제', '순찰', '특수경비'], cln: ['미화', '청소', '환경', '위생', '미화원', '분리수거'], prk: ['주차', '주차장', '주차관리', '정산'], fac: ['시설', '설비', '전기', '기계', '영선', '기전'], info: ['안내', '리셉션', '데스크', '프론트', '안내원'], cook: ['조리', '급식', '식당', '주방', '조리원'], san: ['방역', '소독', '해충'] };
let _ocrW = null, _ocrLog = null;
async function ocrWorker() {
  if (_ocrW) return _ocrW;
  await loadScriptOnce(libUrl('lib/ocr/tesseract.min.js'));
  _ocrW = await Tesseract.createWorker(['kor', 'eng'], 1, { workerPath: libUrl('lib/ocr/worker.min.js'), corePath: libUrl('lib/ocr/core'), langPath: libUrl('lib/ocr/lang'), logger: m => _ocrLog && _ocrLog(m) });
  return _ocrW;
}
async function ocrCanvas(cv, label) {
  const w = await ocrWorker();
  _ocrLog = m => { if (m.status === 'recognizing text') inProg(`${label} 글자 읽는 중 ${Math.round(m.progress * 100)}%`); };
  const r = await w.recognize(cv); _ocrLog = null;
  return cleanOcr(r.data.text || '');
}
function cleanOcr(t) {
  return t.split('\n').map(l => l.replace(/\s+/g, ' ').replace(/([가-힣])\s(?=[가-힣]\s[가-힣])/g, '$1').trim())
    .filter(l => l.length > 1 && !/^(오전|오후)?\s*\d{1,2}:\d{2}$/.test(l) && !/^[\d\s.:,|/\\\-_=~'"`]+$/.test(l)).join('\n');
}
function imgToCanvas(src, maxW) { return new Promise((ok, no) => { const im = new Image(); im.onload = () => { const r = Math.min(1, maxW / im.naturalWidth), c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * r); c.height = Math.round(im.naturalHeight * r); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); ok(c); }; im.onerror = () => no(new Error('이미지를 열 수 없습니다')); im.src = src; }); }
function decodeBytes(buf, cs) {
  cs = String(cs || 'utf-8').toLowerCase().replace(/^ks_c_5601-1987$|^cp949$|^x-windows-949$|^ksc5601$/, 'euc-kr');
  try { const t = new TextDecoder(cs).decode(buf); if (cs === 'utf-8' && (t.match(/�/g) || []).length > 3) return new TextDecoder('euc-kr').decode(buf); return t; } catch (e) { return new TextDecoder('utf-8').decode(buf); }
}
const xmlTxt = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&');
function htmlToText(h) { const d = document.createElement('div'); d.innerHTML = h.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|tr|li|h\d)>/gi, '\n'); return (d.textContent || '').replace(/ /g, ' ').replace(/\n{3,}/g, '\n\n').trim(); }

/* ---------- 파일 종류별 읽기 ---------- */
async function extractFile(file) {
  const name = file.name || '붙여넣은 이미지.png', ext = (name.split('.').pop() || '').toLowerCase(), out = { name, kind: '기타', text: '', imgs: [], meta: {}, inc: true };
  if (/^image\//.test(file.type) || /^(png|jpe?g|gif|bmp|webp|heic)$/.test(ext)) {
    out.kind = '사진';
    const url = await readAs(file, 'DataURL'), big = await imgToCanvas(url, 2000), small = await imgToCanvas(url, 1400);
    out.imgs.push({ src: small.toDataURL('image/jpeg', 0.85), w: small.width, h: small.height });
    out.text = await ocrCanvas(big, name);
  } else if (ext === 'pdf') {
    out.kind = "문서";
    const pdfjs = await pdfLib(), doc = await pdfjs.getDocument({ data: new Uint8Array(await readAs(file, 'ArrayBuffer')), cMapUrl: libUrl('lib/pdf/cmaps/'), cMapPacked: true }).promise;
    const pages = Math.min(doc.numPages, 40); let txt = [];
    for (let i = 1; i <= pages; i++) {
      inProg(`${name} ${i}/${pages}쪽 읽는 중`);
      const pg = await doc.getPage(i), tc = await pg.getTextContent();
      let t = ''; tc.items.forEach(it => { t += it.str + (it.hasEOL ? '\n' : ''); }); txt.push(t.trim());
      if (i <= 3) { const vp = pg.getViewport({ scale: 1.6 }), c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height; await pg.render({ canvasContext: c.getContext('2d'), viewport: vp, background: '#fff' }).promise; out.imgs.push({ src: c.toDataURL('image/jpeg', 0.82), w: c.width, h: c.height, cv: c }); }
    }
    if (txt.join('').replace(/\s/g, '').length < 30 * pages) {   // 스캔본 → 그림에서 글자 읽기
      txt = []; for (const [k, im] of out.imgs.entries()) txt.push(await ocrCanvas(im.cv, `${name} ${k + 1}쪽`));
    }
    out.imgs.forEach(im => delete im.cv); out.text = txt.join('\n');
  } else if (ext === 'docx') {
    out.kind = "문서"; const z = await JSZip.loadAsync(await readAs(file, 'ArrayBuffer')), x = await z.file('word/document.xml').async('string');
    out.text = xmlTxt(x.replace(/<w:tab\/>/g, '\t').replace(/<w:br[^>]*\/>/g, '\n').replace(/<\/w:p>/g, '\n'));
  } else if (ext === 'hwpx') {
    out.kind = "문서"; const z = await JSZip.loadAsync(await readAs(file, 'ArrayBuffer'));
    const secs = Object.keys(z.files).filter(n => /^Contents\/section\d+\.xml$/i.test(n)).sort();
    for (const s of secs) out.text += xmlTxt((await z.file(s).async('string')).replace(/<\/hp:p>/g, '\n').replace(/<hp:lineBreak\/>/g, '\n')) + '\n';
  } else if (ext === 'hwp') {
    throw new Error('한글(.hwp) 파일은 바로 읽을 수 없습니다. 한글에서 「PDF로 저장」하거나 「HWPX」로 저장해 올리시거나, 화면을 사진으로 찍어 올려 주세요.');
  } else if (ext === 'eml') {
    out.kind = '이메일'; await parseEml(new Uint8Array(await readAs(file, 'ArrayBuffer')), out);
  } else if (ext === 'msg') {
    throw new Error('Outlook(.msg) 파일은 바로 읽을 수 없습니다. 메일을 「다른 이름으로 저장 → .eml」 하거나, 본문을 복사해 붙여넣기(Ctrl+V) 하세요.');
  } else if (ext === 'txt' || ext === 'csv' || /^text\//.test(file.type)) {
    const t = decodeBytes(new Uint8Array(await readAs(file, 'ArrayBuffer')));
    const k = parseKakao(t); if (k) { out.kind = '메신저'; out.text = k.text; out.meta = k.meta; } else { out.kind = '기타'; out.text = t; }
  } else throw new Error(`「${name}」은(는) 읽을 수 없는 형식입니다. PDF·Word·HWPX·메일(.eml)·카톡(.txt)·사진을 올려 주세요.`);
  out.text = String(out.text || '').replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return out;
}
/* 메일(.eml) — 머리글(보낸 사람·날짜·제목) + 본문 + 첨부 사진 */
function qpDecode(s) { const b = []; s = s.replace(/=\r?\n/g, ''); for (let i = 0; i < s.length; i++) { if (s[i] === '=' && /[0-9A-F]{2}/i.test(s.substr(i + 1, 2))) { b.push(parseInt(s.substr(i + 1, 2), 16)); i += 2; } else b.push(s.charCodeAt(i) & 255); } return new Uint8Array(b); }
function b64Bytes(s) { const t = atob(s.replace(/[^A-Za-z0-9+/=]/g, '')); const u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; }
function mimeWord(s) { return String(s || '').replace(/=\?([^?]+)\?([BQ])\?([^?]*)\?=\s*/gi, (_, cs, enc, txt) => decodeBytes(enc.toUpperCase() === 'B' ? b64Bytes(txt) : qpDecode(txt.replace(/_/g, ' ')), cs)); }
function splitMime(raw) {
  const i = raw.search(/\r?\n\r?\n/), head = i < 0 ? raw : raw.slice(0, i), body = i < 0 ? '' : raw.slice(i).replace(/^\r?\n\r?\n/, '');
  const h = {}; head.replace(/\r?\n[ \t]+/g, ' ').split(/\r?\n/).forEach(l => { const m = /^([\w-]+):\s*(.*)$/.exec(l); if (m) h[m[1].toLowerCase()] = m[2]; });
  return { h, body };
}
async function parseEml(bytes, out) {
  const raw = new TextDecoder('latin1').decode(bytes), top = splitMime(raw), texts = [];
  out.meta.from = mimeWord(top.h.from || ''); out.meta.subject = mimeWord(top.h.subject || ''); out.meta.date = top.h.date ? new Date(top.h.date) : null;
  async function walk(part) {
    const ct = (part.h['content-type'] || 'text/plain').toLowerCase(), cte = (part.h['content-transfer-encoding'] || '').toLowerCase(), cs = (/charset="?([^";]+)/i.exec(part.h['content-type'] || '') || [])[1];
    const bnd = /boundary="?([^";]+)"?/i.exec(part.h['content-type'] || '');
    if (/^multipart\//.test(ct) && bnd) { for (const seg of part.body.split('--' + bnd[1]).slice(1)) { if (/^--/.test(seg)) break; await walk(splitMime(seg.replace(/^\r?\n/, ''))); } return; }
    const data = cte === 'base64' ? b64Bytes(part.body) : cte === 'quoted-printable' ? qpDecode(part.body) : new Uint8Array([...part.body].map(c => c.charCodeAt(0) & 255));
    const fname = mimeWord((/name="?([^";\r\n]+)"?/i.exec((part.h['content-disposition'] || '') + ';' + (part.h['content-type'] || '')) || [])[1] || '');
    if (/^text\/plain/.test(ct) && !fname) texts.push({ t: decodeBytes(data, cs), p: 2 });
    else if (/^text\/html/.test(ct) && !fname) texts.push({ t: htmlToText(decodeBytes(data, cs)), p: 1 });
    else if (/^image\//.test(ct)) { const url = `data:${ct.split(';')[0]};base64,` + btoa(String.fromCharCode(...data.subarray(0, Math.min(data.length, 8e6)))); try { const c = await imgToCanvas(url, 1400); out.imgs.push({ src: c.toDataURL('image/jpeg', 0.85), w: c.width, h: c.height }); } catch (e) { } }
    else if (/pdf$/i.test(fname) || /application\/pdf/.test(ct)) { try { const sub = await extractFile(new File([data], fname || '첨부.pdf', { type: 'application/pdf' })); texts.push({ t: `[첨부 ${sub.name}]\n` + sub.text, p: 0 }); out.imgs.push(...sub.imgs); } catch (e) { } }
  }
  await walk(top);
  const best = texts.filter(x => x.p > 0).sort((a, b) => b.p - a.p)[0];
  out.text = [out.meta.subject ? '제목: ' + out.meta.subject : '', best ? best.t : '', ...texts.filter(x => x.p === 0).map(x => x.t)].filter(Boolean).join('\n')
    .split('\n').filter(l => !/^>/.test(l.trim())).join('\n').split(/\n-{2,}\s*Original Message|\n-+\s*원본 메시지|\n보낸 사람:\s/i)[0];
}
/* 카카오톡 「대화 내보내기」(.txt) — 휴대폰·PC 형식 */
function parseKakao(t) {
  const L = t.replace(/\r/g, '').split('\n'), msgs = []; let date = '';
  const reM = /^(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2}),\s*(.+?)\s*:\s(.*)$/, reP = /^\[(.+?)\] \[(오전|오후) (\d{1,2}):(\d{2})\] (.*)$/, reD = /^-+\s*(\d{4})년 (\d{1,2})월 (\d{1,2})일/;
  L.forEach(l => {
    let m;
    if ((m = reD.exec(l))) date = `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
    else if ((m = reM.exec(l))) msgs.push({ who: m[7], d: `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`, tm: `${m[4]} ${m[5]}:${m[6]}`, t: m[8] });
    else if ((m = reP.exec(l))) msgs.push({ who: m[1], d: date, tm: `${m[2]} ${m[3]}:${m[4]}`, t: m[5] });
    else if (msgs.length && l.trim() && !/^(저장한 날짜|.+님과 카카오톡 대화)/.test(l)) msgs[msgs.length - 1].t += '\n' + l;
  });
  if (msgs.length < 1) return null;
  const me = ((UI && UI.manager && UI.manager.name) || '').trim(), cnt = {};
  msgs.forEach(m => { if (!me || !m.who.includes(me)) cnt[m.who] = (cnt[m.who] || 0) + m.t.length; });
  const who = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0] || msgs[0].who, mine = msgs.filter(m => m.who === who && !/^(사진|이모티콘|동영상|파일)( \d+장)?$/.test(m.t.trim()));
  return { text: mine.map(m => m.t).join('\n'), meta: { from: who, date: mine.length ? mine[0].d : '', kakao: true } };
}


/* ---------- 진행 표시 ---------- */
function inProg(msg) { const b = document.getElementById('inProg'); if (b) { b.hidden = !msg; b.querySelector('span').textContent = msg || ''; } }


const RFP = { att: [], busy: false, res: null };
const REQ_RE = /(하여야|해야|할 것|하여야 함|필수|이상|이내|제출|준수|배치|확보|보유|금지|불가|가능할 것|요구|조건|포함|실시|운영할|비치|선임|승계|부담|책임)/;
function rfpSentences(t) {
  return String(t || '').replace(/\r/g, '').split(/\n+/)
    .flatMap(l => l.length > 160 ? l.split(/(?<=[다함음임요][.])\s+/) : [l])
    .map(s => s.replace(/^\s*(?:[0-9]{1,2}[.)]|[가-하][.)]|[①-⑳]|[\-•·○◦▪■□*>※]+)\s*/, '').replace(/\s+/g, ' ').trim())
    .filter(s => s.length >= 8 && s.length <= 220);
}
function rfpCat(s) {
  let best = null, sc = 0;
  RFP_CATS.forEach(c => { const n = c.kw.filter(k => s.includes(k)).length; if (n > sc) { sc = n; best = c; } });
  return best;
}
const HOW = {
  '인력·자격': '직종별 자격·경력 기준을 충족하는 인력으로 편성하고 배치 전 자격·교육 이수를 확인합니다',
  '근무형태': '요구 근무형태·근무시간에 맞춘 교대 편성표와 휴게시간 부여 계획을 제시합니다',
  '업무 범위': '과업 범위를 직종별 업무표준·점검표로 세분화해 누락 없이 수행합니다',
  '교육': '법정 교육(신임·직무·안전보건)과 현장 특별 직무교육 계획·이수 기록을 관리합니다',
  '안전·보건': '안전보건관리체계·TBM·위험성평가로 사고를 예방하고 사고 시 즉시 보고합니다',
  '법규·노무': '최저임금·4대보험·근로기준법 등 관계 법령을 준수하고 근로조건 이행을 확약합니다',
  '품질·평가': '월간 운영 보고와 정기 품질평가로 성과를 수치로 관리합니다',
  '장비·물품': '필요 장비·피복·소모품을 원가에 반영해 지급·관리합니다',
  '고용승계': '기존 근무자 고용승계 원칙을 적용하고 근로조건 저하 없이 전환합니다',
  '인수인계·개시': '착수 전 인수인계 체크리스트와 운영 개시 일정을 수립합니다',
  '보험·보증': '배상책임보험·이행보증 등 요구 보험·보증을 계약 전 가입합니다',
  '가격·대가': '연동 견적의 산출내역(인건비·경비·일반관리비·이윤)으로 근거를 제시합니다',
  '제출서류': '요구 제출서류 목록을 확인해 누락 없이 제출합니다',
  '시스템·보고': '통합관리 플랫폼(근태·Complaint·현장 지도)으로 실시간 현황을 보고합니다',
  '비상·보고': '비상대처 매뉴얼·상황별 대처 기준과 즉보 체계(5분 이내 1차 보고)로 대응합니다'
};
function analyzeRFP(text) {
  const t = String(text || ''), sents = rfpSentences(t), seen = new Set(), rows = [];
  sents.forEach(s => {
    const c = rfpCat(s); if (!c) return;
    if (!REQ_RE.test(s) && c.kw.filter(k => s.includes(k)).length < 2) return;
    const key = s.replace(/\s/g, '').slice(0, 40); if (seen.has(key)) return; seen.add(key);
    rows.push({ req: s.length > 160 ? s.slice(0, 158) + '…' : s, cat: c.k, std: c.std, man: c.man, how: HOW[c.k] || '', st: '충족' });
  });
  // 업종·직종·인원·기간·발주처·사업명
  const score = o => Object.entries(o).map(([k, v]) => [k, v.kw.reduce((a, w) => a + (t.split(w).length - 1), 0)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
  const ind = score(Object.fromEntries(Object.entries(RFP_IND).map(([k, v]) => [k, { kw: v }]))), jobs = score(Object.fromEntries(Object.entries(RFP_JOB).map(([k, v]) => [k, { kw: v }]))).filter(x => x[1] >= 1).map(x => x[0]).slice(0, 4);
  const heads = []; const HR = /(경비원|보안요원|경비|보안|미화원|청소원|미화|주차요원|주차관리원|주차|시설관리원|시설기사|전기기사|기계기사|안내원|안내|조리원|조리사|방역원|경호원|소장|반장)\s*[:：]?\s*(\d{1,3})\s*명/g;
  let m; while ((m = HR.exec(t)) && heads.length < 12) heads.push({ job: m[1], count: +m[2] });
  const pm = /(20\d{2})\s*[.\-년\/]\s*(\d{1,2})\s*[.\-월\/]\s*(\d{1,2})\s*일?\s*(?:부터)?\s*[~∼\-–]\s*(20\d{2})\s*[.\-년\/]\s*(\d{1,2})\s*[.\-월\/]\s*(\d{1,2})/.exec(t);
  const period = pm ? { from: `${pm[1]}-${pad(+pm[2])}-${pad(+pm[3])}`, to: `${pm[4]}-${pad(+pm[5])}-${pad(+pm[6])}` } : null;
  const cm = /(발주\s*기관|수요\s*기관|기관명|발주처|계약\s*상대자\s*\(발주\))\s*[:：]?\s*([^\n,]{2,30})/.exec(t);
  const tm = /(사업명|용역명|건\s*명|과업명)\s*[:：]?\s*([^\n]{4,60})/.exec(t);
  const budget = /(추정\s*가격|사업\s*예산|기초\s*금액|예정\s*가격|사업비)\s*[:：]?\s*(?:금\s*)?([\d,]{5,})\s*원/.exec(t);
  const subm = sents.filter(s => /제출/.test(s) && /(서류|증명|확약|허가|등록증|계획서|제안서)/.test(s)).slice(0, 12);
  RFP.res = { rows: rows.slice(0, 80), ind: ind.length ? ind[0][0] : '', jobs, heads, period, client: cm ? cm[2].trim() : '', title: tm ? tm[2].trim() : '', budget: budget ? +budget[2].replace(/,/g, '') : null, subm, len: t.length };
  return RFP.res;
}

async function rfpFiles(files) {
  files = [...files].filter(Boolean); if (!files.length || RFP.busy) return;
  RFP.busy = true; const got = [], errs = [];
  for (const f of files) { inProg(`${f.name || '이미지'} 읽는 중…`); try { got.push(await extractFile(f)); } catch (e) { errs.push(e.message || String(e)); } }
  inProg(''); RFP.busy = false;
  if (errs.length) toast(errs[0], 6000);
  if (!got.length) return;
  RFP.att.push(...got); renderRfpFiles();
  const txt = got.map(a => a.text).filter(Boolean).join('\n\n');
  if (!txt.trim()) return toast('파일에서 글자를 찾지 못했습니다. 요구사항을 직접 붙여넣어 주세요.', 5000);
  const ta = $('#f_rfp'); ta.value = (ta.value ? ta.value + '\n\n' : '') + txt;
  runRfp(true);
}
function renderRfpFiles() {
  const box = document.getElementById('inFiles'); if (!box) return;
  box.innerHTML = RFP.att.map((a, i) => `<span class="inf" title="${esc(a.name)}">📄 ${esc(a.name.length > 24 ? a.name.slice(0, 22) + '…' : a.name)}<button type="button" data-rm="${i}" aria-label="빼기">×</button></span>`).join('');
}
function initRfp() {
  const z = document.getElementById('intake'); if (!z || z.dataset.ready) return; z.dataset.ready = '1';
  const fi = document.getElementById('inFile');
  document.getElementById('inPick').onclick = () => fi.click();
  fi.onchange = () => { rfpFiles(fi.files); fi.value = ''; };
  ['dragenter', 'dragover'].forEach(ev => z.addEventListener(ev, e => { e.preventDefault(); z.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(ev => z.addEventListener(ev, e => { e.preventDefault(); z.classList.remove('drag'); }));
  z.addEventListener('drop', e => rfpFiles(e.dataTransfer.files));
  document.getElementById('inFiles').onclick = e => { const b = e.target.closest('[data-rm]'); if (b) { RFP.att.splice(+b.dataset.rm, 1); renderRfpFiles(); } };
}
