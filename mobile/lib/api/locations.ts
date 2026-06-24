// ============================================================
// mobile/lib/api/locations.ts
// Fetch storage locations (Pantry, Fridge, Freezer, Bathroom)
// ============================================================
import { supabase } from '../supabase'
import { StorageLocation } from '../../types'

export async function getStorageLocations(): Promise<StorageLocation[]> {
  const { data, error } = await supabase
    .from('storage_locations')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}