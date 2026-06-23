# CLAUDE.md

此檔案為 Claude Code (claude.ai/code) 在本專案中操作時提供指引。

## 專案概述

stevenperformance — React 19 + Vite 8 單頁應用程式，純 JSX（無 TypeScript），使用 oxlint 靜態分析。

## 常用指令

```bash
npm run dev       # 啟動開發伺服器（支援 HMR 熱更新）
npm run build     # 建置正式版本
npm run preview   # 在本地預覽正式建置結果
npm run lint      # 執行 oxlint 靜態分析
```

## 關鍵規則

- **CSS 色彩必須使用 Design Token**：所有顏色、陰影定義在 `src/index.css` 的 `:root`，開發時使用 `var(--accent)`、`var(--bg)` 等變數，不得硬編碼色碼
- **圖示使用 SVG Sprite**：`public/icons.svg` 存放所有 `<symbol>`，引用方式為 `<use href="/icons.svg#id">`，新增圖示須加進此檔
- **深色模式自動切換**：透過 `index.css` 的 `prefers-color-scheme: dark` 媒體查詢覆寫 token，不需要 JS 控制
- **唯一斷點為 1024px**：`@media (max-width: 1024px)` 是全專案唯一的響應式斷點
- 功能開發使用 `docs/plans/` 記錄計畫；完成後移至 `docs/plans/archive/`

## 詳細文件

- [docs/README.md](./docs/README.md) — 項目介紹與快速開始
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — 架構、目錄結構、資料流
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) — 開發規範、命名規則
- [docs/FEATURES.md](./docs/FEATURES.md) — 功能列表與完成狀態
- [docs/TESTING.md](./docs/TESTING.md) — 測試規範與指南
- [docs/CHANGELOG.md](./docs/CHANGELOG.md) — 更新日誌
