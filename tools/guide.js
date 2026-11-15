/* =====================================================================
 * 사용자 매뉴얼 · 제작자 관리 매뉴얼 생성기 (프로그램 페이지 안에서 실행 — 같은 Word·PPT 엔진 사용)
 * 사용: tools/make_guides.py 가 화면을 캡처한 뒤 이 스크립트를 주입해 docs/ 에 Word·PPT를 만듭니다.
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
window.makeGuides = async function (SH0) {
  const V = APP.version, D = fmtD(kstNow());
  const shot = k => SH0[k] || null;
  const PROGS = [['Attendance Management Software (근태관리)', 'ams', '자체 「관리 범위」'], ['S-Tec Complaint Response System', 'stcr', '🔐 프로그램별 권한'], ['S-Tec short estimate (단기 견적)', 'stse', '🔐 프로그램별 권한'], ['S-Tec-Business-Site-Overview (사업장 지도)', 'stso', '🔐 프로그램별 권한'], ['S-Tec-Quotation-System (용역 견적)', 'stqs', '🔐 프로그램별 권한'], ['Workload-Based Cost and Labor Estimation (업무량 산정)', 'wbe', '🔐 프로그램별 권한'], ['Program for Process Standardization and Manual Creation (업무표준화·매뉴얼)', 'stos', '🔐 프로그램별 권한 (이 프로그램)']];
  const formRows = ['common', 'job', 'safety'].flatMap(set => FORMS.filter(f => f.set === set).map(f => [f.id, f.n, f.jobs ? f.jobs.map(j => JOB[j].n).join('·') : '전 직종', f.keep]));
  const USER = {
    key: 'user', title: '사용자 매뉴얼', sub: `업무표준서 · 업무매뉴얼 작성 · 출력 · ${V} · ${D}`, file: `Program-for-Process-Standardization-and-Manual-Creation_사용자매뉴얼_${V}`,
    secs: [
      { h: '프로그램 소개', shot: 'main', cap: '메인 화면', text: ['직종·산업·사업장을 고르면 근로기준법·노동관계법·경비업법·산업안전보건법 기준의 「업무표준서」와 [Manual - Project] 체계의 「업무매뉴얼」을 Word·PPT·PDF로 바로 만들어 주는 에스텍 그룹 프로그램입니다.'],
        tbl: { head: ['구분', '내용'], w: [2400, 7238], rows: [['업무표준서', '대분류 7 · 중분류 15 · 표준 50개 — 직무·근태·복무·안전·인사노무·품질·인력산정 표준'], ['업무매뉴얼', 'Manual-Project 4계층(통합·직종별·직종×산업·현장별) · 11장 36절 · 사건사고 상황별 대처 24건 · 판례 10건'], ['업무 서식', `업종별 대장·점검표·보고서 ${FORMS.length}종 — 매뉴얼과 별도 Word 「업무 서식집」(사업장명 미리 기재 · 인쇄용)`], ['멀티미디어', '직종별 3D 피규어 · 현장 사진 · 근무 영상(PPT 재생) · 영상 QR(Word) · Complaint 사례 영상 7편'], ['연계 프로그램', '근태관리(근무조 코드) · 업무량 산정(업무 분류·표준시간) · Complaint 대응 · 견적시스템 · 단기견적 · 사업장 지도'], ['출력', 'Word(머리글·바닥글·결재란·점검표) · PPT(16:9, 영상 포함) · PDF(PPT와 같은 디자인)']] } },
      { h: '설치 · 실행', text: ['PC·휴대폰 어디서나 같은 아이디로 씁니다.'], steps: ['PC: 웹 주소 ' + APP.shareUrl + ' 를 열거나, 버전별 HTML 파일을 더블클릭', '안드로이드: 상단 「다운로드 QR」 → APK 내려받기 → 출처를 알 수 없는 앱 허용 → 설치(새 버전은 덮어 설치)', '아이폰: 사파리로 웹 주소 열기 → 공유 → 「홈 화면에 추가」'],
        tip: 'APK는 GitHub Actions가 자동으로 만듭니다. 최신판 주소: ' + APP.apkUrl },
      { h: '로그인 · 가입 신청', shot: 'login', cap: '로그인 화면', text: ['에스텍 통합 로그인 — 근태관리·Complaint·견적 등 7개 프로그램을 하나의 아이디로 씁니다.'], steps: ['처음이면 「가입 신청」(이메일·성명·소속) → 제작자·관리자 승인 후 사용', '로그인 시 「이 기기 이름」을 적으면 접속기록에 남습니다', '비밀번호를 잊으면 「비밀번호를 잊었어요」 → 관리자가 임시 비밀번호 발급'] },
      { h: '화면 구성', shot: 'main', cap: '① 사업장 → ② 항목 → ③ 작성 정보 → ④ 검토·출력', tbl: { head: ['영역', '하는 일'], w: [2400, 7238], rows: [['상단 밴드', '프로그램 이름·버전·자료 현황, 업무표준 담당 · 다운로드 QR · 친구 추천 · 내 계정 · 주간/야간/시스템'], ['① 적용 사업장 선정', '에스텍베스트 사업장 151곳(지사별) · 검색 · 직접 입력 · 전사 공통'], ['② 항목 선택', '📋 업무표준서 / 📘 업무매뉴얼 전환 · 대·중·소 분류 · 검색'], ['③ 작성 정보', '직종 · 매뉴얼 계층 · 산업 · 근무조 코드 · 문서명 · 결재 · 특이사항 · 문서 용도'], ['④ 검토 · 출력', '생성된 내용을 고친 뒤 Word · PPT · PDF 출력, 메인 화면에는 직종 소개 영상']] } },
      { h: '상단 기능', shot: 'mgr', cap: '업무표준 담당 지정', text: ['상단 카드는 에스텍 프로그램 그룹 공통 구성입니다.'], tbl: { head: ['카드', '기능'], w: [2400, 7238], rows: [['업무표준 담당', '담당자(사진·성명·직책·지사)를 지정해야 프로그램이 열립니다 — PPT 「표준 관리 책임」에 표시'], ['다운로드 QR', '웹 주소·APK QR을 크게 보여 줍니다(휴대폰 카메라로 설치)'], ['친구 추천', '프로그램 소개 문구·주소를 복사·공유'], ['내 계정', '로그인 정보 · 기록 동기화 · 로그아웃 · (관리자) 관리자 페이지'], ['주간/야간/시스템', '화면 밝기 테마']] } },
      { h: '다운로드 QR · 친구 추천', shot: 'qr', cap: '다운로드 QR', steps: ['「다운로드 QR」을 누르면 웹 주소와 안드로이드 앱 QR이 크게 나옵니다', '「친구 추천」으로 소개 문구와 주소를 카카오톡·문자로 보냅니다'] },
      { h: '① 적용 사업장 선정', shot: 'site', cap: '사업장 목록', steps: ['지사(동부·서부·남부·중부)를 고르거나 사업장명·주소·업종으로 검색', '사업장을 누르면 직종·산업·기준 근무형태가 자동으로 맞춰집니다', '목록에 없으면 「✎ 직접 입력」, 회사 공통 문서면 「🏢 전사 공통」'], tip: '관리 범위(담당 지사)가 지정된 계정은 그 지사 사업장만 보입니다.' },
      { h: '② 업무표준서 항목 선택', shot: 'treeStd', cap: '📋 업무표준서 — 대·중·소 분류', steps: ['②에서 「📋 업무표준서」 선택', '대분류(A~G)를 펼쳐 표준 항목을 누름(최대 40개)', '「📦 직종 권장 패키지」로 직종 권장 표준을 한 번에 선택'],
        tbl: { head: ['표시', '뜻'], w: [2400, 7238], rows: [['법정', '법령상 의무'], ['핵심', '에스텍 그룹 공통 필수'], ['권장', '품질 향상 권장'], ['★', '선택한 직종의 권장 표준'], ['연계', '근태·업무량·견적 등 다른 프로그램 자료로 표가 자동 생성'], ['내부', '고객사 제출용에서는 빠지는 항목(징계·견적 등)']] } },
      { h: '② 업무매뉴얼 장 · 절 선택', shot: 'treeMan', cap: '📘 업무매뉴얼 — 11장 36절', steps: ['②에서 「📘 업무매뉴얼」 선택 → 계층 권장 구성이 자동 선택됨', '③ 「매뉴얼 계층」에서 통합(1계층)·직종별(2계층)·직종×산업(3계층)·현장별 근무지침(4계층) 중 선택', '필요한 장·절을 더하거나 빼기 — 「영상」 표시는 사진·영상이 들어가는 절'],
        tbl: { head: ['장', '내용'], w: [2400, 7238], rows: MAN.map(L => [`${L.e} ${L.n}`, L.mids[0].smalls.map(s => s.n.replace(/ — .*/, '')).join(' · ')]) } },
      { h: '③ 작성 정보 입력', shot: 'form', cap: '③ 표준 작성 정보', steps: ['적용 직종(7개) 선택 — 사업장을 고르면 자동', '산업(12개)·기준 근무형태(근태관리 근무조 코드) 확인 — 월 근로시간·조 수·법정 확인이 바로 표시', '문서명·개정 차수·시행일·작성/검토/승인자 입력', '사업장 특이사항(한 줄에 하나) → 「🔎 특이사항으로 표준 항목 추천」', '문서 용도: 사내 표준(내부) / 고객사 제출용'], tip: '「예시 채우기」를 누르면 TCC스틸 보안 사례가 채워집니다.' },
      { h: '④ 검토 · 편집 · 출력', shot: 'editorStd', cap: '생성된 업무표준안 편집', steps: ['[⚙ 업무표준안 생성] 또는 [📘 업무매뉴얼 생성]', '■ 로 시작하는 줄은 소제목, - 로 시작하는 줄은 항목 — 자유롭게 고침', '법적 근거에서 출력할 법령 선택', 'Word · PPT · PDF 또는 「3종 일괄 출력」'], tip: 'PPT는 현장 영상이 함께 들어가 파일이 큽니다(20~35MB). PDF는 PPT와 같은 디자인의 이미지 문서입니다.' },
      { h: '업무매뉴얼 출력물', shot: 'editorMan', cap: '업무매뉴얼 생성 결과', imgs: [['outM1', 'Word 표지 — 3D 피규어 · 현장 사진 · 영상 QR'], ['outM2', 'Word 상황별 대처 카드 — 사진 · 영상 QR · 대처 순서'], ['outM3', '별도 Word 업무 서식집 — 사업장명·소속·직종이 미리 적힌 인쇄용 양식'], ['slM1', 'PPT 상황별 대처 — 영상 재생 · 단계 카드 · 금지 행동'], ['slM2', 'PPT 「이런 행동은 안 됩니다」 — Complaint 사례 영상']],
        text: ['문서번호: 1계층 STB-COM-000 · 2계층 STB-직종-100 · 3계층 STB-직종-101~112 · 4계층 STB-직종-9xx', 'Word 붙임: 일일 점검표 · 교육 확인서 · 경위서(6하원칙) · 업무 서식 목록', '업무 서식이 들어간 매뉴얼을 Word로 출력하면 「업무 서식집」 Word 파일이 함께 저장됩니다.'] },
      { h: '업무표준서 출력물', imgs: [['outS1', 'Word 업무표준서 표지 — 결재란 · 주요 내용'], ['slS1', 'PPT 표준 항목 슬라이드 — 절차 카드 · 점검 항목 · KPI']], text: ['Word: 결재란 · 제·개정 이력 · 총칙 · 사업장 개요 · 항목 체계 · 세부 기준(연계 표) · 법적 근거 · 이행 점검표 · 교육 확인서'] },
      { h: '업무 서식 목록', text: [`④ 출력의 [📝 업무 서식 Word] 버튼을 누르면 고른 사업장·직종에 맞는 서식만 모은 「업무 서식집」 Word가 따로 만들어집니다(총 ${FORMS.length}종 중 직종별 13~19종).`, '보안은 보안 서식, 주차는 주차 서식, 시설은 시설 서식, 미화는 미화 서식, 안내·조리·소독방역은 기타 업종 서식 + 공통·안전 서식이 들어갑니다.', '사업장명·소속 지사·소재지·직종·근무형태가 미리 적혀 있고, 한 쪽에 한 서식씩 결재란(담당·현장대리인·지사장)과 함께 인쇄됩니다. 바닥글 서명에는 날짜가 들어가지 않습니다.'], tbl: { head: ['서식번호', '서식명', '직종', '보존 기간'], w: [1400, 3600, 2600, 2038], rows: formRows } },
      { h: '출력 기록', shot: 'hist', cap: '최근 출력 기록', steps: ['출력하면 기록이 남고 누르면 그대로 불러옵니다', '체크 후 「선택 삭제」·「전체 삭제」', '로그인하면 다른 기기와 기록이 동기화됩니다'] },
      { h: '휴대폰에서 사용', shot: 'mobile', cap: '휴대폰 화면', steps: ['화면이 한 줄로 바뀌고 순서대로 내려가며 작성', '출력 파일은 휴대폰 다운로드 폴더에 저장', 'PPT 영상은 PC 파워포인트에서 재생하는 것을 권장'] },
      { h: '자주 묻는 질문', tbl: { head: ['질문', '답'], w: [3300, 6338], rows: [['프로그램이 잠겨 있어요', '상단 「업무표준 담당」을 지정해야 열립니다. 로그인 후 잠기면 제작자에게 「프로그램별 권한」을 요청하세요.'], ['사업장이 안 보여요', '관리 범위(담당 지사)가 지정된 계정입니다. 제작자에게 범위 변경을 요청하세요.'], ['영상 QR이 안 열려요', '웹 주소(GitHub Pages)가 켜져 있어야 합니다. 제작자에게 문의하세요.'], ['표준시간·인원이 실제와 달라요', '업무량은 WBE 사업장 유형 기본규모 기준입니다. 실측값은 업무량 산정 프로그램에서 다시 산정하세요.'], ['법령이 바뀌었어요', '법령 요약은 실무 참고용입니다. 원문을 확인하고 제작자에게 개정을 요청하세요.']] } }
    ]
  };
  const MAKER = {
    key: 'maker', title: '제작자 관리 사용매뉴얼', sub: `통합 로그인 · 프로그램별 권한 · 배포 · 자료 관리 · ${V} · ${D}`, file: `Program-for-Process-Standardization-and-Manual-Creation_제작자관리매뉴얼_${V}`,
    secs: [
      { h: '통합 로그인 구조', text: ['하나의 Supabase 서버(근태관리 프로젝트)로 7개 에스텍 프로그램이 같은 아이디를 씁니다.', '역할: 제작자(owner) · 관리자(admin) · 사용자(user) — 가입 승인·차단·계정 기한은 모든 프로그램에 함께, 사용 여부·기한·관리 범위는 프로그램마다 따로'],
        tbl: { head: ['프로그램', '코드', '권한 관리'], w: [5000, 1300, 3338], rows: PROGS } },
      { h: '로그인 서버 설정 (auth-config.json)', text: ['저장소의 auth-config.json 이 로그인 서버를 가리킵니다. 앱은 이 파일을 GitHub에서 읽으므로 고치면 다음 실행부터 반영됩니다.'], tbl: { head: ['항목', '값 · 설명'], w: [2400, 7238], rows: [['enabled', 'true = 로그인 사용 / false = 로그인 없이 사용'], ['supabaseUrl', '근태관리 Supabase 프로젝트 주소'], ['supabaseAnonKey', 'publishable(anon) 키 — 공개돼도 되는 키']] }, tip: 'secret · service_role 키는 절대 저장소·앱에 넣지 마세요. 비밀번호는 서버에 암호화되어 저장되며 제작자도 볼 수 없습니다.' },
      { h: '관리자 페이지 열기', shot: 'login', cap: '제작자·관리자 계정으로 로그인', text: ['제작자·관리자 계정으로 로그인 → 상단 「내 계정」 카드 → 관리자 페이지'], tbl: { head: ['탭', '하는 일'], w: [2400, 7238], rows: [['👥 사용자', '가입 승인 · 접속 차단/해제 · 계정 사용기한 · 임시 비밀번호 · 강제 로그아웃 · 관리자 지정(제작자만) · 계정 삭제'], ['🕘 접속기록', '로그인·로그아웃·실패·차단 기록(시간·기기·IP)'], ['💻 기기', '사용자별 기기 목록, 기기 차단'], ['📝 관리작업', '관리자가 한 작업 기록'], ['⚙️ 앱 설정', '가입 신청 받기 · 승인 필요 · 기본 사용기간 · 앱 전체 잠금(점검 모드)'], ['🔐 프로그램별 권한', '사용자 × 프로그램 권한 표 — 「업무표준화」 열 포함']] } },
      { h: '새 직원 승인 절차', steps: ['직원이 앱에서 「가입 신청」(이메일·성명·소속)', '관리자 페이지 › 👥 사용자 › 승인 대기 → 승인(필요하면 계정 사용기한)', '🔐 프로그램별 권한 › 그 직원 행 「업무표준화」 칸 → 「사용」 지정', '직원에게 「다시 확인」 또는 다시 실행 안내'], tip: '퇴사자는 「접속 차단」(기록 보존) 또는 「계정 삭제」. 분실 기기는 💻 기기에서 차단 + 강제 로그아웃.' },
      { h: '🔐 프로그램별 권한', shot: 'perm', cap: '관리자 페이지 › 프로그램별 권한', steps: ['칸을 누르면 설정 창: 사용 / 사용 안 함', '이 프로그램 사용기한(비우면 계정 기한만 적용)', '관리 범위 — 담당 지사 체크(모두 비우면 전체 지사)', '저장 → 관리작업 기록에 남음'], text: ['업무표준화 프로그램: 관리 범위 지사의 사업장만 ① 사업장 목록·지도에 표시', '제작자·관리자 행은 「전체」로 표시(모든 프로그램 사용)'] },
      { h: '권한 없을 때 사용자 화면', shot: 'lock', cap: '사용 권한 없음 화면', text: ['권한이 없거나 프로그램 사용기한이 지나면 잠금 화면이 나옵니다.', '사용자는 「다시 확인」으로 권한 지정 후 바로 사용, 「다른 계정으로 로그인」으로 계정 전환'] },
      { h: '서버 SQL', text: ['Supabase › SQL Editor 에서 실행합니다. 모두 다시 실행해도 안전합니다.'], tbl: { head: ['파일', '내용', '상태'], w: [3600, 3800, 2238], rows: [['supabase_setup.sql (근태관리 저장소)', '로그인 · 승인 · 기록 · 동기화 기본 구조', '실행됨'], ['supabase_app_access.sql (Complaint 저장소 server)', '프로그램별 권한 표 · app_check · 관리자 함수', '실행됨'], ['supabase_app_access_stos.sql (이 저장소 server)', '「업무표준화」(stos) 열 추가 — 권한 표 check 제약 갱신', '1회 실행 필요']] }, tip: '실행 전에는 승인된 사용자 모두 이 프로그램을 쓸 수 있습니다(제작자·관리자에게 안내 배너 표시).' },
      { h: '배포 · 업데이트', text: [`GitHub 저장소 ${APP.repo.replace('https://github.com/', '')} 에 파일을 올리면 웹과 앱이 자동으로 갱신됩니다.`], steps: ['src/ 원본을 고친 뒤 python3 build.py → index.html 생성', 'index.html · version.json · releases/버전.html 을 올림', 'GitHub Actions 「Android APK」가 약 5분 뒤 APK를 releases 폴더와 릴리스(v버전 · app-latest)에 올림', 'GitHub Pages(Settings › Pages › main / root)가 웹 주소 갱신 — 영상 QR도 이 주소를 씀'],
        tbl: { head: ['폴더 · 파일', '내용'], w: [3300, 6338], rows: [['index.html', '프로그램 전체(한 파일)'], ['src/', 'app.js · ui.js · kb.js(표준·법령) · man_kb.js(매뉴얼·상황·판례·서식) · man.js(매뉴얼 출력) · data.js(연계) · sites.js · hf.js'], ['media/', 'main(직종 소개 영상) · videos·posters(PPT 영상·대표 장면) · cases(Complaint 사례 영상)'], ['icons/ · manifest.webmanifest', '앱 아이콘 · PC/휴대폰 설치 정보'], ['android-keystore/', 'APK 서명키 — 바꾸면 덮어쓰기 설치 불가'], ['docs/', '사용자 매뉴얼 · 제작자 관리 매뉴얼(Word·PPT)'], ['tools/', '연계 데이터 추출 · 아이콘 원본 · 매뉴얼 생성기']] } },
      { h: '데이터 · 자료 고치기', text: ['자료는 src 원본을 고쳐 build.py 로 다시 만듭니다.'], tbl: { head: ['고칠 것', '파일 · 위치'], w: [3300, 6338], rows: [['업무표준(대·중·소)·직종·산업·법령', 'src/kb.js — STD · JOB · IND · LAWS · PACK'], ['업무매뉴얼 장·절·계층', 'src/man_kb.js — MAN · MAN_LEVEL · MAN_PACK'], ['사건사고 상황별 대처', 'src/man_kb.js — SCN (상황·대처·금지·보고·법령·사진·영상)'], ['판례·행정해석', 'src/man_kb.js — CASES'], ['Complaint 사례 영상', 'src/man_kb.js — BAD · media/cases/'], ['업무 서식', 'src/man_kb.js — FORMS (열 이름·너비·보존 기간)'], ['근무조 코드 · 업무 분류', 'src/data.js — tools/wbe_extract.js 로 근태관리·WBE에서 다시 추출'], ['사업장 151곳', 'src/sites.js (사업장 지도 프로그램 자료)'], ['아이콘', 'tools/icon-source-*.png → icons/ (앱·헤더·표지)'], ['메인 화면 영상', 'media/main · src/ui.js VCASES']] }, tip: '법령 요약은 실무 참고용입니다. 개정이 있으면 kb.js LAWS를 고치고 원문으로 확인하세요.' },
      { h: '버전 관리', tbl: { head: ['위치', '바꿀 값'], w: [3300, 6338], rows: [['src/app.js APP.version', `프로그램 표시 버전 (현재 ${V})`], ['version.json', '버전 · 날짜 · 변경 내용 · 파일 이름'], ['package.json', 'APK 버전'], ['sw.js', '오프라인 캐시 이름(stos-v…) — 바꿔야 새 버전 반영'], ['README.md', '변경 이력']] } },
      { h: '점검 체크리스트', steps: ['👥 사용자: 승인 대기 · 퇴사자 차단 · 기한 만료 정리 (월 1회)', '🔐 프로그램별 권한: 지사 이동자 관리 범위 변경', 'GitHub Actions 성공 여부 · 최신 APK 설치 확인', '법령·최저임금·요율 개정 반영(매년 1월)', '사업장 목록 갱신(사업장 지도 프로그램과 동일하게)'] }
    ]
  };
  async function docOf(G) {
    const ch = [], AC = docx.AlignmentType.CENTER;
    ch.push(P([R(`에스텍 그룹 · ${G.key === 'user' ? '사용자용' : '제작자 · 관리자용'}`, { size: 18, bold: true, color: C.green })], { align: docx.AlignmentType.RIGHT, after: 60 }));
    ch.push(P([R(APP.name, { size: 24, bold: true, color: C.gray })], { align: AC, before: 120, after: 40 }));
    ch.push(P([R(G.title, { size: 48, bold: true, color: C.navy })], { align: AC, after: 60, line: 480 }));
    ch.push(P([R(G.sub, { size: 19, color: C.gray })], { align: AC, after: 120 }));
    ch.push(new docx.Paragraph({ alignment: AC, children: [new docx.ImageRun({ type: 'png', data: b64ToU8(dataUrlB64(ASSET.osi)), transformation: { width: 150, height: 150 } })] }));
    ch.push(boxPara([P([R('□ 목차', { size: 22, bold: true, color: C.greenD })], { after: 60 })].concat(G.secs.map((s, i) => P([R(`${i + 1}. ${s.h}`, { size: 19 })], { indent: { left: 240 }, after: 10 })))));
    G.secs.forEach((s, i) => {
      ch.push(H1(`${i + 1}. ${s.h}`));
      (s.text || []).forEach(t => ch.push(P([R(t, { size: 20 })], { after: 60 })));
      if (s.shot && shot(s.shot)) ch.push(...imgPara(shot(s.shot).src, Math.min(['mobile', 'lock', 'mgr', 'qr', 'login'].includes(s.shot) ? 3.2 : 6.2, 5.6 * shot(s.shot).w / shot(s.shot).h), '▲ ' + (s.cap || ''), [shot(s.shot).w, shot(s.shot).h]));
      if (s.steps) { ch.push(P([R('▶ 순서', { size: 20, bold: true, color: C.green })], { before: 60, after: 40, keepNext: true })); s.steps.forEach((t, k) => ch.push(P([R(`${k + 1}. `, { bold: true, color: C.navy, size: 20 }), R(t, { size: 20 })], { indent: { left: 360, hanging: 260 }, after: 30 }))); }
      if (s.tbl) ch.push(table([s.tbl.head.map((h, k) => th(h, s.tbl.w[k]))].concat(s.tbl.rows.map(r => r.map((c, k) => td(c, s.tbl.w[k], { size: 17, bold: k === 0, color: k === 0 ? C.navy : undefined })))), s.tbl.w, { header: true }));
      (s.imgs || []).forEach(([k, cap]) => { if (shot(k)) ch.push(...imgPara(shot(k).src, Math.min(shot(k).w > shot(k).h ? 5.6 : 3.4, 6.0 * shot(k).w / shot(k).h), '▲ ' + cap, [shot(k).w, shot(k).h])); });
      if (s.tip) ch.push(boxPara([P([R('💡 ', { size: 19 }), R(s.tip, { size: 18 })], { after: 0 })], 'FFF8E6', 'E0A100'));
    });
    ch.push(P([R('- 끝 -', { size: 20, bold: true })], { align: AC, before: 200, after: 80 }));
    ch.push(P([R(`${APP.name} ${V} · Designed & Developed by Rat Rae Choi`, { size: 15, color: '8A93A3' })], { align: AC }));
    return await packDocx(ch, G.title);
  }
  function deckOf(G) {
    const p = { f: { client: '', mode: 'internal' }, title: G.title, J: JOB.sec };
    const S = []; let no = 1;
    S.push(coverSlide({ eyebrow: `에스텍 그룹 · ${G.key === 'user' ? '사용자용' : '제작자 · 관리자용'} · ${V}`, title: G.title, lines: [APP.name, '업무표준화 · 매뉴얼 제작 시스템'], meta: `${D}   |   ${G.sub}`, badge: G.key === 'user' ? '사용자 매뉴얼' : '제작자 매뉴얼', badgeColor: C.green, fig: G.key === 'user' ? 'team_dio' : 'mgr' })); no++;
    const foot = `${APP.org} · ${APP.name} ${G.title}`;
    { const o = frame('목차', 'CONTENTS', no, p, foot), half = Math.ceil(G.secs.length / 2);
      G.secs.forEach((s, i) => { const col = i < half ? 0 : 1, row = col ? i - half : i, x = 0.9 + col * 6.1, y = 1.65 + row * (4.8 / half);
        o.push(Rc(x, y, 0.62, 0.42, i % 2 ? K.tint : K.tintG, { k: 'para' })); o.push(T(x, y, 0.62, 0.42, String(i + 1).padStart(2, '0'), { pt: 13, bold: true, color: i % 2 ? K.navy : C.green, align: 'center', valign: 'middle' }));
        o.push(T(x + 0.8, y, 5.1, 0.42, [{ text: s.h, bold: true }], { max: 14, min: 9, valign: 'middle' })); });
      S.push(o); no++; }
    G.secs.forEach((s, i) => {
      const o = frame(`${String(i + 1).padStart(2, '0')}  ${s.h}`, G.title, no, p, foot);
      const img = s.shot && shot(s.shot) ? shot(s.shot) : (s.imgs && s.imgs.length && shot(s.imgs[0][0]) ? shot(s.imgs[0][0]) : null);
      const paras = [];
      (s.text || []).forEach(t => paras.push({ text: t, gap: 5 }));
      if (s.steps) { paras.push({ text: '순서', bold: true, color: C.green, gap: 2 }); s.steps.forEach((t, k) => paras.push({ text: `${k + 1}.  ${t}`, gap: 4 })); }
      if (s.tbl && !img) s.tbl.rows.slice(0, 14).forEach(r => paras.push({ text: `■ ${r[0]}  —  ${r.slice(1).join(' · ')}`, gap: 3 }));
      else if (s.tbl) s.tbl.rows.slice(0, 8).forEach(r => paras.push({ text: `■ ${r[0]}: ${r.slice(1).join(' · ')}`, size: 0.9, gap: 2 }));
      if (s.tip) paras.push({ text: '💡 ' + s.tip, color: '8A5A00', gap: 2 });
      if (img) {
        const portrait = img.h > img.w * 0.9, bw = portrait ? 3.6 : 7.0, bh = portrait ? 4.8 : 4.8;
        const sc = Math.min(bw / img.w, bh / img.h), iw = img.w * sc, ih = img.h * sc;
        o.push(Rc(0.6, 1.6, bw + 0.2, 4.95, 'F3F5F8', { line: K.line })); o.push(Im(0.7 + (bw - iw) / 2, 1.68 + (4.8 - ih) / 2, iw, ih, img.src));
        const tx = 0.6 + bw + 0.45, tw = SW - tx - 0.55;
        o.push(Rc(tx, 1.6, tw, 4.95, C.white, { line: K.line })); o.push(Rc(tx, 1.6, tw, 0.06, C.green));
        o.push(T(tx + 0.2, 1.75, tw - 0.35, 4.7, paras.length ? paras : [{ text: s.cap || '' }], { max: 15, min: 8 }));
      } else { o.push(Rc(0.6, 1.6, 12.15, 4.95, C.white, { line: K.line })); o.push(Rc(0.6, 1.6, 12.15, 0.06, C.green)); o.push(T(0.85, 1.75, 11.7, 4.7, paras, { max: 15, min: 8 })); }
      S.push(o); no++;
      (s.imgs || []).slice(img === (s.shot && shot(s.shot)) ? 0 : 1).forEach(([k, cap]) => { const im = shot(k); if (!im) return;
        const o2 = frame(`${String(i + 1).padStart(2, '0')}  ${s.h}`, cap, no, p, foot), sc = Math.min(12.1 / im.w, 4.95 / im.h);
        o2.push(Rc(0.6, 1.6, 12.15, 5.0, 'F3F5F8')); o2.push(Im(0.6 + (12.15 - im.w * sc) / 2, 1.62 + (4.95 - im.h * sc) / 2, im.w * sc, im.h * sc, im.src)); S.push(o2); no++; });
    });
    S.push(closingSlide({ fig: 'team', tag: '표준으로 일하고, 매뉴얼로 가르치고, 기록으로 증명합니다.', org: `${APP.org} · ${APP.name} ${V}` }));
    return S;
  }
  const b64 = async blob => { const u8 = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const out = {};
  for (const G of [USER, MAKER]) {
    out[G.file + '.docx'] = await b64(await docOf(G));
    out[G.file + '.pptx'] = await b64(await makePptx({ f: { client: '' }, title: G.title }, deckOf(G), `${APP.name} ${G.title}`));
  }
  return out;
};
