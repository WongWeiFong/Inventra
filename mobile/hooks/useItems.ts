// ============================================================
// mobile/hooks/useItems.ts
// Data-fetching hook for inventory items
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { getAllItems, getLowStockItems, getExpiringItems, getItemsByLocation } from '../lib/api'
import { ItemWithStatus } from '../types'

export function useItems() {
  const [items, setItems] = useState<ItemWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setItems(await getAllItems())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { items, loading, error, refetch: fetch }
}

export function useLowStockItems() {
  const [items, setItems] = useState<ItemWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLowStockItems().then(setItems).finally(() => setLoading(false))
  }, [])

  return { items, loading }
}

export function useExpiringItems(days = 3) {
  const [items, setItems] = useState<ItemWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExpiringItems(days).then(setItems).finally(() => setLoading(false))
  }, [days])

  return { items, loading }
}

export function useItemsByLocation(locationId: string) {
  const [items, setItems] = useState<ItemWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    setItems(await getItemsByLocation(locationId))
    setLoading(false)
  }, [locationId])

  useEffect(() => { fetch() }, [fetch])
  return { items, loading, refetch: fetch }
}