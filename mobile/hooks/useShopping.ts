// ============================================================
// mobile/hooks/useShopping.ts
// Data-fetching hook for the shopping list
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { getShoppingList } from '../lib/api'
import { ShoppingListItem } from '../types'

export function useShopping() {
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setItems(await getShoppingList())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const unchecked = items.filter(i => !i.is_checked)
  const checked = items.filter(i => i.is_checked)

  return { items, unchecked, checked, loading, error, refetch: fetch }
}