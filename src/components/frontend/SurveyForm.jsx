import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import {
  getSurveyList, parseSurveyList,
  getSurveyQuestions, parseQuestions,
  getQuantitativeItems, parseQuantitativeItems,
  buildSubmissionRow, appendSubmission,
} from '../../utils/sheetsApi'
import ScoreSlider from './ScoreSlider'
import SurveyPreview from './SurveyPreview'
import './SurveyForm.css'

export default function SurveyForm() {
  const { surveyId } = useParams()
  const { accessToken, user, assignedSurveys } = useAuth()
  const navigate = useNavigate()

  const [surveyName, setSurveyName] = useState('')
  const [questions, setQuestions] = useState([])
  const [quantitativeMap, setQuantitativeMap] = useState({})
  const [answers, setAnswers] = useState({})
  const [showPreview, setShowPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!assignedSurveys.includes(surveyId)) {
      navigate('/surveys', { replace: true })
      return
    }

    async function load() {
      try {
        const [listRows, questionRows, quantRows] = await Promise.all([
          getSurveyList(accessToken),
          getSurveyQuestions(accessToken),
          getQuantitativeItems(accessToken),
        ])
        const list = parseSurveyList(listRows)
        const survey = list.find(s => s.id === surveyId)
        setSurveyName(survey?.name || surveyId)

        const allQs = parseQuestions(questionRows)
        const myQs = allQs.filter(q => q.surveyId === surveyId)
        setQuestions(myQs)

        const qMap = parseQuantitativeItems(quantRows)
        setQuantitativeMap(qMap)

        const initial = {}
        myQs.forEach(q => {
          initial[q.questionId] = q['1-5分'] !== '' ? 10 : ''
        })
        setAnswers(initial)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [accessToken, surveyId, assignedSurveys, navigate])

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const now = new Date()
      const date = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`
      const row = buildSubmissionRow(date, user.email, answers)
      await appendSubmission(accessToken, row)
      setSubmitted(true)
      setShowPreview(false)
    } catch (e) {
      alert(`送出失敗：${e.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page-center"><span className="spinner" /></div>
  if (error) return <div className="page-center error-msg">載入失敗：{error}</div>

  if (submitted) {
    return (
      <main className="page-main">
        <div className="submit-success">
          <div className="success-icon">✓</div>
          <h2>填寫完成！</h2>
          <p>您的回答已成功送出，感謝填寫。</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/surveys')}>
            返回問卷清單
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="page-main">
      <div className="page-header">
        <button type="button" className="back-btn" onClick={() => navigate('/surveys')}>
          ← 返回
        </button>
        <h1>{surveyName}</h1>
        <p>請依據實際情況誠實填寫，所有回答都將用於改善團隊表現。</p>
      </div>

      <div className="question-list">
        {questions.map((q, idx) => {
          const isText = q['1-5分'] === ''
          return (
            <div key={q.questionId} className="question-card">
              <div className="question-header">
                <span className="question-num">{idx + 1}</span>
                <div>
                  <span className="question-id">{q.questionId}</span>
                  <p className="question-text">{q.question}</p>
                </div>
              </div>

              {isText ? (
                <textarea
                  className="text-answer"
                  placeholder="請輸入您的意見或回饋（選填）"
                  rows={4}
                  value={answers[q.questionId] || ''}
                  onChange={e => handleChange(q.questionId, e.target.value)}
                />
              ) : (
                <ScoreSlider
                  question={q}
                  quantitativeMap={quantitativeMap}
                  value={answers[q.questionId] ?? 10}
                  onChange={val => handleChange(q.questionId, val)}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="form-footer">
        <button type="button" className="btn-primary large" onClick={() => setShowPreview(true)}>
          預覽並送出
        </button>
      </div>

      {showPreview && (
        <SurveyPreview
          surveyName={surveyName}
          questions={questions}
          answers={answers}
          onBack={() => setShowPreview(false)}
          onConfirm={handleSubmit}
          submitting={submitting}
        />
      )}
    </main>
  )
}
