import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { getSurveyList, parseSurveyList, getSubmissions, parseSubmissions } from '../../utils/sheetsApi'
import './SurveyList.css'

export default function SurveyList() {
  const { accessToken, assignedSurveys, user } = useAuth()
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState([])
  const [submitted, setSubmitted] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [listRows, subRows] = await Promise.all([
          getSurveyList(accessToken),
          getSubmissions(accessToken),
        ])
        const all = parseSurveyList(listRows)
        const mine = all.filter(s => assignedSurveys.includes(s.id))
        setSurveys(mine)

        const subs = parseSubmissions(subRows)
        const mySubmitted = new Set(
          subs
            .filter(r => r.email.toLowerCase() === user.email.toLowerCase())
            .flatMap(r =>
              assignedSurveys.filter(id =>
                mine.find(s => s.id === id) &&
                r[`${id}-1`] !== ''
              )
            )
        )
        setSubmitted(mySubmitted)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [accessToken, assignedSurveys, user.email])

  if (loading) return <div className="page-center"><span className="spinner" /></div>
  if (error) return <div className="page-center error-msg">載入失敗：{error}</div>

  return (
    <main className="page-main">
      <div className="page-header">
        <h1>我的問卷</h1>
        <p>請填寫以下指派給您的考核問卷</p>
      </div>

      {surveys.length === 0 ? (
        <div className="empty-state">目前沒有指派給您的問卷。</div>
      ) : (
        <div className="survey-grid">
          {surveys.map(survey => (
            <div key={survey.id} className="survey-card">
              <div className="survey-card-header">
                <span className="survey-id-badge">{survey.id}</span>
                {submitted.has(survey.id) && (
                  <span className="status-badge done">已填寫</span>
                )}
              </div>
              <h2 className="survey-name">{survey.name}</h2>
              <p className="survey-weight">分數佔比 {Math.round(survey.weight * 100)}%</p>
              {submitted.has(survey.id) ? (
                <p className="survey-submitted-msg">已完成填寫</p>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate(`/surveys/${survey.id}`)}
                >
                  開始填寫
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
