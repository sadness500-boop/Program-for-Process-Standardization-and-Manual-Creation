# 업로드 「미화매뉴얼 외 각종 자료」에서 사업장 자료 패키지용 기준 데이터를 뽑아 src/pkg_data.js 로 저장
# 사용: python3 tools/extract_pkg_data.py <압축 푼 폴더>   — Designed & Developed by Rat Rae Choi
import openpyxl, json, sys, re, subprocess
R = sys.argv[1].rstrip('/') + '/'
def s(v): return re.sub(r'\s+', ' ', str(v)).strip() if v not in (None, '') else ''
out = {}
# 1) 품질평가 체크리스트
wb = openpyxl.load_workbook(R + '미화 품질평가 체크리스트/1. 미화 품질평가 체크리스트.xlsx', data_only=True)
Q = []
for ws in wb:
    title = ws.title.split('. ', 1)[-1]
    items = []; b = c = d = ''
    for r in ws.iter_rows(values_only=True):
        r = list(r) + [None] * 12
        if isinstance(r[0], str) and '합계' in r[0]: break
        if r[1]: b = s(r[1])
        sub = lambda v: re.fullmatch(r'소\s*계', s(v)) is not None
        if r[2] and not sub(r[2]): c = s(r[2])
        if r[3] and not sub(r[3]): d = s(r[3])
        if r[4] and isinstance(r[5], (int, float)) and '점검사항' not in s(r[4]):
            items.append([b, c, d, s(r[4]), round(float(r[5]), 4)])
    Q.append({'t': title, 'items': items})
out['QUALITY'] = Q
# 2) 약품별 성분
ws = openpyxl.load_workbook(R + '미화약품별 성분 현황/1. 미화약품별 성분 현황(최종 1216).xlsx', data_only=True).worksheets[0]
CH = []; cur = None
for r in ws.iter_rows(min_row=3, values_only=True):
    r = list(r) + [None] * 12
    if isinstance(r[0], (int, float)) or (r[0] and s(r[0]).isdigit()):
        cur = {'mk': s(r[1]), 'n': s(r[2]), 'use': s(r[4]), 'ph': s(r[5]), 'sub': [], 'note': s(r[11])}; CH.append(cur)
    if cur and r[6]: cur['sub'].append([s(r[6]), s(r[7]), s(r[8]), 'O' if s(r[9]) else '', 'O' if s(r[10]) else ''])
out['CHEM'] = CH
# 3) 특수건강진단·작업환경측정 대상 유해물질
ws = openpyxl.load_workbook(R + '특수건강진단,작업환경측정 대상 유해물질목록/1. 특수건강진단,작업환경측정 대상 유해물질목록(최종 1216).xlsx', data_only=True).worksheets[0]
HZ = []
for r in ws.iter_rows(min_row=3, values_only=True):
    if r[0] is None or not s(r[1]): continue
    HZ.append([s(r[1]), s(r[2]), s(r[3]), 'O' if s(r[4]) else '', 'O' if s(r[5]) else ''])
out['HAZMAT'] = HZ
# 4) 미화용품 코드(구매요청서)
wb = openpyxl.load_workbook(R + '미화용품 구매요청서/1. 미화용품 구매 요청서(사업장용)최종.xlsx', data_only=True)
ws = [w for w in wb if '코드' in w.title][0]
CODES = []
for r in ws.iter_rows(min_row=2, values_only=True):
    if r[0] and s(r[1]): CODES.append([s(r[0]), s(r[1]), s(r[2]), s(r[3])])
out['CODES'] = CODES
# 5) 약품 용도·희석비율 (PDF)
t = subprocess.run(['pdftotext', '-layout', R + '미화용품소모품,약품 규격서, 약품별 용도희석비율/2. 청소약품별 용도 및 희석비율.pdf', '-'], capture_output=True, text=True).stdout
out['DILUTE_TXT'] = t
open(sys.argv[2] if len(sys.argv) > 2 else 'src/pkg_data.js', 'w', encoding='utf-8').write(
    '/* 사업장 자료 패키지 기준 데이터 — 에스텍 미화 표준 자료(품질평가·약품 성분·유해물질·용품 코드)에서 추출 · tools/extract_pkg_data.py\n * Designed & Developed by Rat Rae Choi */\n' +
    ''.join(f'const {k} = {json.dumps(v, ensure_ascii=False)};\n' for k, v in out.items() if k != 'DILUTE_TXT'))
print({k: len(v) for k, v in out.items()})
print(t[:200])
