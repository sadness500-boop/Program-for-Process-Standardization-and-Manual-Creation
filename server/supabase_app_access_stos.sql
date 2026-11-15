-- =====================================================================
--  에스텍 통합 로그인 · 프로그램별 사용 권한 — 업무표준화 제작 시스템(stos) 추가
--  Designed & Developed by Rat Rae Choi
--
--  ● 어디에 실행하나요?  Attendance Management Software 가 쓰는 Supabase 프로젝트
--    → SQL Editor → 이 파일 전체를 붙여넣고 Run. 한 번만 실행하면 됩니다.
--  ● 무엇을 하나요?  관리자 페이지 「🔐 프로그램별 권한」에 「업무표준화」(stos) 열을 추가합니다.
--    (app_access 표가 아직 없다면 S-Tec-Complaint-Response-System 저장소의 server/supabase_app_access.sql 을 먼저 실행)
--  ● 다시 실행해도 안전합니다.
-- =====================================================================
alter table public.app_access drop constraint if exists app_access_app_check;
alter table public.app_access add constraint app_access_app_check
  check (app in ('stcr','stse','stso','stqs','wbe','stos'));
