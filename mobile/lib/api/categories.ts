// ============================================================
// mobile/lib/api/categories.ts
// Fetch product categories (e.g. Meat, Vegetables, Dairy)
// ============================================================

import { supabase } from '../supabase'
import { Category } from '../../types'

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}
