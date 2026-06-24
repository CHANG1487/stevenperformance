# 考核表系統

## User Story
作為公司員工，我希望能透過 Google 帳號登入並填寫指派給我的考核問卷，以便完成定期績效評核。
作為主管/管理員，我希望能查看所有已提交的問卷結果及加權分數，以便了解整體考核狀況。

## Spec

- Google OAuth 2.0 登入（implicit flow），取得 access_token 直接呼叫 Google Sheets API
- 登入後比對 users 工作表驗證身份，讀取角色與指派問卷
- 三種角色：一般（前台）、主管（前台+查看後台）、管理員（全部功能）
- 問卷填寫：滑桿計分（1-20）+ 量化說明即時顯示 + 文字回饋題 + 送出前預覽
- 後台分數計算：各問卷按分數佔比加權，多人填寫同問卷取平均
- 後台 PDF 下載：html2canvas + jsPDF
- 管理員可編輯已提交問卷

## Tasks
- [x] 建立目錄結構與安裝套件
- [x] sheetsApi.js — Google Sheets REST API 封裝
- [x] scoreCalculator.js — 加權分數換算
- [x] AuthContext + useAuth — OAuth 流程、角色管理
- [x] LoginPage / UnauthorizedPage
- [x] ProtectedRoute / Header
- [x] SurveyList — 前台問卷清單
- [x] SurveyForm + ScoreSlider + SurveyPreview — 問卷填寫
- [x] MyResults — 我的填寫紀錄
- [x] AllSubmissions — 後台所有問卷
- [x] ScoreResults — 分數計算 + PDF
- [x] EditSubmission — 管理員編輯
- [x] 更新 main.jsx / App.jsx / index.css / App.css
- [x] Lint clean / build success
- [x] 更新 docs/
