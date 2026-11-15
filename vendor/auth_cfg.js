
/* 제작자 관리(로그인) 설정 — Attendance Management Software와 같은 모듈 · Designed & Developed by Rat Rae Choi */
window.AUTH_APP_CONFIG = {
  name: 'S-Tec Complaint Response System',
  sub: '고객사 Complaint 대응 프로그램 · 로그인',
  dataLabel: 'Complaint 출력 기록',
  prefix: 'stcr',
  globalName: 'STCR_AUTH',
  webUrl: 'https://sadness500-boop.github.io/S-Tec-Complaint-Response-System/',
  cfgRaw: 'https://raw.githubusercontent.com/sadness500-boop/S-Tec-Complaint-Response-System/main/auth-config.json',
  hooks: [['storeHistory','stcr_hist'], ['saveUI','stcr_ui']],
  keepKeys: ['stcr_ui']
};
