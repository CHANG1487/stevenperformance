import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'

const ROLE_LEVEL = { '一般': 1, '主管': 2, '管理員': 3 }

export default function ProtectedRoute({ children, minRole = '一般' }) {
  const { authState, role } = useAuth()

  if (authState === 'loading') {
    return (
      <div className="page-loading">
        <span className="spinner" />
      </div>
    )
  }

  if (authState === 'unauthorized') return <Navigate to="/unauthorized" replace />
  if (authState !== 'authenticated') return <Navigate to="/login" replace />

  const userLevel = ROLE_LEVEL[role] || 0
  const requiredLevel = ROLE_LEVEL[minRole] || 1

  if (userLevel < requiredLevel) return <Navigate to="/unauthorized" replace />

  return children
}
