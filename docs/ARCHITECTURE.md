# 架構文件

## 目錄結構

```
stevenperformance/
├── index.html               # 唯一 HTML 入口，掛載 #root，載入 /src/main.jsx
├── vite.config.js           # Vite 設定，僅啟用 @vitejs/plugin-react
├── .oxlintrc.json           # oxlint 規則設定（react plugin）
├── .env                     # 環境變數（不提交 git）
├── .env.example             # 環境變數範本
└── src/
    ├── main.jsx             # 應用程式進入點：GoogleOAuthProvider + BrowserRouter + App
    ├── index.css            # 全域樣式：Design Token、排版、深色模式
    ├── App.jsx              # 路由設定（react-router-dom）
    ├── App.css              # 全域元件樣式
    ├── contexts/
    │   └── AuthContext.jsx  # 登入狀態、角色、指派問卷全域管理
    ├── utils/
    │   ├── sheetsApi.js     # Google Sheets REST API 統一封裝
    │   └── scoreCalculator.js  # 加權分數換算工具
    └── components/
        ├── auth/
        │   ├── LoginPage.jsx        # Google 登入頁
        │   └── UnauthorizedPage.jsx # 未授權提示頁
        ├── layout/
        │   ├── Header.jsx           # 頂部導覽列（登出按鈕、角色標示）
        │   └── ProtectedRoute.jsx   # 路由權限守衛
        ├── frontend/
        │   ├── SurveyList.jsx       # 使用者指派問卷清單
        │   ├── SurveyForm.jsx       # 問卷填寫主頁面
        │   ├── ScoreSlider.jsx      # 1-20 拖移滑桿 + 量化說明
        │   ├── SurveyPreview.jsx    # 送出前預覽確認
        │   └── MyResults.jsx        # 我的填寫紀錄
        └── backend/
            ├── AllSubmissions.jsx   # 所有已提交問卷（主管以上）
            ├── ScoreResults.jsx     # 分數計算結果 + PDF 下載（主管以上）
            └── EditSubmission.jsx   # 編輯已提交問卷（管理員限定）
```

> `public/` 下的檔案以根路徑 `/` 直接提供（不經 Vite 打包）；`src/assets/` 下的檔案由 Vite import 後加 hash 打包進 `dist/`。

---

## 啟動流程

```
瀏覽器請求
  └─▶ index.html
        └─▶ <div id="root"> + <script type="module" src="/src/main.jsx">
              └─▶ src/main.jsx
                    ├─ import './index.css'
                    └─ <GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID}>
                         <BrowserRouter>
                           <AuthProvider>
                             <App />          ← 路由定義
                           </AuthProvider>
                         </BrowserRouter>
                       </GoogleOAuthProvider>
```

---

## 路由表

| 路徑 | 元件 | 最低角色 | 說明 |
|------|------|---------|------|
| `/login` | LoginPage | — | Google 登入頁 |
| `/unauthorized` | UnauthorizedPage | — | 未獲授權提示 |
| `/` | → redirect `/surveys` | 一般 | 根路徑自動跳轉 |
| `/surveys` | SurveyList | 一般 | 指派問卷清單 |
| `/surveys/:surveyId` | SurveyForm | 一般 | 填寫指定問卷 |
| `/my-results` | MyResults | 一般 | 我的填寫紀錄 |
| `/admin/submissions` | AllSubmissions | 主管 | 所有已提交問卷 |
| `/admin/scores` | ScoreResults | 主管 | 分數計算結果 |
| `/admin/edit/:rowIndex` | EditSubmission | 管理員 | 編輯指定提交列 |

---

## Google Sheets 資料來源

本專案以 Google Sheets 作為資料庫，透過 Google Sheets REST API 直接從瀏覽器讀寫，**不使用任何後端或 GAS**。

### 工作表結構

| 工作表名稱 | 用途 | 主要欄位 |
|-----------|------|---------|
| `users` | 使用者帳號、角色、指派問卷 | 帳號、權限、問卷1、問卷2 |
| `問卷清單` | 問卷代號、名稱、分數佔比 | 序號、名稱、分數佔比 |
| `問卷問題` | 各問卷的題目與量化代號 | 問卷編號、問題編號、問題、1-5分、6-10分、11-15分、16-20分 |
| `量化項目` | 量化說明文字 | 代號、內文 |
| `角色管理` | 各角色可進行的操作 | 操作內容、管理員、主管、一般 |
| `問題收集` | 所有提交的問卷答案 | 填寫日期、填寫帳號、A-1 ... D-8 |

