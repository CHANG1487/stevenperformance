import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { getSurveyList, parseSurveyList, getSurveyQuestions, parseQuestions, getSubmissions, parseSubmissions } from '../../utils/sheetsApi'
import { calcScores, getTextFeedback } from '../../utils/scoreCalculator'
import './ScoreResults.css'

export default function ScoreResults() {
  const { accessToken } = useAuth()
  const [result, setResult] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [listRows, qRows, subRows] = await Promise.all([
          getSurveyList(accessToken),
          getSurveyQuestions(accessToken),
          getSubmissions(accessToken),
        ])
        const surveys = parseSurveyList(listRows)
        const questions = parseQuestions(qRows)
        const submissions = parseSubmissions(subRows)

        setResult(calcScores(surveys, questions, submissions))
        setFeedback(getTextFeedback(questions, submissions))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [accessToken])

  if (loading) return <div className="page-center"><span className="spinner" /></div>
  if (error) return <div className="page-center error-msg">載入失敗：{error}</div>
  if (!result) return null

  const totalPct = Math.min(100, result.total)

  return (
    <main className="page-main">
      <div className="page-header">
        <h1>分數計算結果</h1>
      </div>

      <div className="score-report">
        <div className="total-score-card">
          <div className="total-label">總分</div>
          <div className="total-number">{result.total}</div>
          <div className="total-max">/ 100 分</div>
          <div className="total-bar-track">
            <div className="total-bar-fill" style={{ width: `${totalPct}%` }} />
          </div>
        </div>

        <div className="survey-scores">
          {Object.values(result.surveys).map(s => {
            return (
              <div key={s.name} className="survey-score-row">
                <div className="survey-score-info">
                  <span className="survey-score-name">{s.name}</span>
                  <span className="survey-score-nums">
                    {s.contribution.toFixed(1)} / {Math.round(s.weight * 100)} 分
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(100, (s.contribution / (s.weight * 100)) * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {feedback.some(f => f.responses.length > 0) && (
          <div className="feedback-section">
            <h2>文字回饋</h2>
            {feedback.filter(f => f.responses.length > 0).map(f => (
              <div key={f.questionId} className="feedback-block">
                <div className="feedback-qid">{f.questionId}</div>
                <div className="feedback-qtxt">{f.question}</div>
                <div className="feedback-responses">
                  {f.responses.map((r, i) => (
                    <div key={i} className="feedback-item">
                      <p className="feedback-text">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
