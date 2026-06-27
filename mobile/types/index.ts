// ============================================================
// mobile/types/index.ts
// ============================================================

export interface Category {
  id: string
  name: string
  icon: string
}

export interface StorageLocation {
  id: string
  name: string
  icon: string
}

export interface Item {
  id: string
  user_id: string
  name: string
  category_id: string | null
  storage_location_id: string | null
  quantity: number
  unit: string | null
  low_stock_threshold: number
  expiry_date: string | null
  image_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  categories?: Category
  storage_locations?: StorageLocation
}

export interface ShoppingListItem {
  id: string
  user_id: string
  item_name: string
  quantity: number
  unit: string | null
  category_id: string | null
  is_checked: boolean
  is_auto_generated: boolean
  created_at: string
  categories?: Category
}

export type StockStatus = 'ok' | 'low' | 'out'
export type ExpiryStatus = 'fresh' | 'expiring_soon' | 'expired'

export interface ItemWithStatus extends Item {
  stockStatus: StockStatus
  expiryStatus: ExpiryStatus | null
}

export type RootTabParamList = {
  Home: undefined
  Shopping: undefined
  Expiry: undefined
  Profile: undefined
}

export type RootStackParamList = {
  Main: undefined
  AddItem: undefined
  EditItem: { itemId: string }
  ItemDetail: { itemId: string }
  Login: undefined
  Signup: undefined
}