# 功能清單

## 功能完成狀態

| 功能 | 狀態 | 說明 |
|------|------|------|
| Hero 視覺展示 | ✅ | 中央 3D logo 堆疊動畫 |
| Counter 按鈕 | ✅ | 點擊計數，React state 管理 |
| Next Steps 文件連結 | ✅ | Vite 與 React 官方文件連結 |
| Next Steps 社群連結 | ✅ | GitHub / Discord / X / Bluesky |
| 深色模式 | ✅ | 跟隨系統偏好自動切換 |
| 響應式版面 | ✅ | 1024px 斷點，行動裝置適配 |
| **Google OAuth 2.0 登入** | 🚧 | GCP Identity Services，取得 access token |
| **身分驗證 + 角色授權** | 🚧 | 比對 users 工作表，三種角色權限 |
| **前台：問卷清單** | 🚧 | 依 users 指派欄位顯示可填問卷 |
| **前台：問卷填寫** | 🚧 | 滑桿計分 + 文字回饋 + 送出前預覽 |
| **前台：我的填寫紀錄** | 🚧 | 查閱自己提交的問卷內容 |
| **後台：所有已提交問卷** | 🚧 | 主管以上可瀏覽所有提交紀錄 |
| **後台：分數計算結果** | 🚧 | 加權換算各問卷得分 + PDF 下載 |
| **後台：編輯已提交問卷** | 🚧 | 管理員可修改已提交的問卷內容 |

---

## 功能行為描述

### Hero 視覺展示

**位置**：`#center .hero`（`src/App.jsx` + `src/App.css`）

以絕對定位堆疊三層圖片模擬立體貼附效果：
- 底層：`hero.png`（170×179px，z-index 0）
- 中層：`react.svg`（React logo，absolute，top: 34px，z-index 1，3D perspective 旋轉 scale 1.4）
- 下層：`vite.svg`（Vite logo，absolute，top: 107px，z-index 0，3D perspective 旋轉 scale 0.8）

兩個 logo 皆使用 `perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)` 使其看起來貼附在 hero 圖片表面。此為純 CSS 視覺效果，無互動行為。

---

### Counter 按鈕

**位置**：`#center`（`src/App.jsx`）

- 初始值為 `0`，每次點擊 +1，無上限，無重設功能
- 狀態存在元件 local state，重整頁面後歸零

---

### Next Steps — 文件連結（#docs）

**位置**：`#next-steps #docs`（`src/App.jsx`）

Vite 官網連結 + React 官方文件連結，桌面左欄、行動版上欄。

---

### Next Steps — 社群連結（#social）

**位置**：`#next-steps #social`（`src/App.jsx`）

GitHub、Discord、X.com、Bluesky 四個外部連結，深色模式下圖示以 `filter: invert(1) brightness(2)` 顯示。

---

### 深色模式

`@media (prefers-color-scheme: dark)` 自動覆寫 `:root` 所有 CSS custom property，無需 JavaScript。

---

### 響應式版面

**唯一斷點**：`@media (max-width: 1024px)`

| 元素 | 桌面 | 行動（≤1024px）|
|------|------|-------------|
| 根字體 | 18px | 16px |
| `h1` | 56px | 36px |
| `#next-steps` | flex row（雙欄）| flex column（單欄）|
| `#spacer` | 88px | 48px |

---

### Google OAuth 2.0 登入

**位置**：`src/components/auth/LoginPage.jsx`、`src/contexts/AuthContext.jsx`

使用 `@react-oauth/google` 的 `useGoogleLogin` hook（implicit flow），請求 scope 包含 `https://www.googleapis.com/auth/spreadsheets`，讓 access token 可直接呼叫 Google Sheets API。

**行為**：
- 頁面顯示一個「以 Google 帳戶登入」按鈕
- 若 `.env` 中 `VITE_GOOGLE_CLIENT_ID` 或 `VITE_SPREADSHEET_ID` 任一未設定 → 顯示設定提示，登入按鈕 disabled
- 點擊後開啟 Google 帳號選擇器
- 登入成功取得 `access_token`，存入 sessionStorage（頁面關閉自動清除）
- 登入失敗 → 在卡片下方顯示具體錯誤訊息（`loginError` state）：
  - `403`：沒有試算表存取權限（Sheets API 未啟用或未共用試算表）
  - `404`：試算表 ID 錯誤
  - OAuth 失敗：提示彈出視窗被封鎖
- Google OAuth 錯誤（`onError`）→ 同樣顯示錯誤訊息

**所需環境變數**：`VITE_GOOGLE_CLIENT_ID`（OAuth 2.0 Web application 用戶端 ID）、`VITE_SPREADSHEET_ID`

---

### 身分驗證 + 角色授權

