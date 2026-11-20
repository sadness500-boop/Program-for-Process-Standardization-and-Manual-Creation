# 에스텍 「비상대처 매뉴얼」(.doc → soffice로 .docx 변환) → src/emg_kb.js
# 사용: python3 tools/extract_emg.py 비상대처매뉴얼.docx src/emg_kb.js   · Designed & Developed by Rat Rae Choi
import docx, json, re, sys
from docx.table import Table
from docx.text.paragraph import Paragraph
d = docx.Document(sys.argv[1])
def clean(s):
    s = s.replace('　', ' ').replace('\t', ' ').replace('\xa0', ' ')
    s = re.sub(r'[ ]{2,}', ' ', s).strip()
    return s
items = []
for ch in d.element.body.iterchildren():
    tag = ch.tag.split('}')[1]
    if tag == 'p':
        t = clean(Paragraph(ch, d).text)
        if t: items.append(['p', t])
        # 글상자(텍스트 상자) 안의 글 — Choice/Fallback 중복 제거
        seen = set()
        for tb in ch.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}txbxContent'):
            lines = [clean(''.join(x.text or '' for x in pp.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'))) for pp in tb.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p')]
            lines = [l for l in lines if l]
            key = '|'.join(lines)
            if not lines or key in seen or len(key) < 4: continue
            seen.add(key)
            if re.match(r'^(Ⅰ\.|비상 대처)', lines[0]): continue
            for l in lines: items.append(['p', l])
    elif tag == 'tbl':
        T = Table(ch, d); rows = []
        for r in T.rows:
            cells = []
            for c in r.cells:
                x = '\n'.join(clean(l) for l in c.text.split('\n') if clean(l))
                if x and (not cells or cells[-1] != x): cells.append(x)
            if cells and (not rows or rows[-1] != cells): rows.append(cells)
        # 1칸짜리 표는 문단으로
        if rows and all(len(r) == 1 for r in rows):
            for r in rows:
                for l in r[0].split('\n'): items.append(['p', l])
        elif rows: items.append(['t', rows])
# 장 나누기: 로마숫자 장 제목 (표 첫 칸에 들어간 장 제목도 인식)
RN = r'^(Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|Ⅵ|Ⅶ|Ⅷ|Ⅸ|Ⅹ|XI)\s*\.\s*'
chs = []; cur = None; part2 = False
for it in items:
    txt = it[1] if it[0] == 'p' else (it[1][0][0] if it[1] and it[1][0] else '')
    m = re.match(RN, txt)
    if m:
        title = re.sub(RN, '', txt.split('\n')[0]).split(' / ')[0].strip()
        if '테러' in title: part2 = True
        cur = {'t': title, 'items': []}; chs.append(cur)
        if it[0] == 't':   # 표 안의 장 제목 → 나머지 칸은 내용으로
            rest = it[1][0][1:] + [x for r in it[1][1:] for x in r]
            for x in rest:
                for l in x.split('\n'): cur['items'].append(['p', l])
        continue
    if cur is None: continue
    cur['items'].append(it)
# 줄바꿈으로 끊긴 문장 잇기
MK = re.compile(r'^([0-9]+\s*[.)]|[0-9]+\)|[가-하]\s*[.),]|[가-하]\)|[①-⑳]|[□■▷▶※*ㅇ\-•○◦☞◎◇◆]|\(|【|\[)')
for c in chs:
    out = []
    for it in c['items']:
        if it[0] == 'p' and out and out[-1][0] == 'p' and not MK.match(it[1]) and not re.search(r'[.:?!)」』]$|다$|요$|함$|것$', out[-1][1]) and len(out[-1][1]) > 25:
            out[-1][1] = out[-1][1] + ' ' + it[1]
        else: out.append(it)
    c['items'] = out
# 반복된 표 머리(구분|내용) 정리
for c in chs:
    out = []
    for it in c['items']:
        if it[0] == 't' and out and out[-1][0] == 't' and out[-1][1][0] == it[1][0]:
            out[-1][1].extend(it[1][1:])
        else: out.append(it)
    c['items'] = out
KEY = [('사건사고', 'acc'), ('천재지변', 'nat'), ('집단민원', 'grp'), ('화재', 'fire'), ('소란', 'riot'), ('침입', 'intr'), ('응급', 'ems'), ('가스', 'gas'), ('보안사건', 'secu'), ('매스컴', 'media'), ('테러', 'terr')]
for c in chs:
    c['k'] = next((k for w, k in KEY if w in c['t']), 'etc')
    c['t'] = re.sub(r'\s*\(.*?\)\s*', ' ', c['t']).replace('발생 시.', '발생 시').replace(' 시', ' 시').strip()
src = '/* 에스텍 「비상대처 매뉴얼」 — 사건사고·천재지변·집단민원·화재·소란난동·침입이상·응급환자·가스누출·보안사건·매스컴·대테러\n * tools/extract_emg.py 로 원문에서 추출 · 업무매뉴얼 「비상대처 매뉴얼」 장에 그대로 수록\n * Designed & Developed by Rat Rae Choi */\nconst EMG = ' + json.dumps(chs, ensure_ascii=False) + ';\n'
open(sys.argv[2], 'w', encoding='utf-8').write(src)
for c in chs: print(c['k'], c['t'], len(c['items']), sum(1 for i in c['items'] if i[0] == 't'))
