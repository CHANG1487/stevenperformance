import { useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { getUsers } from '../utils/sheetsApi'
import { AuthContext } from './useAuth'

const SESSION_KEYS = ['access_token', 'user_email', 'user_name', 'user_role', 'user_surveys']

function parseErrorMessage(err) {
  const msg = err?.message || ''
  if (msg.includes('400') || msg.includes('404')) {
    return '找不到試算表，請確認 VITE_SPREADSHEET_ID 設定正確，且試算表已共用給您的帳號。'
  }
  if (msg.includes('403')) {
    return '沒有試算表存取權限，請確認 Google Sheets API 已啟用，且試算表已共用給您的帳號。'
  }
  if (msg.includes('401')) {
    return 'OAuth token 失效，請重新登入。'
  }
  return `登入失敗：${msg || '未知錯誤，請查看 Console 取得詳細資訊。'}`
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [assignedSurveys, setAssignedSurveys] = useState([])
  const [accessToken, setAccessToken] = useState(null)
  // 'loading' | 'unauthenticated' | 'authenticated' | 'unauthorized'
  const [authState, setAuthState] = useState('loading')
  const [loginError, setLoginError] = useState(null)

  useEffect(() => {
    const token = sessionStorage.getItem('access_token')
    const email = sessionStorage.getItem('user_email')
    if (token && email) {
      setAccessToken(token)
      setUser({ email, name: sessionStorage.getItem('user_name') || email })
      setRole(sessionStorage.getItem('user_role'))
      const surveys = sessionStorage.getItem('user_surveys')
      setAssignedSurveys(surveys ? JSON.parse(surveys) : [])
      setAuthState('authenticated')
    } else {
      setAuthState('unauthenticated')
    }
  }, [])

  const googleLogin = useGoogleLogin({
    scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets',
    onSuccess: async (tokenResponse) => {
      setAuthState('loading')
      setLoginError(null)
      try {
        const token = tokenResponse.access_token

        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!profileRes.ok) throw new Error(`取得用戶資料失敗 (${profileRes.status})`)
        const profile = await profileRes.json()
        const email = profile.email

        const rows = await getUsers(token)
        const userRow = rows.slice(1).find(
          r => (r[0] || '').toLowerCase() === email.toLowerCase()
        )

        if (!userRow) {
          setAuthState('unauthorized')
          return
        }

        const userRole = userRow[1] || '一般'
        const surveys = [userRow[2], userRow[3]].filter(Boolean)

        sessionStorage.setItem('access_token', token)
        sessionStorage.setItem('user_email', email)
        sessionStorage.setItem('user_name', profile.name || email)
        sessionStorage.setItem('user_role', userRole)
        sessionStorage.setItem('user_surveys', JSON.stringify(surveys))

        setAccessToken(token)
        setUser({ email, name: profile.name || email, picture: profile.picture })
        setRole(userRole)
        setAssignedSurveys(surveys)
        setAuthState('authenticated')
      } catch (err) {
        console.error('Login error:', err)
        setLoginError(parseErrorMessage(err))
        setAuthState('unauthenticated')
      }
    },
    onError: (err) => {
      console.error('Google OAuth error:', err)
      setLoginError('Google 登入失敗，請確認彈出視窗未被瀏覽器封鎖後再試一次。')
      setAuthState('unauthenticated')
    },
  })

  const logout = () => {
    SESSION_KEYS.forEach(k => sessionStorage.removeItem(k))
    setAccessToken(null)
    setUser(null)
    setRole(null)
    setAssignedSurveys([])
    setLoginError(null)
    setAuthState('unauthenticated')
  }

  return (
    <AuthContext.Provider value={{ user, role, assignedSurveys, accessToken, authState, loginError, login: googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
