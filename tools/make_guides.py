# 사용자 매뉴얼 · 제작자 관리 매뉴얼 만들기
# 사용: (로컬 웹서버로 저장소 폴더를 연 뒤) python3 tools/make_guides.py http://localhost:8765/ [출력폴더] [예시 이미지 폴더]
# 화면을 캡처한 뒤 tools/guide.js 를 페이지에 넣어 같은 Word·PPT 엔진으로 docs/ 에 만듭니다. — Designed & Developed by Rat Rae Choi
import asyncio, base64, io, json, os, sys
from PIL import Image
from playwright.async_api import async_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/'
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), '..', 'docs')
EXDIR = sys.argv[3] if len(sys.argv) > 3 else None
LOGIN_URL = sys.argv[4] if len(sys.argv) > 4 else None
HERE = os.path.dirname(os.path.abspath(__file__))
SH = {}
def put(k, png):
    im = Image.open(io.BytesIO(png)).convert('RGB')
    if im.width > 1500: im = im.resize((1500, round(im.height * 1500 / im.width)))
    b = io.BytesIO(); im.save(b, 'JPEG', quality=82)
    SH[k] = {'src': 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode(), 'w': im.width, 'h': im.height}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=1)
        pg = await ctx.new_page()
        await pg.goto(URL + 'index.html'); await pg.wait_for_timeout(1500)
        if await pg.is_visible('#mgName'):
            await pg.fill('#mgName', '최민영'); await pg.fill('#mgTitle', '지사장'); await pg.click('#gateGo')
        await pg.wait_for_timeout(3200)
        put('main', await pg.screenshot())
        await pg.add_style_tag(content='#toast{display:none!important}.band{position:static!important}.foot{position:static!important}')
        await pg.click('#mgrCard'); await pg.wait_for_timeout(500); put('mgr', await pg.locator('.modal').screenshot()); await pg.keyboard.press('Escape'); await pg.evaluate('closeModal()')
        await pg.click('#qrCard'); await pg.wait_for_timeout(700); put('qr', await pg.locator('.modal').screenshot()); await pg.evaluate('closeModal()')
        put('site', await pg.locator('#siteCard').screenshot())
        put('treeStd', await pg.locator('#treeCard').screenshot())
        await pg.click('#btnSample'); await pg.wait_for_timeout(500)
        put('form', await pg.locator('#formCard').screenshot())
        await pg.click('#btnGen'); await pg.wait_for_timeout(800)
        await pg.evaluate("document.getElementById('editor').style.maxHeight='860px'")
        put('editorStd', await pg.locator('#outPanel').screenshot())
        await pg.click('[data-kind=man]'); await pg.wait_for_timeout(600)
        put('treeMan', await pg.locator('#treeCard').screenshot())
        await pg.click('#btnGen'); await pg.wait_for_timeout(800)
        put('editorMan', await pg.locator('#outPanel').screenshot())
        put('outbtns', await pg.locator('.outbtns').screenshot())
        await pg.evaluate("""localStorage.setItem('stec_proposal_inbox', JSON.stringify([{id:'g-stqs-1',src:'stqs',title:'티씨씨스틸 · 보안 용역 (2027)',client:'티씨씨스틸',heads:9,monthly:24750000,period:{from:'2027-01-01',to:'2027-12-31'},rows:[{job:'보안',title:'보안반장',count:1,shift:'주5일 주간(8h)',unit:2950000,amount:2950000},{job:'보안',title:'경비원',count:8,shift:'격일제',unit:2725000,amount:21800000}],at:'2026-11-20T09:00:00'},{id:'g-wbe-1',src:'wbe',title:'티씨씨스틸 · 공장 미화',client:'티씨씨스틸',heads:4,monthly:11200000,rows:[{job:'미화',title:'미화 인력',count:4,amount:11200000}],at:'2026-11-19T15:00:00'}]))""")
        await pg.evaluate('refreshLinks(false)'); await pg.wait_for_timeout(800)
        await pg.evaluate("""(()=>{ document.getElementById('f_rfp').value='사업명: 티씨씨스틸 보안 용역\\n1. 경비원은 일반경비원 신임교육을 이수한 자로 배치하여야 한다.\\n2. 정문 출입통제 및 외곽 순찰을 2시간마다 실시하여야 한다.\\n3. 근무형태는 격일제(24시간)로 운영한다.\\n4. 화재·응급상황 발생 시 즉시 보고하고 비상연락체계를 유지할 것.\\n5. 월간 운영 보고서를 익월 5일까지 제출하여야 한다.'; runRfp(false); })()"""); await pg.wait_for_timeout(600)
        put('est', await pg.locator('#linkCard').screenshot()); put('rfp', await pg.locator('#intake').screenshot() if False else await pg.locator('#rfpRes').screenshot())
        await pg.evaluate("document.getElementById('hist').scrollIntoView()")
        await pg.evaluate("""(()=>{ const h=readHist(); if(!h.length){ storeHistory([{at:'2026-11-16(월)',kind:'man',client:'티씨씨스틸',title:'보안(경비) × 제조·공장 업무매뉴얼',picked:['MA-01','MB-01'],f:{}},{at:'2026-11-16(월)',kind:'std',client:'티씨씨스틸',title:'보안(경비) 업무표준서 — 티씨씨스틸',picked:['A1-01'],f:{}}]); renderHistory(); } })()""")
        put('hist', await pg.locator('#hist').screenshot())
        # 권한 표 · 잠금 화면 (설명용 화면 — 실제 관리자 페이지와 같은 모양)
        await pg.evaluate("""(()=>{ const apps=[['stcr','Complaint 대응'],['stse','단기 견적'],['stso','사업장 지도'],['stqs','용역 견적'],['wbe','업무량 산정'],['stos','업무표준화']];
          const d=document.createElement('div'); d.id='permMock'; d.style.cssText='position:fixed;inset:0;z-index:9999;background:#eef1f7;padding:26px;font-family:inherit';
          const cell=(on,t)=>on?`<button class="aa-cell on">사용<small>${t||'전체 지사'}</small></button>`:`<button class="aa-cell off">사용 안 함<small>눌러서 지정</small></button>`;
          d.innerHTML=`<div style="display:flex;gap:6px;margin-bottom:10px"><span style="padding:8px 14px;border-radius:10px 10px 0 0;background:#dfe5f3">👥 사용자</span><span style="padding:8px 14px;border-radius:10px 10px 0 0;background:#fff;font-weight:700">🔐 프로그램별 권한</span></div><div style="background:#fff;border-radius:12px;padding:16px"><div class="aa-note">하나의 아이디(통합 로그인)로 쓰는 <b>6개 프로그램</b>의 사용 권한을 사람마다 따로 줍니다. 칸을 누르면 <b>사용 / 사용 안 함 · 사용기한 · 관리 범위(담당 지사)</b>를 정합니다.</div>
          <div class="aa-wrap"><table class="aa-t"><thead><tr><th style="text-align:left">사용자</th>${apps.map(a=>`<th class="${a[0]==='stos'?'me':''}">${a[1]}${a[0]==='stos'?'<br><small>(이 프로그램)</small>':''}</th>`).join('')}</tr></thead><tbody>
          <tr><td class="u"><b>김담당</b><small>kim@stec.kr · 사용자 · 사용 중 · 동부지사</small></td>${apps.map(a=>`<td>${cell(['stcr','stos'].includes(a[0]),'동부')}</td>`).join('')}</tr>
          <tr><td class="u"><b>이현장</b><small>lee@stec.kr · 사용자 · 사용 중 · 남부지사</small></td>${apps.map(a=>`<td>${cell(a[0]==='stos','남부 · ~2027-06-30')}</td>`).join('')}</tr>
          <tr><td class="u"><b>최민영</b><small>owner@stec.kr · 제작자 · 사용 중</small></td>${apps.map(()=>'<td><span class="aa-all">전체 (제작자)</span></td>').join('')}</tr></tbody></table></div><div style="text-align:right;font-size:11px;color:#8a93a3;font-style:italic;margin-top:8px">Designed &amp; Developed by Rat Rae Choi</div></div>`;
          document.body.appendChild(d); })()""")
        await pg.wait_for_timeout(300); put('perm', await pg.screenshot(clip={'x': 0, 'y': 0, 'width': 1440, 'height': 360}))
        await pg.evaluate("document.getElementById('permMock').remove()")
        await pg.evaluate("""(()=>{ let d=document.createElement('div'); d.id='aaLock'; d.innerHTML=`<div class="aa-box"><div class="ic">🔐</div><h2>이 프로그램 사용 권한이 없습니다</h2><p><b>김담당</b> 님의 계정은 승인되었지만<br>「Program for Process Standardization and Manual Creation」 사용 권한이 아직 지정되지 않았습니다.<br>제작자(관리자)에게 <b>프로그램별 권한</b>을 요청하세요.</p><button class="aa-btn">다시 확인</button><button class="aa-btn sec">다른 계정으로 로그인</button><div style="text-align:right;font-size:11px;color:#8a93a3;font-style:italic">Designed &amp; Developed by Rat Rae Choi</div></div>`; document.body.appendChild(d); })()""")
        await pg.wait_for_timeout(300); put('lock', await pg.locator('#aaLock .aa-box').screenshot())
        await pg.evaluate("document.getElementById('aaLock').remove()")
        # 휴대폰
        m = await b.new_page(viewport={'width': 412, 'height': 880})
        await m.goto(URL + 'index.html'); await m.wait_for_timeout(1500)
        if await m.is_visible('#mgName'):
            await m.fill('#mgName', '최민영'); await m.click('#gateGo')
        await m.wait_for_timeout(3200); await m.add_style_tag(content='#toast{display:none!important}'); put('mobile', await m.screenshot())
        # 로그인 화면
        if LOGIN_URL:
            l = await b.new_page(viewport={'width': 1200, 'height': 900})
            await l.goto(LOGIN_URL + 'index.html'); await l.wait_for_timeout(3500)
            try: put('login', await l.locator('#authGate .ag-box, #authGate > div').first.screenshot())
            except Exception as e: print('login shot', e)
        # 출력물 예시 이미지
        if EXDIR:
            for k, f in [('outM1', 'd1-01.jpg'), ('outM2', 'd11-11.jpg'), ('outM3', 'd32-32.jpg'), ('outS1', 's1-01.jpg'), ('slM1', 'p33-33.jpg'), ('slM2', 'p20-20.jpg'), ('slS1', 'q7-07.jpg')]:
                fp = os.path.join(EXDIR, f)
                if os.path.exists(fp): put(k, open(fp, 'rb').read())
        await pg.add_script_tag(content=open(os.path.join(HERE, 'guide.js'), encoding='utf-8').read())
        res = await pg.evaluate('SH => makeGuides(SH)', SH)
        os.makedirs(OUT, exist_ok=True)
        for name, data in res.items():
            open(os.path.join(OUT, name), 'wb').write(base64.b64decode(data)); print('saved', name)
        await b.close()
asyncio.run(main())
