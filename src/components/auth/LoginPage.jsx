import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import './LoginPage.css'

const missingEnv = !import.meta.env.VITE_GOOGLE_CLIENT_ID || !import.meta.env.VITE_SPREADSHEET_ID

export default function LoginPage() {
  const { authState, loginError, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authState === 'authenticated') navigate('/surveys', { replace: true })
    if (authState === 'unauthorized') navigate('/unauthorized', { replace: true })
  }, [authState, navigate])

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
            <rect width="48" height="48" rx="12" fill="var(--accent)" />
            <text x="24" y="32" textAnchor="middle" fontSize="22" fill="#fff" fontWeight="700">考</text>
          </svg>
        </div>
        <h1>考核表系統</h1>
        <p className="login-desc">請使用公司 Google 帳號登入以繼續</p>

        {missingEnv && (
          <div className="login-warning">
            ⚠️ 尚未設定環境變數，請建立 <code>.env</code> 檔案並填入
            <code>VITE_GOOGLE_CLIENT_ID</code> 和 <code>VITE_SPREADSHEET_ID</code>。
          </div>
        )}

        {authState === 'loading' && (
          <div className="login-loading">
            <span className="spinner" />
            驗證中，請稍候…
          </div>
        )}

        {authState !== 'loading' && (
          <button className="google-btn" type="button" onClick={() => login()} disabled={missingEnv}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            以 Google 帳號登入
          </button>
        )}

        {loginError && (
          <div className="login-error" role="alert">
            {loginError}
          </div>
        )}
      </div>
    </div>
  )
}
