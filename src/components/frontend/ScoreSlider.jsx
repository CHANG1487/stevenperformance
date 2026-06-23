import './ScoreSlider.css'

function getRangeKey(score) {
  if (score <= 5) return '1-5分'
  if (score <= 10) return '6-10分'
  if (score <= 15) return '11-15分'
  return '16-20分'
}

export default function ScoreSlider({ question, quantitativeMap, value, onChange }) {
  const rangeKey = getRangeKey(value)
  const codeKey = question[rangeKey] || ''
  const description = quantitativeMap[codeKey] || ''

  return (
    <div className="score-slider">
      <div className="score-display">
        <span className="score-number">{value} 分</span>
        <span className="score-range-label">{rangeKey}</span>
      </div>

      <div className="slider-track-wrap">
        <div
          className="slider-fill"
          style={{ width: `${((value - 1) / 19) * 100}%` }}
        />
        <input
          type="range"
          min="1"
          max="20"
          value={value}
          onChange={e => onChange(parseInt(e.target.value, 10))}
          className="slider-input"
          aria-label={`${question.question} 分數`}
        />
      </div>

      <div className="slider-marks">
        <span>1</span>
        <span>5</span>
        <span>10</span>
        <span>15</span>
        <span>20</span>
      </div>

      {description && (
        <div className="score-description">
          <span className="code-chip">{codeKey}</span>
          <p>{description}</p>
        </div>
      )}
    </div>
  )
}
