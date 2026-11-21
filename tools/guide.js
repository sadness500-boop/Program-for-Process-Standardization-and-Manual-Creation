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
      { h: '로그인 · 가입 신청', shot: 'login', cap: '로그인 화면', text: ['에스텍 통합 로그인(SSO) — 메인 프로그램 「S-Tec Operations」과 근태관리·Complaint·견적 등 7개 프로그램을 하나의 아이디로 씁니다. 한 기기에서 한 번 로그인하면 다른 프로그램도 다시 로그인하지 않고 열립니다.'], steps: ['처음이면 「가입 신청」(이메일·성명·소속) → 제작자·관리자 승인 후 사용', '로그인 시 「이 기기 이름」을 적으면 접속기록에 남습니다', '처음 쓰는 기기는 「📲 새 기기 승인 대기」가 나옵니다 — 제작자가 승인하면 「다시 확인」', '비밀번호를 잊으면 「비밀번호를 잊었어요」 → 관리자가 임시 비밀번호 발급'] },
      { h: '화면 구성', shot: 'main', cap: '① 사업장 → ② 항목 → ③ 작성 정보 → ④ 검토·출력', tbl: { head: ['영역', '하는 일'], w: [2400, 7238], rows: [['상단 밴드', '앱 아이콘 · 프로그램 이름(2줄) · 버전, 업무표준 담당 · 다운로드 QR · 친구 추천 · 내 계정 · 주간/야간/시스템'], ['① 적용 사업장 선정', '에스텍베스트 사업장 151곳(지사별, 통합관리 공통 기준정보에 새로 등록된 사업장 자동 반영) · 검색 · 직접 입력 · 전사 공통'], ['② 항목 선택', '📋 업무표준서 / 📘 업무매뉴얼 전환 · 대·중·소 분류 · 검색'], ['③ 작성 정보', '직종 · 매뉴얼 계층 · 산업 · 근무조 코드 · 문서명 · 결재 · 특이사항 · 문서 용도'], ['④ 검토 · 출력', 'Word · PPT · PDF(PPT 내용) 3종 · 📝 업무 서식 · 📦 사업장 자료 패키지'], ['₩ 견적 연동 (왼쪽 위)', '견적 3종·엑셀/PDF 견적서·직접 입력 → 인력 운영 기준'], ['📎 RFP 불러오기 (③ 위)', '제안요청서·과업지시서 → 과업 요구사항 대응표'], ['🏠 메인 (왼쪽 아래)', '통합관리 시스템 「S-Tec Operations」 메인 화면으로 이동']] } },
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
      { h: '🧭 세부 작업표준(SOP)', text: [`직종별 세부 작업표준 ${Object.values(SOP).reduce((a, J) => a + J.areas.reduce((b, A) => b + A.tasks.length, 0), 0)}건 — 업무표준서 「T. 세부 작업표준」, 업무매뉴얼 「직무 상세 작업표준」 장에 자동으로 들어갑니다.`, '작업 1건마다 주기·소요시간·담당·도구·약품(희석비율)·보호구·단계별 동작과 요령·완료 기준·금지 사항·기록 양식을 적어, OJT 없이도 문서만 보고 일할 수 있게 했습니다.'],
        tbl: { head: ['직종', '구역 · 작업 수'], w: [2400, 7238], rows: JOB_ORDER.filter(j => SOP[j]).map(j => [JOB[j].n, SOP[j].areas.map(A => `${A.n}(${A.tasks.length})`).join(' · ')]) }, tip: '작업 목록 줄을 지우면 그 작업은 출력에서 빠집니다. 미화는 에스텍 미화 종합 매뉴얼·약품 희석비율·품질평가 체크리스트를 기준으로 합니다.' },
      { h: '🎬 영상 재생', shot: 'outbtns', cap: '④ 출력 버튼 — Word · PPT · PDF 3종', steps: ['PPT는 현장 영상이 슬라이드 안에 들어가 누르면 재생됩니다', 'PDF는 PPT 내용을 그대로 PDF로 만든 것이며, 영상 장면을 누르면 웹에서 재생됩니다', 'Word는 영상 장면 옆 QR을 휴대폰으로 비추면 재생됩니다'], tip: '글씨는 본문 최소 11pt·진한 색으로 바꿔 시인성을 높였습니다.' },
      { h: '🆘 비상대처 매뉴얼', text: [`업무매뉴얼에 「비상대처 매뉴얼」 장이 추가되었습니다 — 에스텍 비상대처 매뉴얼 원문 ${typeof EMG !== 'undefined' ? EMG.length : 11}개 장(사건사고·천재지변·집단민원·화재·소란난동·침입이상·응급환자·가스누출·보안사건·매스컴·대테러)을 순서대로 수록합니다.`, '원문에서 그림으로만 있던 항목(화재의 기본이론·소화 방법·화재 종류 등)은 표준 내용으로 보충해 초록 글씨로 표시합니다.'], tbl: { head: ['장', '주요 내용'], w: [2600, 7038], rows: (typeof EMG !== 'undefined' ? EMG : []).map(c => [c.t, c.items.filter(x => x[0] === 'p' && /^[0-9]+\s*\./.test(x[1])).map(x => x[1].replace(/^[0-9]+\s*\.\s*/, '')).slice(0, 8).join(' · ')]) } },
      { h: '📦 사업장 자료 패키지', steps: ['①에서 사업장, ③에서 직종을 고릅니다', '④ 출력의 「📦 사업장 자료 패키지 (ZIP)」를 누릅니다', 'ZIP을 풀면 「00. 서류 종합 LIST」와 번호순 서류 36~52종(Word·Excel)이 들어 있습니다 — 사업장명·소속·소재지·직종·작성자가 미리 적혀 있습니다'],
        tbl: { head: ['분류', '들어가는 서류'], w: [2400, 7238], rows: [['인사 · 채용', '관리감독자 지정서 · 구인 공고 의뢰서 · 면접 평가표(관리자·신입) · 근로계약서 · 휴가원'], ['인수 · 편성', '인수품목리스트 · 사업장 인수 액션플랜(D-30~D+30) · 근무 편성표(근무조 코드)'], ['교육', '연간 교육계획 · 산업안전보건교육 자료 12개월·일지 · 성희롱 예방 · 개인정보 · 장애인 인식개선'], ['계획 · 일지 · 보고', '현장 책임자 일일 업무계획표 · 연간/일상/월간(보고·게시) 계획 · 요일별 중점 · 업무일지 · 월 실적 및 계획(작성 예시) · 사건사고 보고서'], ['품질 · 재고', '품질평가 체크리스트(자동 합계) · 구매 요청서(코드 입력 시 품명 자동) · 입·출고 현황 · 재고종합현황(자동 계산) · 장비이력카드 · 화장실 점검표 · 지원 요청서'], ['약품 · 게시물(미화·방역)', '용품·약품 규격서 · 약품별 성분 · 특수건강진단 대상 유해물질 · 희석비율 게시표 · MSDS 경고표지 14종 · 네임텍 · 색상 구분표 · 중량물 취급주의 · 작업표준 게시물'], ['직종 대장', '직종별 업무 서식을 Excel 대장으로 + 업무 서식집(Word)']] } },
      { h: '₩ 견적 연동', shot: 'est', cap: '견적 연동 칸 (제안서 제작시스템과 같은 구성)', steps: ['용역인력 견적 · 업무량 기반 산정 · 단기인력 견적에서 「📑 제안서로 보내기」를 누르면 왼쪽 「견적 연동」 목록에 들어옵니다', '탭(전체·용역인력·업무량·단기·직접/엑셀/파일)으로 나눠 보고, 반영할 견적을 체크합니다(여러 건 합산)', '체크하면 사업장·직종·근무형태(근무조 코드)가 자동으로 맞춰집니다 — 「⤵ 작성 정보에 반영」으로 다시 반영', '「📊 엑셀 견적서 불러오기」(.xlsx·.xls·.csv·PDF)나 끌어다 놓기로 엑셀 견적서·원가분석표를 읽습니다', '「✍ 직접 입력」으로 직종·직책·인원·근무형태·단가를 넣거나 「📂 연동 파일」(.json)을 불러올 수 있습니다'], tip: '체크한 견적은 업무표준서·업무매뉴얼에 「인력 운영 기준(견적 연동)」(직종·인원·근무형태 지표, 사내용은 금액·원가 구성 포함)으로 출력됩니다.' },
      { h: '📎 RFP · 과업지시서 · 공고문 불러오기', shot: 'rfp', cap: '요구사항 분석 결과', steps: ['③ 맨 위 「📎 제안요청서(RFP)·과업지시서·공고문 불러오기」에 PDF·Word·한글(HWPX)·메일(.eml)·사진을 끌어다 놓거나 「📂 파일 선택」', '글자를 읽어 아래 칸에 넣고 「🔎 요구사항 분석」으로 요구사항을 14개 구분(인력·근무형태·업무 범위·교육·안전·법규·품질·장비·고용승계·인수인계·보험·가격·제출서류·비상)으로 나눕니다', '「↧ 작성 정보에 반영」 → 고객사·산업·직종·특이사항, 「★ 관련 표준 항목 선택」 → 요구사항과 관련된 표준·매뉴얼 장을 자동 선택'], tip: '분석한 요구사항은 출력물에 「과업 요구사항 대응표」(요구사항 · 관련 표준/매뉴얼 · 이행 방법)로 들어갑니다. 사진·스캔 PDF는 글자 인식(OCR)으로 읽어 시간이 조금 걸립니다.' },
      { h: '업무표준서 출력물', imgs: [['outS1', 'Word 업무표준서 표지 — 결재란 · 주요 내용'], ['slS1', 'PPT 표준 항목 슬라이드 — 절차 카드 · 점검 항목 · KPI']], text: ['Word: 결재란 · 제·개정 이력 · 총칙 · 사업장 개요 · 항목 체계 · 세부 기준(연계 표) · 법적 근거 · 이행 점검표 · 교육 확인서'] },
      { h: '업무 서식 목록', text: [`④ 출력의 [📝 업무 서식 Word] 버튼을 누르면 고른 사업장·직종에 맞는 서식만 모은 「업무 서식집」 Word가 따로 만들어집니다(총 ${FORMS.length}종 중 직종별 13~19종).`, '보안은 보안 서식, 주차는 주차 서식, 시설은 시설 서식, 미화는 미화 서식, 안내·조리·소독방역은 기타 업종 서식 + 공통·안전 서식이 들어갑니다.', '사업장명·소속 지사·소재지·직종·근무형태가 미리 적혀 있고, 한 쪽에 한 서식씩 결재란(담당·현장대리인·지사장)과 함께 인쇄됩니다. 바닥글 서명에는 날짜가 들어가지 않습니다.'], tbl: { head: ['서식번호', '서식명', '직종', '보존 기간'], w: [1400, 3600, 2600, 2038], rows: formRows } },
      { h: '출력 기록', shot: 'hist', cap: '최근 출력 기록', steps: ['출력하면 기록이 남고 누르면 그대로 불러옵니다', '체크 후 「선택 삭제」·「전체 삭제」', '로그인하면 다른 기기와 기록이 동기화됩니다'] },
      { h: '휴대폰에서 사용', shot: 'mobile', cap: '휴대폰 화면', steps: ['화면이 한 줄로 바뀌고 순서대로 내려가며 작성', '출력 파일은 휴대폰 다운로드 폴더에 저장', 'PPT 영상은 PC 파워포인트에서 재생하는 것을 권장'] },
      { h: '자주 묻는 질문', tbl: { head: ['질문', '답'], w: [3300, 6338], rows: [['프로그램이 잠겨 있어요', '상단 「업무표준 담당」을 지정해야 열립니다. 로그인 후 잠기면 제작자에게 「프로그램별 권한」을 요청하세요.'], ['사업장이 안 보여요', '관리 범위(담당 지사)가 지정된 계정입니다. 제작자에게 범위 변경을 요청하세요.'], ['영상 QR이 안 열려요', '웹 주소(GitHub Pages)가 켜져 있어야 합니다. 제작자에게 문의하세요.'], ['표준시간·인원이 실제와 달라요', '업무량은 WBE 사업장 유형 기본규모 기준입니다. 실측값은 업무량 산정 프로그램에서 다시 산정하세요.'], ['「🔒 조회 전용」 띠가 나와요', '제작자가 이 기기를 조회 전용으로 지정했습니다. 보기만 되고 저장·삭제 버튼은 잠깁니다.'], ['개별 앱에 병행 안내가 나와요', '개별 앱은 2026-12-18까지 함께 쓰고, 그 뒤에는 통합 앱 「S-Tec Operations」으로 옮깁니다. 아이디·비밀번호는 그대로입니다.'], ['법령이 바뀌었어요', '법령 요약은 실무 참고용입니다. 원문을 확인하고 제작자에게 개정을 요청하세요.']] } }
    ]
  };
  /* 제작자 관리 사용매뉴얼은 공개 저장소에 두지 않습니다 — 서버의 제작자 전용 보관함(owner-docs/stos)에만 보관합니다 */
  const MAKER = null;
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
  for (const G of [USER, MAKER].filter(Boolean)) {
    out[G.file + '.docx'] = await b64(await docOf(G));
    out[G.file + '.pptx'] = await b64(await makePptx({ f: { client: '' }, title: G.title }, deckOf(G), `${APP.name} ${G.title}`));
  }
  return out;
};
