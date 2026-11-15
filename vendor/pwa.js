
/* PWA: 크롬 앱 설치·오프라인 시작 (웹 주소에서만) */
if('serviceWorker' in navigator && location.protocol==='https:' && !window.Capacitor){ navigator.serviceWorker.register('sw.js').catch(function(){}); }
