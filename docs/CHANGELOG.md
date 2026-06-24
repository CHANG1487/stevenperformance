# 更新日誌

紀錄格式參考 [Keep a Changelog](https://keepachangelog.com/)。

---

## [Unreleased]

### 修正

- 修正問卷送出成功畫面「返回問卷清單」按鈕未水平置中的問題（將 `align-self: flex-start` 限縮至 `.survey-card` 作用域）
- 文字回饋區塊改為匿名顯示，移除填寫者 email，僅呈現評論內容
- 修正 PDF 多頁重複問題：修正 `addImage` Y 偏移計算，現在可正確分頁輸出完整結果
- 問卷送出後移除「重新填寫」按鈕，改為「已完成填寫」提示文字；如需修改由管理員從後台 EditSubmission 頁面操作
- 問卷評分量化說明框（`.score-description`）改為固定高度 5rem，避免各題目卡片因文字長度造成版面跳動
- 登入後卡在 `/login` 頁面：`onSuccess` 非同步區塊的 `catch` 靜默 reset 不顯示錯誤，現在改為顯示具體訊息（試算表 ID 錯誤、API 未啟用等）
- `onError` callback 現在也顯示 Google OAuth 失敗訊息（如彈出視窗被封鎖）
- 環境變數未設定時，登入頁顯示設定提示並停用登入按鈕

### 新增

- 考核表系統完整功能（Google OAuth 2.0 登入、Google Sheets API 整合）
- 身分驗證流程：Google 登入 → 比對 users 工作表 → 角色授權（管理員/主管/一般）
- 前台：指派問卷清單、問卷填寫（拖移滑桿 1-20 分 + 量化說明）、送出前預覽確認
- 前台：我的問卷填寫紀錄查閱
- 後台（主管以上）：所有已提交問卷瀏覽、加權分數計算結果
- 後台（管理員限定）：已提交問卷內容編輯
- PDF 匯出：分數結果 + 文字回饋
- React Router 多頁路由架構
- AuthContext：登入狀態、角色、指派問卷全域管理
- sheetsApi.js：Google Sheets REST API 統一封裝
- scoreCalculator.js：各問卷加權分數換算工具
- 新增 design token：`--surface`、`--danger`、`--success`、`--slider-track`
- 新增套件：`@react-oauth/google`、`react-router-dom`、`jspdf`、`html2canvas`
- 未授權使用者顯示「未獲授權」頁面
- `.env.example` 環境變數範本

---

## [0.0.0] — 初始版本

### 新增

- React 19 + Vite 8 專案初始化（`@vitejs/plugin-react` Oxc 轉譯）
- 全域 CSS Design Token 系統（`src/index.css`），支援自動深色模式
- 原生 CSS Nesting 樣式架構
- `public/icons.svg` SVG Sprite 精靈圖（bluesky、discord、documentation、github、social、x）
- Hero 視覺展示：三層圖片 3D perspective 堆疊
- Counter 互動按鈕（React `useState`）
- Next Steps 版面：Vite / React 文件連結 + 社群連結（GitHub、Discord、X、Bluesky）
- 響應式版面（1024px 斷點）
- oxlint 設定（`react/rules-of-hooks` error、`react/only-export-components` warn）
- 文件結構建立（`docs/`）
