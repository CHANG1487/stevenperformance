# 架構文件

## 目錄結構

```
stevenperformance/
├── index.html               # 唯一 HTML 入口，掛載 #root，載入 /src/main.jsx
├── vite.config.js           # Vite 設定，僅啟用 @vitejs/plugin-react
├── .oxlintrc.json           # oxlint 規則設定（react plugin）
└── src/
    ├── main.jsx             # 應用程式進入點，以 StrictMode 掛載 <App>
    ├── index.css            # 全域樣式：Design Token、排版、深色模式
    ├── App.jsx              # 根元件，包含全部頁面版面
    ├── App.css              # App 專屬樣式：hero 動畫、counter、版面 sections
```

> `public/` 下的檔案以根路徑 `/` 直接提供（不經 Vite 打包）；`src/assets/` 下的檔案由 Vite import 後加 hash 打包進 `dist/`。

## 啟動流程

```
瀏覽器請求
  └─▶ index.html
        └─▶ <div id="root"> + <script type="module" src="/src/main.jsx">
              └─▶ src/main.jsx
                    ├─ import './index.css'        ← 全域樣式載入
                    └─ createRoot('#root').render(
                         <StrictMode>
                           <App />              ← 唯一元件樹根
                         </StrictMode>
                       )
                         └─▶ src/App.jsx
                               └─ import './App.css'   ← 元件樣式載入
```

## 頁面版面結構

`App.jsx` 直接渲染以下結構（無 React Router，無巢狀路由）：

```
<>
  <section id="center">        ← Hero 圖片堆疊 + 標題 + Counter 按鈕
  <div class="ticks">          ← 純裝飾用的左右邊角三角形（CSS ::before/::after）
  <section id="next-steps">    ← 雙欄：#docs（文件連結）| #social（社群連結）
  <div class="ticks">          ← 同上裝飾元素
  <section id="spacer">        ← 底部固定高度留白（桌面 88px，行動 48px）
</>
```

## CSS 架構

### Design Token 系統

所有視覺基礎變數定義於 `src/index.css` 的 `:root`，分為以下類別：

| 類別 | 變數名稱 | 淺色值 | 深色值 |
|------|---------|--------|--------|
| 文字 | `--text` | `#6b6375` | `#9ca3af` |
| 標題文字 | `--text-h` | `#08060d` | `#f3f4f6` |
| 背景 | `--bg` | `#fff` | `#16171d` |
| 邊框 | `--border` | `#e5e4e7` | `#2e303a` |
| 程式碼背景 | `--code-bg` | `#f4f3ec` | `#1f2028` |
| 強調色 | `--accent` | `#aa3bff` | `#c084fc` |
| 強調背景 | `--accent-bg` | `rgba(170,59,255,0.1)` | `rgba(192,132,252,0.15)` |
| 強調邊框 | `--accent-border` | `rgba(170,59,255,0.5)` | `rgba(192,132,252,0.5)` |
| 社群區塊背景 | `--social-bg` | `rgba(244,243,236,0.5)` | `rgba(47,48,58,0.5)` |
| 陰影 | `--shadow` | box-shadow 淺色版 | box-shadow 深色版 |

字型變數：

| 變數 | 值 |
|------|----|
| `--sans` | `system-ui, 'Segoe UI', Roboto, sans-serif` |
| `--heading` | 同 `--sans` |
| `--mono` | `ui-monospace, Consolas, monospace` |

### 深色模式機制

`index.css` 使用 `@media (prefers-color-scheme: dark)` 覆寫 `:root` 內的所有 token，**不需要任何 JavaScript**。額外規則：深色模式下 `#social .button-icon` 套用 `filter: invert(1) brightness(2)` 使黑色 SVG 圖示在深色背景上顯示為白色（`documentation-icon` 與 `social-icon` 使用 `stroke="#aa3bff"` 不受影響）。

### 響應式斷點

全專案唯一斷點：`@media (max-width: 1024px)`

主要行為：
- 根字體從 18px 降為 16px
- `h1` 從 56px 降為 36px
- `#center` 減少 gap，加入 padding
- `#next-steps` 從雙欄（flex row）改為單欄（flex column），並調整邊框方向
- `#spacer` 高度從 88px 降為 48px

### CSS Nesting

專案使用**原生 CSS Nesting**（W3C 規格），Vite 8 / 現代瀏覽器原生支援，語法如：

```css
.counter {
  &:hover { border-color: var(--accent-border); }
  &:focus-visible { outline: 2px solid var(--accent); }
}

#next-steps {
  & > div { padding: 32px; }
  @media (max-width: 1024px) { flex-direction: column; }
}
```

## SVG Sprite 系統

所有 UI 圖示集中在 `public/icons.svg`，每個圖示為一個 `<symbol>`：

| Symbol ID | 用途 |
|-----------|------|
| `bluesky-icon` | Bluesky 社群連結 |
| `discord-icon` | Discord 社群連結 |
| `documentation-icon` | 文件區塊標題圖示（`stroke="#aa3bff"`，強調色） |
| `github-icon` | GitHub 連結 |
| `social-icon` | 社群區塊標題圖示（`stroke="#aa3bff"`，強調色） |
| `x-icon` | X.com 連結 |

引用方式（在 JSX 中）：

```jsx
<svg className="icon" role="presentation" aria-hidden="true">
  <use href="/icons.svg#documentation-icon" />
</svg>
```

因為 `public/` 直接提供靜態檔案，`href` 路徑從根路徑 `/` 開始，**不需要 import**。

新增圖示步驟：
1. 在 `public/icons.svg` 加入新的 `<symbol id="new-icon" viewBox="...">`
2. 在 JSX 中以 `<use href="/icons.svg#new-icon">` 引用
3. 若圖示在深色模式下為純黑色 fill，確認是否需要在 `index.css` 補 `filter` 規則

## Hero 圖片堆疊

`#center .hero` 使用絕對定位堆疊三張圖片：

| 元素 | z-index | 定位 | transform |
|------|---------|------|-----------|
| `.base`（hero.png）| 0 | relative，置中 | 無 |
| `.framework`（react.svg）| 1 | absolute，top: 34px | 3D perspective 旋轉，scale 1.4 |
| `.vite`（vite.svg）| 0 | absolute，top: 107px | 3D perspective 旋轉，scale 0.8 |

兩個 logo 使用 `perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)` 製造立體貼附效果。
