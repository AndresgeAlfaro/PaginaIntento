import { useCallback, useState } from 'react'
import { QUIZ_QUESTIONS, QUIZ_QUESTION_COUNT } from '../data/quizQuestions'
import { pickRandomQuestions, shuffleQuestionOptions } from '../utils/quizRandom'

const LS_QUIZ = 'para-ti-quiz-stats'
const PER_ROUND = 3

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(LS_QUIZ) || '{}') || {}
  } catch {
    return {}
  }
}

function saveStats(s) {
  localStorage.setItem(LS_QUIZ, JSON.stringify(s))
}

function buildRound() {
  const picked = pickRandomQuestions(QUIZ_QUESTIONS, PER_ROUND)
  return picked.map((q) => shuffleQuestionOptions(q))
}

export function QuizSection() {
  const [questions, setQuestions] = useState(() => buildRound())
  const [answers, setAnswers] = useState(() => ({}))
  const [submitted, setSubmitted] = useState(false)
  const [stats, setStats] = useState(() => loadStats())

  const newRound = useCallback(() => {
    setQuestions(buildRound())
    setAnswers({})
    setSubmitted(false)
  }, [])

  const select = (qIndex, choice) => {
    if (submitted) return
    setAnswers((a) => ({ ...a, [qIndex]: choice }))
  }

  const submit = () => {
    let score = 0
    questions.forEach((q, qi) => {
      if (answers[qi] === q.correct) score += 1
    })
    const prev = loadStats()
    const best = Math.max(prev.best ?? 0, score)
    const next = {
      best,
      lastScore: score,
      lastAt: Date.now(),
      rounds: (prev.rounds ?? 0) + 1,
    }
    saveStats(next)
    setStats(next)
    setSubmitted(true)
  }

  const allAnswered = questions.every((_, qi) => answers[qi] !== undefined)

  return (
    <section id="quiz" className="section quiz-section">
      <h2 className="section-title">Mini quiz 🎮</h2>
      <p className="section-lead">
        Tres preguntas al azar de <strong>{QUIZ_QUESTION_COUNT}</strong> (Hello Kitty, K-pop, K-drama, terror,
        anime…). Opciones barajadas. Mejor marca: <strong>{stats.best ?? 0}/3</strong>.
      </p>

      <div className="card quiz-card">
        {questions.map((q, qi) => (
          <fieldset key={q.id} className="quiz-q">
            <legend className="quiz-q__legend">
              <span className="quiz-q__cat">{q.category}</span>
              <span className="quiz-q__text">{q.q}</span>
            </legend>
            <div className="quiz-options">
              {q.options.map((opt, oi) => {
                const picked = answers[qi] === oi
                const show = submitted
                const correct = oi === q.correct
                const wrong = show && picked && !correct
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`quiz-opt ${picked ? 'quiz-opt--picked' : ''} ${show && correct ? 'quiz-opt--correct' : ''} ${wrong ? 'quiz-opt--wrong' : ''}`}
                    onClick={() => select(qi, oi)}
                    disabled={submitted}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}

        <div className="quiz-actions">
          {!submitted ? (
            <button type="button" className="btn-primary" disabled={!allAnswered} onClick={submit}>
              Ver resultado
            </button>
          ) : (
            <>
              <p className="quiz-result" role="status">
                Puntuación: <strong>{stats.lastScore}/3</strong>
                {stats.lastScore === 3 ? ' — ¡perfecto! 💜' : ' — sigue practicando ✨'}
              </p>
              <button type="button" className="btn-secondary" onClick={newRound}>
                Otras 3 al azar 🎲
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
