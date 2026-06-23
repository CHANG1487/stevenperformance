import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { getSurveyList, parseSurveyList, getSurveyQuestions, parseQuestions, getSubmissions, parseSubmissions } from '../../utils/sheetsApi'
import './MyResults.css'

export default function MyResults() {
  const { accessToken, user } = useAuth()
  const [mySubmissions, setMySubmissions] = useState([])
  const [questions, setQuestions] = useState([])
  const [surveyMap, setSurveyMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [listRows, qRows, subRows] = await Promise.all([
          getSurveyList(accessToken),
          getSurveyQuestions(accessToken),
          getSubmissions(accessToken),
        ])
        const list = parseSurveyList(listRows)
        const map = {}
        list.forEach(s => { map[s.id] = s.name })
        setSurveyMap(map)
        setQuestions(parseQuestions(qRows))

        const subs = parseSubmissions(subRows)
        setMySubmissions(subs.filter(r => r.email.toLowerCase() === user.email.toLowerCase()))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [accessToken, user.email])

  if (loading) return <div className="page-center"><span className="spinner" /></div>
  if (error) return <div className="page-center error-msg">載入失敗：{error}</div>

  return (
    <main className="page-main">
      <div className="page-header">
        <h1>我的填寫紀錄</h1>
        <p>共 {mySubmissions.length} 筆提交紀錄</p>
      </div>

      {mySubmissions.length === 0 ? (
        <div className="empty-state">您尚未提交任何問卷。</div>
      ) : (
        <div className="results-list">
          {mySubmissions.map((sub, idx) => (
            <div key={idx} className="result-card">
              <div className="result-header" onClick={() => setExpanded(expanded === idx ? null : idx)}>
                <div>
                  <span className="result-date">{sub.date}</span>
                  <span className="result-email">{sub.email}</span>
                </div>
                <span className="expand-icon">{expanded === idx ? '▲' : '▼'}</span>
              </div>

              {expanded === idx && (
                <div className="result-detail">
                  {Object.keys(surveyMap).map(surveyId => {
                    const qs = questions.filter(q => q.surveyId === surveyId)
                    const hasData = qs.some(q => sub[q.questionId])
                    if (!hasData) return null
                    return (
                      <div key={surveyId} className="result-survey-block">
                        <h3>{surveyMap[surveyId]}</h3>
                        {qs.map(q => {
                          const val = sub[q.questionId]
                          if (!val) return null
                          return (
                            <div key={q.questionId} className="result-row">
                              <span className="result-qid">{q.questionId}</span>
                              <span className="result-qtxt">{q.question}</span>
                              <span className={`result-val ${q['1-5分'] === '' ? 'is-text' : 'is-score'}`}>
                                {q['1-5分'] === '' ? val : `${val} 分`}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
