import './SurveyPreview.css'

export default function SurveyPreview({ surveyName, questions, answers, onConfirm, onBack, submitting }) {
  return (
    <div className="preview-overlay">
      <div className="preview-modal">
        <div className="preview-header">
          <h2>確認送出 — {surveyName}</h2>
          <p>請確認以下填寫內容無誤後再送出。</p>
        </div>

        <div className="preview-list">
          {questions.map(q => {
            const isText = q['1-5分'] === ''
            const val = answers[q.questionId]
            return (
              <div key={q.questionId} className="preview-item">
                <div className="preview-q-id">{q.questionId}</div>
                <div className="preview-q-body">
                  <div className="preview-q-text">{q.question}</div>
                  <div className={`preview-answer ${isText ? 'is-text' : 'is-score'}`}>
                    {isText
                      ? (val ? val : <span className="empty-hint">（未填寫）</span>)
                      : <><span className="preview-score">{val ?? '—'}</span> 分</>
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="preview-actions">
          <button type="button" className="btn-ghost" onClick={onBack} disabled={submitting}>
            返回修改
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm} disabled={submitting}>
            {submitting ? <><span className="spinner" /> 送出中…</> : '確認送出'}
          </button>
        </div>
      </div>
    </div>
  )
}