### API 呼叫模式

```javascript
// 讀取
GET https://sheets.googleapis.com/v4/spreadsheets/{id}/values/{range}
Authorization: Bearer {access_token}

// 新增列（append）
POST https://sheets.googleapis.com/v4/spreadsheets/{id}/values/{range}:append?valueInputOption=USER_ENTERED
Authorization: Bearer {access_token}

// 更新列（overwrite）
PUT https://sheets.googleapis.com/v4/spreadsheets/{id}/values/{range}?valueInputOption=USER_ENTERED
Authorization: Bearer {access_token}
```

---

## 身分驗證與授權流程

```
1. 使用者點擊「以 Google 帳戶登入」
2. useGoogleLogin（implicit flow）→ 取得 access_token
   - scope: openid email profile https://www.googleapis.com/auth/spreadsheets
3. 以 access_token 讀取 users!A:D
4. 比對使用者 email：
   ├─ 不在名單 → redirect /unauthorized
   └─ 在名單 → 取出「權限」「問卷1」「問卷2」→ 存入 AuthContext
5. ProtectedRoute 依 minRole prop 判斷是否放行
```

角色階層：`一般(1)` < `主管(2)` < `管理員(3)`

---

## 分數計算邏輯

各問卷得分換算公式（`scoreCalculator.js`）：

```
問卷貢獻分數 = (各計分題平均分數總和 / 問卷滿分) × 佔比 × 100

問卷滿分 = 計分題數量 × 20
計分題 = 問卷問題中「1-5分」欄位不為空的題目
計分題平均 = 所有提交者該題分數的算術平均（忽略空值）

總分 = 所有問卷貢獻分數加總（0~100）
```

範例（問卷 A，佔比 40%，3 道計分題）：
- A-1 平均: 16，A-2 平均: 15，A-3 平均: 14 → 總和 45
- 問卷滿分: 3 × 20 = 60
- 問卷 A 貢獻: (45 / 60) × 40 = 30 分

---

## CSS 架構

### Design Token 系統

所有視覺基礎變數定義於 `src/index.css` 的 `:root`：

| 類別 | 變數名稱 | 淺色值 | 深色值 |
|------|---------|--------|--------|
| 文字 | `--text` | `#6b6375` | `#9ca3af` |
| 標題文字 | `--text-h` | `#08060d` | `#f3f4f6` |
| 背景 | `--bg` | `#fff` | `#16171d` |
| 卡片背景 | `--surface` | `#f9f8fc` | `#1e1f27` |
| 邊框 | `--border` | `#e5e4e7` | `#2e303a` |
| 程式碼背景 | `--code-bg` | `#f4f3ec` | `#1f2028` |
| 強調色 | `--accent` | `#aa3bff` | `#c084fc` |
| 強調背景 | `--accent-bg` | `rgba(170,59,255,0.1)` | `rgba(192,132,252,0.15)` |
| 強調邊框 | `--accent-border` | `rgba(170,59,255,0.5)` | `rgba(192,132,252,0.5)` |
| 錯誤色 | `--danger` | `#ef4444` | `#f87171` |
| 成功色 | `--success` | `#22c55e` | `#4ade80` |
| 滑桿軌道 | `--slider-track` | `#e5e4e7` | `#2e303a` |
| 社群區塊背景 | `--social-bg` | `rgba(244,243,236,0.5)` | `rgba(47,48,58,0.5)` |
| 陰影 | `--shadow` | box-shadow 淺色版 | box-shadow 深色版 |

字型變數：`--sans`、`--heading`、`--mono`

### 深色模式機制

`index.css` 使用 `@media (prefers-color-scheme: dark)` 覆寫 `:root` 內的所有 token，**不需要任何 JavaScript**。

### 響應式斷點

全專案唯一斷點：`@media (max-width: 1024px)`

---

## SVG Sprite 系統

所有 UI 圖示集中在 `public/icons.svg`，每個圖示為一個 `<symbol>`。

引用方式（JSX）：

```jsx
<svg className="icon" role="presentation" aria-hidden="true">
  <use href="/icons.svg#icon-id" />
</svg>
```

新增圖示步驟：
1. 在 `public/icons.svg` 加入新的 `<symbol id="new-icon" viewBox="...">`
2. 在 JSX 以 `<use href="/icons.svg#new-icon">` 引用
3. 若圖示為純黑色 fill，在 `index.css` 深色模式補 `filter: invert(1) brightness(2)`
