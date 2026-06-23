import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import {
  getSurveyList, parseSurveyList,
  getSurveyQuestions, parseQuestions,
  getQuantitativeItems, parseQuantitativeItems,
  getSubmissions, parseSubmissions,
  updateSubmission, QUESTION_COLUMNS,
} from '../../utils/sheetsApi'
import ScoreSlider from '../frontend/ScoreSlider'
import SurveyPreview from '../frontend/SurveyPreview'
import './EditSubmission.css'

export default function EditSubmission() {
  const { rowIndex } = useParams()
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [submission, setSubmission] = useState(null)
  const [questions, setQuestions] = useState([])
  const [surveyList, setSurveyList] = useState([])
  const [quantitativeMap, setQuantitativeMap] = useState({})
  const [answers, setAnswers] = useState({})
  const [activeSurvey, setActiveSurvey] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [listRows, qRows, quantRows, subRows] = await Promise.all([
          getSurveyList(accessToken),
          getSurveyQuestions(accessToken),
          getQuantitativeItems(accessToken),
          getSubmissions(accessToken),
        ])
        const surveys = parseSurveyList(listRows)
        setSurveyList(surveys)
        setQuestions(parseQuestions(qRows))
        setQuantitativeMap(parseQuantitativeItems(quantRows))

        const subs = parseSubmissions(subRows)
        const target = subs.find(s => s._rowIndex === parseInt(rowIndex, 10))
        if (!target) { setError('找不到此筆紀錄'); return }

        setSubmission(target)
        setAnswers({ ...target })
        setActiveSurvey(surveys[0]?.id)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [accessToken, rowIndex])

  const handleChange = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }))

  const handleSave = async () => {
    setSubmitting(true)
    try {
      const row = [answers.date, answers.email, ...QUESTION_COLUMNS.map(id => answers[id] ?? '')]
      await updateSubmission(accessToken, parseInt(rowIndex, 10), row)
      navigate('/admin/submissions')
    } catch (e) {
      alert(`儲存失敗：${e.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page-center"><span className="spinner" /></div>
  if (error) return <div className="page-center error-msg">{error}</div>

  const currentQuestions = questions.filter(q => q.surveyId === activeSurvey)
  const currentSurveyName = surveyList.find(s => s.id === activeSurvey)?.name || activeSurvey

  return (
    <main className="page-main">
      <div className="page-header">
        <button type="button" className="back-btn" onClick={() => navigate('/admin/submissions')}>
          ← 返回
        </button>
        <h1>編輯問卷回答</h1>
        <p>填寫者：{submission?.email}　填寫日期：{submission?.date}</p>
      </div>

      <div className="edit-survey-tabs">
        {surveyList.map(s => (
          <button
            key={s.id}
            type="button"
            className={`survey-tab ${activeSurvey === s.id ? 'active' : ''}`}
            onClick={() => setActiveSurvey(s.id)}
          >
            {s.id} — {s.name}
          </button>
        ))}
      </div>

      <div className="question-list">
        {currentQuestions.map((q, idx) => {
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
                  rows={4}
                  value={answers[q.questionId] || ''}
                  onChange={e => handleChange(q.questionId, e.target.value)}
                />
              ) : (
                <ScoreSlider
                  question={q}
                  quantitativeMap={quantitativeMap}
                  value={parseInt(answers[q.questionId], 10) || 10}
                  onChange={val => handleChange(q.questionId, val)}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="form-footer">
        <button type="button" className="btn-primary large" onClick={() => setShowPreview(true)}>
          預覽並儲存
        </button>
      </div>

      {showPreview && (
        <SurveyPreview
          surveyName={`編輯 — ${currentSurveyName}`}
          questions={currentQuestions}
          answers={answers}
          onBack={() => setShowPreview(false)}
          onConfirm={handleSave}
          submitting={submitting}
        />
      )}
    </main>
  )
}
