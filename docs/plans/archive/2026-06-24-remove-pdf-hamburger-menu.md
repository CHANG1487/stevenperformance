# 移除 PDF 下載 + Header 手機版漢堡選單

## Context

1. PDF 下載功能確認不需要，移除相關程式碼以簡化元件
2. Header 在手機版（≤1024px）因導覽連結多而出現水平捲動，改為漢堡按鈕展開垂直下拉選單

## 修改範圍

- `src/components/backend/ScoreResults.jsx` — 移除 PDF 相關 state/ref/函式/按鈕
- `src/components/backend/ScoreResults.css` — 移除 `.scores-toolbar`
- `src/components/layout/Header.jsx` — 拆出 `.header-left`，加漢堡按鈕 + `menuOpen` state
- `src/components/layout/Header.css` — 手機版下隱藏 nav、顯示漢堡按鈕，點擊展開垂直下拉

## 完成日期

2026-06-24
