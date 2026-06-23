import { useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { getUsers } from '../utils/sheetsApi'
import { AuthContext } from './useAuth'

const SESSION_KEYS = ['access_token', 'user_email', 'user_name', 'user_role', 'user_surveys']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [assignedSurveys, setAssignedSurveys] = useState([])
  const [accessToken, setAccessToken] = useState(null)
  // 'loading' | 'unauthenticated' | 'authenticated' | 'unauthorized'
  const [authState, setAuthState] = useState('loading')

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
      try {
        const token = tokenResponse.access_token

        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        })
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
        setAuthState('unauthenticated')
      }
    },
    onError: () => setAuthState('unauthenticated'),
  })

  const logout = () => {
    SESSION_KEYS.forEach(k => sessionStorage.removeItem(k))
    setAccessToken(null)
    setUser(null)
    setRole(null)
    setAssignedSurveys([])
    setAuthState('unauthenticated')
  }

  return (
    <AuthContext.Provider value={{ user, role, assignedSurveys, accessToken, authState, login: googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
