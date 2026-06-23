const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`

async function request(token, method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Sheets API ${res.status}: ${text}`)
  }
  return res.json()
}

export async function readSheet(token, range) {
  const data = await request(token, 'GET', `/values/${encodeURIComponent(range)}`)
  return data.values || []
}

export async function appendRows(token, range, rows) {
  return request(
    token,
    'POST',
    `/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { values: rows }
  )
}

export async function updateRow(token, range, row) {
  return request(
    token,
    'PUT',
    `/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    { values: [row] }
  )
}

export const getUsers = (token) => readSheet(token, 'users!A:D')
export const getSurveyList = (token) => readSheet(token, '問卷清單!A:C')
export const getSurveyQuestions = (token) => readSheet(token, '問卷問題!A:G')
export const getQuantitativeItems = (token) => readSheet(token, '量化項目!A:B')
export const getSubmissions = (token) => readSheet(token, '問題收集!A:Z')

export const appendSubmission = (token, row) =>
  appendRows(token, '問題收集!A:Z', [row])

export const updateSubmission = (token, rowIndex, row) =>
  updateRow(token, `問題收集!A${rowIndex}:Z${rowIndex}`, row)

// Column order in 問題收集 sheet (after 填寫日期 and 填寫帳號)
export const QUESTION_COLUMNS = [
  'A-1', 'A-2', 'A-3', 'A-4',
  'B-1', 'B-2', 'B-3', 'B-4', 'B-5', 'B-6', 'B-7', 'B-8', 'B-9',
  'C-1', 'C-2', 'C-3',
  'D-1', 'D-2', 'D-3', 'D-4', 'D-5', 'D-6', 'D-7', 'D-8',
]

export function parseQuestions(rows) {
  if (rows.length < 2) return []
  return rows.slice(1).map(row => ({
    surveyId: row[0] || '',
    questionId: row[1] || '',
    question: row[2] || '',
    '1-5分': row[3] || '',
    '6-10分': row[4] || '',
    '11-15分': row[5] || '',
    '16-20分': row[6] || '',
  }))
}

export function parseSubmissions(rows) {
  if (rows.length < 2) return []
  return rows.slice(1).map((row, i) => {
    const obj = { _rowIndex: i + 2, date: row[0] || '', email: row[1] || '' }
    QUESTION_COLUMNS.forEach((id, idx) => {
      obj[id] = row[idx + 2] || ''
    })
    return obj
  })
}

export function buildSubmissionRow(date, email, answers) {
  return [date, email, ...QUESTION_COLUMNS.map(id => answers[id] ?? '')]
}

export function parseSurveyList(rows) {
  if (rows.length < 2) return []
  return rows.slice(1).map(row => ({
    id: row[0] || '',
    name: row[1] || '',
    weight: parseFloat((row[2] || '0').replace('%', '')) / 100,
  }))
}

export function parseQuantitativeItems(rows) {
  const map = {}
  if (rows.length < 2) return map
  rows.slice(1).forEach(row => {
    if (row[0]) map[row[0].trim()] = row[1] || ''
  })
  return map
}
