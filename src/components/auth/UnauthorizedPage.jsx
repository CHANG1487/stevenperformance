import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import './UnauthorizedPage.css'

export default function UnauthorizedPage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-icon" aria-hidden="true">⛔</div>
        <h1>未獲授權</h1>
        <p>
          {user?.email
            ? `帳號 ${user.email} 沒有存取此系統的權限。`
            : '您的帳號沒有存取此系統的權限。'}
        </p>
        <p className="unauthorized-hint">請聯絡管理員確認您的帳號已加入授權名單。</p>
        <button type="button" className="btn-outline" onClick={handleLogout}>
          返回登入頁
        </button>
      </div>
    </div>
  )
}
