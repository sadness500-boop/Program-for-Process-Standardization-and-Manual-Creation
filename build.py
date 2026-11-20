# Program for Process Standardization and Manual Creation — 한 파일 HTML 빌드 (라이브러리·자산 내장)
# 사용: python3 build.py [출력경로]   · Designed & Developed by Rat Rae Choi
import base64, json, sys, os
R = os.path.dirname(os.path.abspath(__file__)) + '/'
VER = json.load(open(R + 'version.json'))['version']
def b64(p): return base64.b64encode(open(R + p, 'rb').read()).decode()
A = json.load(open(R + 'vendor/asset.json'))
assets = {k: A[k] for k in ('logo', 'cube', 'sanitec', 'headerTbc', 'sigBase', 'dancing', 'fig', 'figDim', 'poster')}
import glob
for f in sorted(glob.glob(R + 'media/cases/*.jpg')):
    assets['poster']['cases/' + os.path.basename(f)[:-4]] = 'data:image/jpeg;base64,' + b64(f.replace(R, ''))
assets['icon'] = 'data:image/png;base64,' + b64('icons/header-160.png')
assets['osi'] = 'data:image/png;base64,' + b64('icons/cover-420.png')
def scr(s): return s.replace('</script', '<\\/script')
def rd(p): return open(R + p, encoding='utf-8').read()
html = rd('src/index.html')
libs = ['vendor/jszip.js', 'vendor/docx.js', 'vendor/pptx.js', 'vendor/jspdf.js', 'vendor/h2c.js']
html = html.replace('<!--LIBS-->', ''.join('<script>' + scr(rd(l)) + '</script>\n' for l in libs))
html = html.replace('<!--QR-->', '<script>' + scr(rd('vendor/qr.js')) + '</script>')
html = html.replace('/*ASSETS*/', 'const ASSET=' + json.dumps(assets) + ';')
for k, f in [('HF', 'src/hf.js'), ('SITES', 'src/sites.js'), ('DATA', 'src/data.js'), ('KB', 'src/kb.js'), ('UI', 'src/ui.js'), ('APP', 'src/app.js'), ('MANKB', 'src/man_kb.js'), ('MAN', 'src/man.js'),
             ('SUPABASE', 'vendor/supabase.js'), ('AUTH', 'vendor/auth.js'), ('APPACCESS', 'vendor/app_access.js')]:
    html = html.replace('/*' + k + '*/', scr(rd(f)))
for k, fs in [('SOP', ['src/sop_cln.js', 'src/sop_sec.js', 'src/sop_etc.js', 'src/sop_out.js', 'src/webshow.js'])]:
    assert html.count('/*' + k + '*/') == 1, k
    html = html.replace('/*' + k + '*/', scr('\n'.join(rd(f) for f in fs)))
html = html.replace('<script>/*WORKER*/</script>\n', '').replace('<!--AUTHCSS-->', rd('vendor/auth.css'))
html = html.replace("version: 'v1.0.0'", f"version: 'v{VER}'")
out = sys.argv[1] if len(sys.argv) > 1 else R + 'index.html'
open(out, 'w', encoding='utf-8').write(html)
print(out, len(html) // 1024, 'KB')
