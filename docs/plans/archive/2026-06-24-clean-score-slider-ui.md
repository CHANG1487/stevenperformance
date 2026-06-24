# Fix：ScoreSlider UI 清理

## Context

問卷評分滑桿元件顯示了三個多餘/無意義的 UI 元素，使用者要求移除並放大說明文字。

## 修改範圍

### `src/components/frontend/ScoreSlider.jsx`
- 移除分數旁的區間標籤（`6-10分`、`11-15分`）— `.score-range-label`
- 移除量化說明框左側的代號 chip（`A14`、`A19`）— `.code-chip`

### `src/components/frontend/ScoreSlider.css`
- `.score-description` 的 `font-size` 從 `13px` 改為 `15px`

## 完成日期

2026-06-24
