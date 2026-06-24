# Fix：文字回饋匿名 + PDF 多頁重複

## Context

兩個問題均在 `src/components/backend/ScoreResults.jsx`：

1. 文字回饋顯示填寫者 email，需改為匿名（只顯示評論內容）
2. PDF 多頁分割邏輯有 bug：`addImage` 每次都傳入完整 `imgH`，卻沒有調整 Y 偏移，造成每頁重複顯示相同內容

## 修改範圍

### `src/components/backend/ScoreResults.jsx`

- 刪除 `<span className="feedback-author">{r.email}</span>`
- 修正 PDF 分頁：以 `10 - page * pageContentH` 作為 Y 偏移，每頁滑動圖片視窗

## 完成日期

2026-06-24
