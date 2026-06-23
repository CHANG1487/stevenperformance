import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { getSurveyList, parseSurveyList, getSurveyQuestions, parseQuestions, getSubmissions, parseSubmissions } from '../../utils/sheetsApi'
import './AllSubmissions.css'

export default function AllSubmissions() {
  const { accessToken, role } = useAuth()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [questions, setQuestions] = useState([])
  const [surveyList, setSurveyList] = useState([])
  const [filterSurvey, setFilterSurvey] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const canEdit = role === '管理員'

  useEffect(() => {
    async function load() {
      try {
        const [listRows, qRows, subRows] = await Promise.all([
          getSurveyList(accessToken),
          getSurveyQuestions(accessToken),
          getSubmissions(accessToken),
        ])
        setSurveyList(parseSurveyList(listRows))
        setQuestions(parseQuestions(qRows))
        setSubmissions(parseSubmissions(subRows))
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

  const surveysInFilter = filterSurvey === 'all'
    ? surveyList
    : surveyList.filter(s => s.id === filterSurvey)

  return (
    <main className="page-main">
      <div className="page-header">
        <h1>所有已提交問卷</h1>
        <p>共 {submissions.length} 筆提交紀錄</p>
      </div>

      <div className="filter-bar">
        <label htmlFor="survey-filter">篩選問卷：</label>
        <select id="survey-filter" value={filterSurvey} onChange={e => setFilterSurvey(e.target.value)}>
          <option value="all">全部</option>
          {surveyList.map(s => (
            <option key={s.id} value={s.id}>{s.id} — {s.name}</option>
          ))}
        </select>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state">尚無提交紀錄。</div>
      ) : (
        <div className="submissions-table-wrap">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>填寫日期</th>
                <th>填寫帳號</th>
                {surveysInFilter.flatMap(s => {
                  const qs = questions.filter(q => q.surveyId === s.id)
                  return qs.map(q => <th key={q.questionId}>{q.questionId}</th>)
                })}
                {canEdit && <th>操作</th>}
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub._rowIndex}>
                  <td>{sub.date}</td>
                  <td className="email-cell">{sub.email}</td>
                  {surveysInFilter.flatMap(s => {
                    const qs = questions.filter(q => q.surveyId === s.id)
                    return qs.map(q => (
                      <td key={q.questionId} className={q['1-5分'] === '' ? 'text-cell' : 'score-cell'}>
                        {sub[q.questionId] || '—'}
                      </td>
                    ))
                  })}
                  {canEdit && (
                    <td>
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => navigate(`/admin/edit/${sub._rowIndex}`)}
                      >
                        編輯
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
