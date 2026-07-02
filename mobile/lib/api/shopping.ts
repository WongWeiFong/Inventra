// ============================================================
// mobile/lib/api/shopping.ts
// Shopping list — now supports source_store, source_price,
// source_store_chain, and added_from tracking fields.
// ============================================================
import { supabase } from '../supabase'
import { ShoppingListItem } from '../../types'
import { getLowStockItems } from './items'

// ── READ ─────────────────────────────────────────────────────

export async function getShoppingList(): Promise<ShoppingListItem[]> {
  const { data, error } = await supabase
    .from('shopping_list')
    .select('*, categories(id, name, icon)')
    .order('is_checked')
    .order('created_at')
  if (error) throw error
  return data as ShoppingListItem[]
}

// ── CREATE ───────────────────────────────────────────────────

// Standard manual add (from the quick-add bar)
export async function addShoppingItem(
  item: Pick<ShoppingListItem, 'item_name' | 'quantity' | 'unit' | 'category_id'>
): Promise<ShoppingListItem> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('shopping_list')
    .insert({
      ...item,
      user_id:     user?.id,
      is_auto_generated: false,
      added_from:  'manual',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// Add from price tab — includes store source + price info
export async function addFromPriceTab(params: {
  item_name:          string
  quantity?:          number
  unit?:              string | null
  source_store?:      string       // full branch name e.g. "Jaya Grocer (KL East)"
  source_store_chain?: string      // chain name e.g. "Jaya Grocer" for image lookup
  source_price?:      number
}): Promise<ShoppingListItem> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('shopping_list')
    .insert({
      user_id:            user?.id,
      item_name:          params.item_name,
      quantity:           params.quantity ?? 1,
      unit:               params.unit ?? null,
      category_id:        null,
      is_checked:         false,
      is_auto_generated:  false,
      added_from:         'price_tab',
      source_store:       params.source_store ?? null,
      source_store_chain: params.source_store_chain ?? null,
      source_price:       params.source_price ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// Auto-generate from low stock items
export async function generateShoppingList(): Promise<ShoppingListItem[]> {
  const lowItems = await getLowStockItems()
  if (lowItems.length === 0) return []

  const { data: { user } } = await supabase.auth.getUser()
  const entries = lowItems.map(item => ({
    user_id:           user?.id,
    item_name:         item.name,
    quantity:          item.low_stock_threshold,
    unit:              item.unit,
    category_id:       item.category_id,
    is_auto_generated: true,
    is_checked:        false,
    added_from:        'auto_generated',
  }))

  const { data, error } = await supabase
    .from('shopping_list')
    .insert(entries)
    .select()
  if (error) throw error
  return data as ShoppingListItem[]
}

// ── UPDATE ───────────────────────────────────────────────────

export async function toggleShoppingItem(id: string, is_checked: boolean): Promise<ShoppingListItem> {
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
  const { error } = await supabase.from('shopping_list').delete().eq('id', id)
  if (error) throw error
}

export async function clearCheckedItems(): Promise<void> {
  const { error } = await supabase.from('shopping_list').delete().eq('is_checked', true)
  if (error) throw error
}