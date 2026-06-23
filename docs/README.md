# stevenperformance

React 19 + Vite 8 單頁應用程式。使用純 JSX（無 TypeScript）、原生 CSS（含 CSS Nesting）、oxlint 靜態分析。

## 技術棧

| 分類 | 工具 | 版本 |
|------|------|------|
| UI 框架 | React | ^19.2.7 |
| 建置工具 | Vite | ^8.1.0 |
| React 轉譯 | @vitejs/plugin-react (Oxc) | ^6.0.2 |
| 靜態分析 | oxlint | ^1.69.0 |
| 語言 | JSX（無 TypeScript）| — |
| 樣式 | 原生 CSS + CSS Nesting | — |

> `@vitejs/plugin-react` v6 預設使用 Oxc 進行 JSX 轉譯（非 Babel），速度較快但不支援 Babel 插件。

## 快速開始

```bash
# 安裝依賴
npm install

# 啟動開發伺服器（http://localhost:5173）
npm run dev

# 建置正式版本（輸出至 dist/）
npm run build

# 預覽正式建置
npm run preview
```

## 常用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動 Vite 開發伺服器，支援 HMR |
| `npm run build` | 打包至 `dist/`，供部署使用 |
| `npm run preview` | 在本地以靜態伺服器預覽 `dist/` |
| `npm run lint` | 執行 oxlint，檢查 `src/` 下所有檔案 |

## 文件索引

| 文件 | 內容 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 目錄結構、啟動流程、CSS 架構、SVG Sprite 系統 |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 開發規範、CSS Token 使用、命名規則、計畫歸檔流程 |
| [FEATURES.md](./FEATURES.md) | 功能清單與行為描述 |
| [TESTING.md](./TESTING.md) | 測試規範（目前尚未設定測試框架） |
| [CHANGELOG.md](./CHANGELOG.md) | 版本更新日誌 |
| [plans/](./plans/) | 進行中的功能開發計畫 |
| [plans/archive/](./plans/archive/) | 已完成計畫的歸檔 |
