import { useEffect, useState } from 'react'

// Minimaler Hash-Router: funktioniert ohne Server-Konfiguration (auch beim späteren Hosting).
export function useRoute(): string {
  const [hash, setHash] = useState(() => location.hash.slice(1) || '/')
  useEffect(() => {
    const on = () => setHash(location.hash.slice(1) || '/')
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

export const navigate = (path: string) => {
  location.hash = path
}
