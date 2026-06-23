export function calcScores(surveyList, questions, submissions) {
  const surveys = {}
  let total = 0

  for (const survey of surveyList) {
    const scoredQs = questions.filter(
      q => q.surveyId === survey.id && q['1-5分'] !== ''
    )
    const maxScore = scoredQs.length * 20

    if (maxScore === 0) {
      surveys[survey.id] = { name: survey.name, weight: survey.weight, contribution: 0, score: 0, maxScore: 0 }
      continue
    }

    const sum = scoredQs.reduce((acc, q) => {
      const vals = submissions
        .map(row => parseFloat(row[q.questionId]))
        .filter(v => !isNaN(v) && v > 0)
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
      return acc + avg
    }, 0)

    const contribution = (sum / maxScore) * survey.weight * 100
    surveys[survey.id] = {
      name: survey.name,
      weight: survey.weight,
      score: Math.round(sum * 100) / 100,
      maxScore,
      contribution: Math.round(contribution * 100) / 100,
    }
    total += contribution
  }

  return { surveys, total: Math.round(total * 100) / 100 }
}

export function getTextFeedback(questions, submissions) {
  const textQs = questions.filter(q => q['1-5分'] === '')
  return textQs.map(q => ({
    surveyId: q.surveyId,
    questionId: q.questionId,
    question: q.question,
    responses: submissions
      .filter(row => row[q.questionId])
      .map(row => ({ email: row.email, text: row[q.questionId] })),
  }))
}
