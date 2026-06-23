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

```jsx
const [count, setCount] = useState(0)
// ...
<button type="button" className="counter" onClick={() => setCount((count) => count + 1)}>
  Count is {count}
</button>
```

**行為**：
- 初始值為 `0`
- 每次點擊 +1，無上限
- 使用 functional update（`count => count + 1`）確保 stale closure 安全
- 無重設功能
- 狀態存在元件 local state，重整頁面後歸零

**樣式互動**：
- 預設：`border: 2px solid transparent`，accent 色文字與背景
- `:hover`：`border-color: var(--accent-border)`，0.3s transition
- `:focus-visible`：`outline: 2px solid var(--accent)`，offset 2px（鍵盤友善）

---

### Next Steps — 文件連結（#docs）

**位置**：`#next-steps #docs`（`src/App.jsx`）

雙欄版面的左欄（桌面）/ 上欄（行動）。包含：
- 區塊標題圖示：`documentation-icon`（`stroke="#aa3bff"`，accent 色）
- Vite 官網連結：`https://vite.dev/`，附 Vite logo，新分頁開啟
- React 官方文件連結：`https://react.dev/`，附 React logo，新分頁開啟

桌面與行動版以 `border-right`（桌面）/ `border-bottom`（行動）分隔右側社群欄。

---

### Next Steps — 社群連結（#social）

**位置**：`#next-steps #social`（`src/App.jsx`）

雙欄版面的右欄（桌面）/ 下欄（行動）。包含四個外部連結：

| 圖示 ID | 連結目標 | 備註 |
|---------|---------|------|
| `github-icon` | `https://github.com/vitejs/vite` | 純黑色 fill，深色模式需 filter |
| `discord-icon` | `https://chat.vite.dev/` | 純黑色 fill，深色模式需 filter |
| `x-icon` | `https://x.com/vite_js` | 純黑色 fill，深色模式需 filter |
| `bluesky-icon` | `https://bsky.app/profile/vite.dev` | 純黑色 fill，深色模式需 filter |

深色模式下，`#social .button-icon` 套用 `filter: invert(1) brightness(2)`（定義在 `index.css`），使黑色圖示在深色背景可見。

行動版（≤1024px）：連結卡片 flex wrap，每項佔 50% 寬度，置中對齊。

---

### 深色模式

**位置**：`src/index.css`

**機制**：`@media (prefers-color-scheme: dark)` 自動覆寫 `:root` 中所有 CSS custom property，無需任何 JavaScript 或使用者手動切換。

切換時改變的 token：`--text`、`--text-h`、`--bg`、`--border`、`--code-bg`、`--accent`、`--accent-bg`、`--accent-border`、`--social-bg`、`--shadow`。

額外規則：深色模式下 `#social .button-icon` 套用 `filter: invert(1) brightness(2)`。

---

### 響應式版面

**唯一斷點**：`@media (max-width: 1024px)`

| 元素 | 桌面 | 行動（≤1024px）|
|------|------|-------------|
| 根字體 | 18px | 16px |
| `h1` | 56px | 36px |
| `h2` | 24px | 20px |
| `#center` gap | 25px | 18px |
| `#next-steps` | flex row（雙欄）| flex column（單欄）|
| `#next-steps > div` | `padding: 32px` | `padding: 24px 20px` |
| `#docs` 分隔線 | `border-right` | `border-bottom` |
| `#spacer` | 88px | 48px |
| 社群連結 | flex row | flex wrap，兩欄 |

`.ticks` 裝飾元素（邊角三角形）在所有尺寸皆顯示，使用 CSS `::before` / `::after` pseudo-element 實作，不需任何 HTML 標記。
