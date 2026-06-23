import { supabase } from './supabase'
import { Item, ShoppingListItem, ItemWithStatus, StockStatus, ExpiryStatus } from '../index'

// ============================================================
// HELPERS
// ============================================================

export function getStockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return 'out'
  if (quantity <= threshold) return 'low'
  return 'ok'
}

export function getExpiryStatus(expiryDate: string | null): ExpiryStatus | null {
  if (!expiryDate) return null
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'expired'
  if (diffDays <= 3) return 'expiring_soon'
  return 'fresh'
}

function attachStatus(item: Item): ItemWithStatus {
  return {
    ...item,
    stockStatus: getStockStatus(item.quantity, item.low_stock_threshold),
    expiryStatus: getExpiryStatus(item.expiry_date),
  }
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

// ============================================================
// STORAGE LOCATIONS
// ============================================================

export async function getStorageLocations() {
  const { data, error } = await supabase
    .from('storage_locations')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

// ============================================================
// ITEMS — CRUD
// ============================================================

export async function getAllItems(): Promise<ItemWithStatus[]> {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      categories(id, name, icon),
      storage_locations(id, name, icon)
    `)
    .order('name')
  if (error) throw error
  return (data as Item[]).map(attachStatus)
}

export async function getItemsByLocation(locationId: string): Promise<ItemWithStatus[]> {
  const { data, error } = await supabase
    .from('items')
    .select(`*, categories(id, name, icon), storage_locations(id, name, icon)`)
    .eq('storage_location_id', locationId)
    .order('name')
  if (error) throw error
  return (data as Item[]).map(attachStatus)
}

export async function getLowStockItems(): Promise<ItemWithStatus[]> {
  const { data, error } = await supabase
    .from('items')
    .select(`*, categories(id, name, icon), storage_locations(id, name, icon)`)
    .order('name')
  if (error) throw error
  return (data as Item[])
    .map(attachStatus)
    .filter(i => i.stockStatus === 'low' || i.stockStatus === 'out')
}

export async function getExpiringItems(withinDays = 3): Promise<ItemWithStatus[]> {
  const today = new Date()
  const future = new Date()
  future.setDate(today.getDate() + withinDays)

  const { data, error } = await supabase
    .from('items')
    .select(`*, categories(id, name, icon), storage_locations(id, name, icon)`)
    .not('expiry_date', 'is', null)
    .lte('expiry_date', future.toISOString().split('T')[0])
    .order('expiry_date')
  if (error) throw error
  return (data as Item[]).map(attachStatus)
}

export async function searchItems(query: string): Promise<ItemWithStatus[]> {
  const { data, error } = await supabase
    .from('items')
    .select(`*, categories(id, name, icon), storage_locations(id, name, icon)`)
    .ilike('name', `%${query}%`)
    .order('name')
  if (error) throw error
  return (data as Item[]).map(attachStatus)
}

export async function getItemById(id: string): Promise<ItemWithStatus> {
  const { data, error } = await supabase
    .from('items')
    .select(`*, categories(id, name, icon), storage_locations(id, name, icon)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return attachStatus(data as Item)
}

export async function addItem(item: Partial<Item>) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('items')
    .insert({ ...item, user_id: user?.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateItem(id: string, updates: Partial<Item>) {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateQuantity(id: string, quantity: number) {
  return updateItem(id, { quantity })
}

export async function deleteItem(id: string) {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ============================================================
// SHOPPING LIST
// ============================================================

export async function getShoppingList(): Promise<ShoppingListItem[]> {
  const { data, error } = await supabase
    .from('shopping_list')
    .select(`*, categories(id, name, icon)`)
    .order('is_checked')
    .order('created_at')
  if (error) throw error
  return data as ShoppingListItem[]
}

export async function addToShoppingList(item: Partial<ShoppingListItem>) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('shopping_list')
    .insert({ ...item, user_id: user?.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleShoppingItem(id: string, is_checked: boolean) {
  const { data, error } = await supabase
    .from('shopping_list')
    .update({ is_checked })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteShoppingItem(id: string) {
  const { error } = await supabase
    .from('shopping_list')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function clearCheckedItems() {
  const { error } = await supabase
    .from('shopping_list')
    .delete()
    .eq('is_checked', true)
  if (error) throw error
}

// Auto-generate shopping list from low stock items
export async function generateShoppingList() {
  const lowItems = await getLowStockItems()
  if (lowItems.length === 0) return []

  const { data: { user } } = await supabase.auth.getUser()

  const entries = lowItems.map(item => ({
    user_id: user?.id,
    item_name: item.name,
    quantity: item.low_stock_threshold,
    unit: item.unit,
    category_id: item.category_id,
    is_auto_generated: true,
    is_checked: false,
  }))

  const { data, error } = await supabase
    .from('shopping_list')
    .insert(entries)
    .select()
  if (error) throw error
  return data
}