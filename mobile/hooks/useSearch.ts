
// ============================================================
// mobile/hooks/useSearch.ts
// Debounced search hook for inventory items
// ============================================================
import { useState, useEffect } from 'react'
import { searchItems } from '../lib/api'
import { ItemWithStatus } from '../types'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ItemWithStatus[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        setResults(await searchItems(query))
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return { query, setQuery, results, loading }
}