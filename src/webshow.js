/* =====================================================================
 * 🎬 웹 매뉴얼(HTML) — PPT와 같은 화면을 한 파일 웹페이지로, 영상은 실제로 재생
 *  · 영상은 파일 안에 넣어(인터넷 없이도 재생), 넣지 못한 영상은 웹 주소에서 재생
 *  · 화면에 보이면 소리 없이 자동 재생, 누르면 소리 재생 · 키보드 ←/→ 로 넘기기
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
async function makeWebShow(p, slidesIn, titleIn, onProgress) {
  const slides = slidesIn || buildSlides(p), title = titleIn || docTitle(p);
  const host = $('#render'); host.innerHTML = '';
  const imgs = [], idx = new Map(), vids = {}, keys = [];
  slides.flat().forEach(e => { if (e.t === 'video' && !keys.includes(e.key)) keys.push(e.key); });
  for (let i = 0; i < keys.length; i++) { onProgress && onProgress(`영상 넣는 중… ${i + 1}/${keys.length}`); vids[keys[i]] = await fetchVideo(keys[i]); }
  let body = '';
  slides.forEach((els, si) => {
    onProgress && onProgress(`화면 만드는 중… ${si + 1}/${slides.length}`);
    const d = slideDom(els); host.innerHTML = ''; host.appendChild(d);
    d.querySelectorAll('img').forEach(im => { const s = im.getAttribute('src'); if (!s) return; let k = idx.get(s); if (k == null) { k = imgs.length; imgs.push(s); idx.set(s, k); } im.removeAttribute('src'); im.setAttribute('data-i', k); });
    d.querySelectorAll('[data-vid]').forEach(n => { const k = n.getAttribute('data-vid'), im = n.querySelector('img'), pi = im ? im.getAttribute('data-i') : '';
      n.innerHTML = `<video data-v="${k}" data-pi="${pi}" muted playsinline loop controls preload="none" style="width:100%;height:100%;object-fit:cover;background:#0f1530;display:block"></video>`; });
    body += `<section class="sl" id="s${si + 1}"><div class="fr">${d.outerHTML}</div></section>`;
  });
  host.innerHTML = '';
  const vEmb = {}, vUrl = {};
  keys.forEach(k => { if (vids[k]) vEmb[k] = vids[k]; vUrl[k] = vidUrl(k); });
  const esc2 = s => String(s).replace(/</g, '&lt;');
  const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="author" content="Rat Rae Choi">
<title>${esc2(title)}</title><style>
body{margin:0;background:#1b2140;font-family:'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo','Noto Sans KR',sans-serif;color:#fff}
header{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:12px;padding:10px 18px;background:#0b1757;box-shadow:0 2px 10px rgba(0,0,0,.4)}
header b{font-size:16px}header small{color:#b9c3ec;font-size:12px}header .sp{flex:1}header button{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.1);color:#fff;border-radius:8px;padding:6px 12px;cursor:pointer;font:inherit;font-size:13px}
.sl{display:flex;justify-content:center;padding:14px 0}.fr{width:1280px;height:720px;transform-origin:top left;position:relative;box-shadow:0 8px 30px rgba(0,0,0,.45);background:#fff;overflow:hidden}
.fr .slide{position:relative;width:1280px;height:720px;overflow:hidden;background:#fff;color:#1c2333}
footer{text-align:center;color:#b9c3ec;font-size:12px;padding:18px}
</style></head><body><header><b>${esc2(title)}</b><small>${slides.length}쪽 · 영상 ${keys.length}편 · ←/→ 로 넘기기</small><span class="sp"></span><button onclick="print()">인쇄</button></header>
${body}<footer>${esc2(APP.name)} ${APP.version} · Designed &amp; Developed by Rat Rae Choi</footer>
<script>
var IM=${JSON.stringify(imgs)},VE=${JSON.stringify(vEmb)},VU=${JSON.stringify(vUrl)};
document.querySelectorAll('img[data-i]').forEach(function(im){im.src=IM[+im.getAttribute('data-i')];});
function b64url(b){var s=atob(b),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return URL.createObjectURL(new Blob([a],{type:'video/mp4'}));}
var VB={};Object.keys(VE).forEach(function(k){VB[k]=b64url(VE[k]);});
document.querySelectorAll('video[data-v]').forEach(function(v){var k=v.getAttribute('data-v'),pi=v.getAttribute('data-pi');if(pi!=='')v.poster=IM[+pi];v.src=VB[k]||VU[k];v.addEventListener('click',function(){v.muted=false;});});
var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){});}else v.pause();});},{threshold:.5});
document.querySelectorAll('video[data-v]').forEach(function(v){io.observe(v);});
function fit(){var w=Math.min(window.innerWidth-24,1280),s=w/1280;document.querySelectorAll('.fr').forEach(function(f){f.style.transform='scale('+s+')';f.parentNode.style.height=(720*s+28)+'px';});}
window.addEventListener('resize',fit);fit();
var cur=0,S=[].slice.call(document.querySelectorAll('.sl'));
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='PageDown'){cur=Math.min(S.length-1,cur+1);S[cur].scrollIntoView({behavior:'smooth'});e.preventDefault();}if(e.key==='ArrowLeft'||e.key==='PageUp'){cur=Math.max(0,cur-1);S[cur].scrollIntoView({behavior:'smooth'});e.preventDefault();}});
<\/script></body></html>`;
  return new Blob([html], { type: 'text/html' });
}
