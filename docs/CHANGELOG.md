# 更新日誌

紀錄格式參考 [Keep a Changelog](https://keepachangelog.com/)。

---

## [Unreleased]

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
