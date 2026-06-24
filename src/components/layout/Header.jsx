import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import './Header.css'

const ROLE_LEVEL = { '一般': 1, '主管': 2, '管理員': 3 }

export default function Header() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const roleLevel = ROLE_LEVEL[role] || 0

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-left">
          <span className="header-brand">考核表系統</span>
          <button
            type="button"
            className="nav-hamburger"
            aria-label="選單"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className={`header-nav${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)}>
          <NavLink to="/surveys" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            填寫問卷
          </NavLink>
          <NavLink to="/my-results" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            我的紀錄
          </NavLink>
          {roleLevel >= 2 && (
            <>
              <NavLink to="/admin/submissions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                所有問卷
              </NavLink>
              <NavLink to="/admin/scores" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                分數結果
              </NavLink>
            </>
          )}
        </nav>

        <div className="header-user">
          {user?.picture && (
            <img className="user-avatar" src={user.picture} alt="" width="28" height="28" referrerPolicy="no-referrer" />
          )}
          <span className="user-email">{user?.name || user?.email}</span>
          <span className="user-role-badge">{role}</span>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            登出
          </button>
        </div>
      </div>
    </header>
  )
}
