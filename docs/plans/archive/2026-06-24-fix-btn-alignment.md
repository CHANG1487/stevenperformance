# Fix：問卷成功畫面按鈕未置中

## Context

`SurveyList.css` 的 `.btn-primary` 全域設了 `align-self: flex-start`，導致凡是在 `flex-direction: column` 容器中使用此 class 的按鈕，都會靠左對齊。`SurveyForm` 送出成功畫面（`.submit-success`）使用 `align-items: center`，但被此 `align-self` 覆蓋，造成「返回問卷清單」按鈕偏左。

## 修改範圍

### `src/components/frontend/SurveyList.css`

- 從 `.btn-primary` 移除 `align-self: flex-start`
- 改為 `.survey-card .btn-primary { align-self: flex-start; }` 限縮作用域

## 完成日期

2026-06-24
