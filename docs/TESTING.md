# 測試規範

## 目前狀態

**本專案尚未設定測試框架。** `package.json` 中沒有測試相關的 script 或 devDependency。

## 建議的測試框架設定

若日後需要加入測試，建議組合如下（與 Vite 生態系整合最佳）：

| 工具 | 用途 | 安裝指令 |
|------|------|---------|
| Vitest | 單元 / 元件測試執行器（Vite-native）| `npm i -D vitest` |
| @testing-library/react | React 元件測試工具 | `npm i -D @testing-library/react` |
| @testing-library/user-event | 模擬使用者互動 | `npm i -D @testing-library/user-event` |
| jsdom | 瀏覽器環境模擬 | `npm i -D jsdom` |
| @vitest/coverage-v8 | 覆蓋率報告 | `npm i -D @vitest/coverage-v8` |

### vite.config.js 設定範例

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
```

### package.json scripts 範例

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## 撰寫元件測試範例

以現有 Counter 按鈕為例：

```jsx
// src/__tests__/App.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('Counter 按鈕', () => {
  it('初始顯示 Count is 0', () => {
    render(<App />)
    expect(screen.getByText('Count is 0')).toBeInTheDocument()
  })

  it('點擊後數字遞增', async () => {
    const user = userEvent.setup()
    render(<App />)
    const button = screen.getByRole('button', { name: /count is/i })
    await user.click(button)
    expect(screen.getByText('Count is 1')).toBeInTheDocument()
  })
})
```

## 注意事項

- `@vitejs/plugin-react` v6 使用 Oxc 轉譯，而非 Babel；若測試工具需要 Babel 插件，可能需要改用 `@vitejs/plugin-react-swc` 或另行設定
- 目前無 TypeScript，測試檔案同樣使用 `.jsx` 即可
- oxlint 的 `react/rules-of-hooks` 規則在測試輔助元件（test helpers）中同樣生效，注意不要在條件式中呼叫 Hooks
