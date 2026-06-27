// ============================================================
// mobile/hooks/useItems.ts
// Auto-refresh via useFocusEffect — refetches whenever screen
// comes back into focus (after Add, Edit, Delete, etc.)
// ============================================================
import { useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  getAllItems, getLowStockItems,
  getExpiringItems, getItemsByLocation,
} from '../lib/api'
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

  // Automatically refetch every time this screen is focused
  // This covers: coming back from AddItem, EditItem, ItemDetail
  useFocusEffect(
    useCallback(() => {
      fetch()
    }, [fetch])
  )

  return { items, loading, error, refetch: fetch }
}

export function useLowStockItems() {
  const [items, setItems] = useState<ItemWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      getLowStockItems().then(setItems).finally(() => setLoading(false))
    }, [])
  )

  return { items, loading }
}

export function useExpiringItems(days = 7) {
  const [items, setItems] = useState<ItemWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      getExpiringItems(days).then(setItems).finally(() => setLoading(false))
    }, [days])
  )

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

  useFocusEffect(
    useCallback(() => { fetch() }, [fetch])
  )

  return { items, loading, refetch: fetch }
}