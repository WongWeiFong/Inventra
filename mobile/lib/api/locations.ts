// ============================================================
// mobile/lib/api/locations.ts
// Fetch storage locations (Fridge, Freezer, 1st Floor Bathroom, 2nd Floor Cabinet)
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