// ============================================================
// mobile/lib/api/shopping.ts
// Shopping list — manual + auto-generated from low stock
// ============================================================
import { supabase } from '../supabase'
import { ShoppingListItem } from '../../types'
import { getLowStockItems } from './items'

// ── READ ─────────────────────────────────────────────────────

export async function getShoppingList(): Promise<ShoppingListItem[]> {
  const { data, error } = await supabase
    .from('shopping_list')
    .select('*, categories(id, name, icon)')
    .order('is_checked')   // unchecked first
    .order('created_at')
  if (error) throw error
  return data as ShoppingListItem[]
}

// ── CREATE ───────────────────────────────────────────────────

export async function addShoppingItem(
  item: Pick<ShoppingListItem, 'item_name' | 'quantity' | 'unit' | 'category_id'>
): Promise<ShoppingListItem> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('shopping_list')
    .insert({ ...item, user_id: user?.id, is_auto_generated: false })
    .select()
    .single()
  if (error) throw error
  return data
}

// Auto-generate shopping list entries from all low/out-of-stock items
export async function generateShoppingList(): Promise<ShoppingListItem[]> {
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
  return data as ShoppingListItem[]
}

// ── UPDATE ───────────────────────────────────────────────────

export async function toggleShoppingItem(
  id: string, is_checked: boolean
): Promise<ShoppingListItem> {
  const { data, error } = await supabase
    .from('shopping_list')
    .update({ is_checked })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── DELETE ───────────────────────────────────────────────────

export async function deleteShoppingItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('shopping_list')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function clearCheckedItems(): Promise<void> {
  const { error } = await supabase
    .from('shopping_list')
    .delete()
    .eq('is_checked', true)
  if (error) throw error
}