**位置**：`src/contexts/AuthContext.jsx`、`src/utils/sheetsApi.js`

登入成功後，以 access token 讀取 Google Sheets `users!A:D` 工作表，比對使用者 email：

- **不在名單** → redirect 至 `/unauthorized`，顯示「未獲授權」
- **在名單** → 讀取「權限」欄（管理員/主管/一般）、「問卷1」「問卷2」欄，存入 AuthContext

角色階層（數字越大權限越高）：
| 角色 | 層級 | 可存取後台功能 |
|------|------|--------------|
| 一般 | 1 | 僅前台 |
| 主管 | 2 | 前台 + 瀏覽/分數 |
| 管理員 | 3 | 前台 + 全部後台 |

`ProtectedRoute` 元件接收 `minRole` prop，不符合者 redirect `/unauthorized`。

---

### 前台：問卷清單

**位置**：`src/components/frontend/SurveyList.jsx`

**行為**：
1. 從 AuthContext 取得使用者被指派的問卷代號（如 `A`、`C`）
2. 從 `問卷清單` 工作表查對應名稱與分數佔比
3. 顯示問卷卡片清單，每張卡片可點擊進入填寫頁
4. 若使用者已提交過某問卷，顯示「已填寫」標記（對比 `問題收集` 表中的 `填寫帳號` 欄），並以靜態提示文字取代操作按鈕（一旦提交即鎖定，如需修改須由管理員於後台 EditSubmission 頁面操作）

---

### 前台：問卷填寫

**位置**：`src/components/frontend/SurveyForm.jsx`、`src/components/frontend/ScoreSlider.jsx`

**行為**：
1. 從 `問卷問題` 工作表篩出當前問卷代號（A/B/C/D）的所有題目
2. 從 `量化項目` 工作表建立代號 → 說明文字的 Map
3. 依序渲染每一題：
   - **計分題**（`1-5分` 欄位不為空）→ 顯示拖移滑桿（1-20），隨分數顯示對應量化說明
   - **文字題**（「其他意見回饋」，`1-5分` 欄位為空）→ 顯示多行文字輸入框
4. 點擊「預覽」→ 進入 `SurveyPreview` 元件，顯示所有題目與填寫內容
5. 使用者確認 → 呼叫 `appendSubmission()`，寫入一行至 `問題收集` 工作表
   - 格式：`[YYYY/MM/DD, email, A-1值, A-2值, ..., D-8值]`，未填寫的問卷欄位留空字串

**ScoreSlider 滑桿行為**：
- `<input type="range" min="1" max="20">`
- 即時顯示目前分數（如「14 分」）與所在區間（如「11-15 分」）
- 依區間查 quantitativeItems Map，顯示對應說明文字
- 區間對應邏輯：1-5 → `1-5分` 欄代號，6-10 → `6-10分` 欄代號，11-15 → `11-15分` 欄代號，16-20 → `16-20分` 欄代號
- 量化說明框固定高度（5rem），確保各問題卡片視覺高度一致，超出文字可捲動閱讀

---

### 前台：我的填寫紀錄

**位置**：`src/components/frontend/MyResults.jsx`

從 `問題收集` 工作表篩出 `填寫帳號` 等於目前使用者 email 的列，顯示每一次的提交時間與各題分數/回饋。

---

### 後台：所有已提交問卷

**位置**：`src/components/backend/AllSubmissions.jsx`

**最低權限**：主管

讀取 `問題收集` 工作表全部列，以表格形式呈現：填寫日期、填寫帳號、各問題分數/文字。可依問卷代號篩選。

---

### 後台：分數計算結果

**位置**：`src/components/backend/ScoreResults.jsx`、`src/utils/scoreCalculator.js`

**最低權限**：主管

**計算邏輯**：
1. 取得 `問題收集` 所有列
2. 對每個計分題（有量化代號的題目），取所有有效填寫值的平均
3. 依問卷計算：`(各題平均總和 / 問卷滿分) × 佔比 × 100` = 該問卷貢獻分數
4. 所有問卷貢獻分數加總 = 總分（0-100）

**展示內容**：
- 各問卷得分 + 橫條圖（CSS 進度條，`var(--accent)` 填色）
- 總分
- 各問卷「其他意見回饋」文字回饋列表（顯示填寫者與內容）

**PDF 匯出**：使用 `html2canvas` + `jspdf` 將結果頁截圖後產生 PDF 下載。

---

### 後台：編輯已提交問卷

**位置**：`src/components/backend/EditSubmission.jsx`

**最低權限**：管理員

選取已提交的問卷列，以與填寫頁相同的介面（滑桿 + 文字框）重新填寫並更新。呼叫 `updateSubmission()` 以 PUT 方式更新 Google Sheets 對應行。
