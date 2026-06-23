# 開發規範

## CSS 開發規則

### 必須使用 Design Token

**不得使用硬編碼色碼**，所有顏色、陰影皆從 `src/index.css` 的 CSS custom properties 取用：

```css
/* 正確 */
color: var(--text-h);
background: var(--accent-bg);
border-color: var(--border);

/* 錯誤 */
color: #08060d;
background: rgba(170, 59, 255, 0.1);
```

原因：深色模式透過同一組變數名稱覆寫值，硬編碼色碼不會隨模式切換。

### CSS Nesting

使用原生 CSS Nesting，Vite 8 與目標瀏覽器皆支援，無需額外工具：

```css
.component {
  color: var(--text);

  &:hover {
    color: var(--text-h);
  }

  @media (max-width: 1024px) {
    font-size: 14px;
  }
}
```

### 響應式開發

全專案只有一個斷點 `1024px`，新樣式維持同樣規則：

```css
.new-section {
  padding: 48px 32px;

  @media (max-width: 1024px) {
    padding: 24px 20px;
  }
}
```

### 新增 Design Token

若需要新增全域變數，在 `src/index.css` 的 `:root` 與 `@media (prefers-color-scheme: dark) :root` 各新增一條：

```css
:root {
  --new-token: #value-light;
}

@media (prefers-color-scheme: dark) {
  :root {
    --new-token: #value-dark;
  }
}
```

## 新增圖示

1. 在 `public/icons.svg` 加入新的 `<symbol>`：

```xml
<symbol id="new-icon" viewBox="0 0 20 20">
  <!-- SVG paths -->
</symbol>
```

2. 在 JSX 中引用：

```jsx
<svg className="icon" role="presentation" aria-hidden="true">
  <use href="/icons.svg#new-icon" />
</svg>
```

3. 若圖示使用純黑色 `fill`（例如 `fill="#08060d"`），在 `index.css` 深色模式規則中補上 `filter: invert(1) brightness(2)`，否則深色背景下圖示不可見。

> 使用 `stroke="#aa3bff"` 的圖示（如 `documentation-icon`）不需要此處理，因為強調色在兩個模式下各有對應 token。

## 命名規則

| 類型 | 規則 | 範例 |
|------|------|------|
| React 元件 | PascalCase | `App`, `HeroSection` |
| CSS class | kebab-case | `.counter`, `.hero`, `.next-steps` |
| CSS ID | kebab-case | `#center`, `#next-steps`, `#docs`, `#social` |
| CSS custom property | `--kebab-case` | `--accent-bg`, `--text-h` |
| SVG symbol ID | `kebab-case-icon` | `bluesky-icon`, `github-icon` |
| 圖片/靜態資源 | kebab-case | `hero.png`, `icons.svg` |
| 計畫文件 | `YYYY-MM-DD-feature-name.md` | `2024-03-15-counter-reset.md` |

## 靜態資源放置規則

| 資源類型 | 位置 | 引用方式 |
|---------|------|---------|
| 圖示 Sprite | `public/icons.svg` | `href="/icons.svg#id"`（不需 import） |
| 頁面圖片、logo | `src/assets/` | `import heroImg from './assets/hero.png'` |
| 全域靜態（favicon 等）| `public/` | 直接用路徑 `/filename` |

Vite 規則：`src/assets/` 的檔案由 Vite 打包並加 hash（適合會更新的圖片），`public/` 的檔案原封不動提供（適合固定不變的資源如 SVG Sprite）。

## 環境變數

目前專案**不使用任何環境變數**。若日後有需求，Vite 的規則如下：

| 規則 | 說明 |
|------|------|
| 前綴 `VITE_` | 才會暴露給前端程式碼（`import.meta.env.VITE_XXX`） |
| 不加前綴 | 僅 Node.js 端（vite.config.js）可讀，前端不可見 |
| 檔案 `.env` | 所有環境共用 |
| 檔案 `.env.local` | 本地覆寫，不應提交 git |
| 檔案 `.env.production` | 僅 `npm run build` 時生效 |

## 新增 React 元件

目前所有 UI 集中在 `src/App.jsx`。若日後拆分：

1. 在 `src/components/` 建立 `ComponentName.jsx`（未來規劃目錄，目前尚不存在）
2. 若有元件專屬樣式，建立同名 `ComponentName.css` 並在元件中 import
3. 遵守 oxlint 規則：Hooks 只能在元件頂層呼叫（`react/rules-of-hooks`），export 元件不夾帶非元件常數（`react/only-export-components`）

## 計畫歸檔流程

### 計畫文件命名

```
docs/plans/YYYY-MM-DD-<feature-name>.md
```

範例：`docs/plans/2024-03-15-dark-mode-toggle.md`

### 計畫文件結構

```markdown
# [功能名稱]

## User Story
作為 [角色]，我希望 [行為]，以便 [目的]。

## Spec
- [具體規格項目]

## Tasks
- [ ] 任務一
- [ ] 任務二
- [x] 已完成任務
```

### 完成後步驟

1. 將計畫文件移至 `docs/plans/archive/`
2. 更新 `docs/FEATURES.md`：將功能狀態改為 ✅，補充行為描述
3. 更新 `docs/CHANGELOG.md`：在對應版本下新增條目
