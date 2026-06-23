import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './contexts/useAuth'
import './App.css'
import LoginPage from './components/auth/LoginPage'
import UnauthorizedPage from './components/auth/UnauthorizedPage'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Header from './components/layout/Header'
import SurveyList from './components/frontend/SurveyList'
import SurveyForm from './components/frontend/SurveyForm'
import MyResults from './components/frontend/MyResults'
import AllSubmissions from './components/backend/AllSubmissions'
import ScoreResults from './components/backend/ScoreResults'
import EditSubmission from './components/backend/EditSubmission'

function AppRoutes() {
  const { authState } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authState === 'unauthorized') navigate('/unauthorized', { replace: true })
  }, [authState, navigate])

  return (
    <>
      {authState === 'authenticated' && <Header />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<Navigate to="/surveys" replace />} />
        <Route path="/surveys" element={
          <ProtectedRoute minRole="一般"><SurveyList /></ProtectedRoute>
        } />
        <Route path="/surveys/:surveyId" element={
          <ProtectedRoute minRole="一般"><SurveyForm /></ProtectedRoute>
        } />
        <Route path="/my-results" element={
          <ProtectedRoute minRole="一般"><MyResults /></ProtectedRoute>
        } />
        <Route path="/admin/submissions" element={
          <ProtectedRoute minRole="主管"><AllSubmissions /></ProtectedRoute>
        } />
        <Route path="/admin/scores" element={
          <ProtectedRoute minRole="主管"><ScoreResults /></ProtectedRoute>
        } />
        <Route path="/admin/edit/:rowIndex" element={
          <ProtectedRoute minRole="管理員"><EditSubmission /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/surveys" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return <AppRoutes />
}
