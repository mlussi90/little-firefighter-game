import { useScore } from '../score'

export function ScoreBadge() {
  const { total, last } = useScore()
  return (
    <div className="score" aria-label={`${total} Punkte`}>
      <span key={`t${last?.id ?? 0}`} className="score-total">⭐ {total}</span>
      {last && <span key={`d${last.id}`} className="score-delta">+{last.n}</span>}
    </div>
  )
}
