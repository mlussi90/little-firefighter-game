// Dekorativer Hintergrund: Himmel, Wolken, Sonne, Hügel und eine fahrende Feuerwehr.
export function Scenery() {
  return (
    <div className="scenery" aria-hidden>
      <div className="sun">☀️</div>
      <div className="cloud c1">☁️</div>
      <div className="cloud c2">☁️</div>
      <div className="cloud c3">☁️</div>
      <div className="hill" />
      <div className="road" />
      <div className="truck">🚒</div>
    </div>
  )
}
