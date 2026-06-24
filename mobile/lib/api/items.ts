// ============================================================
// mobile/lib/api/items.ts
// All CRUD operations for inventory items
// ============================================================
import { supabase } from '../supabase'
import { Item, ItemWithStatus } from '../../types'
import { getStockStatus, getExpiryStatus } from '../helpers'

// Attach computed status fields to a raw item
function withStatus(item: Item): ItemWithStatus {
  return {
    ...item,
    stockStatus: getStockStatus(item.quantity, item.low_stock_threshold),
    expiryStatus: getExpiryStatus(item.expiry_date),
  }
}

// Reusable select string with joined tables
const ITEM_SELECT = `
  *,
  categories(id, name, icon),
  storage_locations(id, name, icon)
`

// ── READ ────────────────────────────────────────────────────

export async function getAllItems(): Promise<ItemWithStatus[]> {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .order('name')
  if (error) throw error
  return (data as Item[]).map(withStatus)
}

export async function getItemById(id: string): Promise<ItemWithStatus> {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .eq('id', id)
    .single()
  if (error) throw error
  return withStatus(data as Item)
}

export async function getItemsByLocation(locationId: string): Promise<ItemWithStatus[]> {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .eq('storage_location_id', locationId)
    .order('name')
  if (error) throw error
  return (data as Item[]).map(withStatus)
}

export async function getLowStockItems(): Promise<ItemWithStatus[]> {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .order('name')
  if (error) throw error
  return (data as Item[])
    .map(withStatus)
    .filter(i => i.stockStatus === 'low' || i.stockStatus === 'out')
}

export async function getExpiringItems(withinDays = 3): Promise<ItemWithStatus[]> {
  const future = new Date()
  future.setDate(future.getDate() + withinDays)
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .not('expiry_date', 'is', null)
    .lte('expiry_date', future.toISOString().split('T')[0])
    .order('expiry_date')
  if (error) throw error
  return (data as Item[]).map(withStatus)
}

export async function searchItems(query: string): Promise<ItemWithStatus[]> {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .ilike('name', `%${query}%`)
    .order('name')
  if (error) throw error
  return (data as Item[]).map(withStatus)
}

// ── CREATE ───────────────────────────────────────────────────

export async function addItem(item: Partial<Item>): Promise<Item> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('items')
    .insert({ ...item, user_id: user?.id })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── UPDATE ───────────────────────────────────────────────────

export async function updateItem(id: string, updates: Partial<Item>): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateQuantity(id: string, quantity: number): Promise<Item> {
  return updateItem(id, { quantity })
}

// ── DELETE ───────────────────────────────────────────────────

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
  if (error) throw error
}