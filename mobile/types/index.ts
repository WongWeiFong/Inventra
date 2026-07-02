// mobile/types/index.ts
export interface Category { id: string; name: string; icon: string }
export interface StorageLocation { id: string; name: string; icon: string }

export interface Item {
  id: string; user_id: string; name: string
  category_id: string | null; storage_location_id: string | null
  quantity: number; unit: string | null; low_stock_threshold: number
  expiry_date: string | null; image_url: string | null; notes: string | null
  created_at: string; updated_at: string
  categories?: Category; storage_locations?: StorageLocation
}

export interface ShoppingListItem {
  id: string; user_id: string; item_name: string
  quantity: number; unit: string | null; category_id: string | null
  is_checked: boolean; is_auto_generated: boolean; created_at: string
  // Source tracking fields (from schema_stores.sql migration)
  source_store?: string | null        // e.g. "Jaya Grocer (KL East Mall)"
  source_store_chain?: string | null  // e.g. "Jaya Grocer" — for image lookup
  source_price?: number | null        // price when added
  added_from?: 'manual' | 'price_tab' | 'auto_generated' | null
  categories?: Category
}

export type StockStatus  = 'ok' | 'low' | 'out'
export type ExpiryStatus = 'fresh' | 'expiring_soon' | 'expired'

export interface ItemWithStatus extends Item {
  stockStatus: StockStatus
  expiryStatus: ExpiryStatus | null
}

export type RootTabParamList = {
  Home: undefined; Shopping: undefined; Prices: undefined
  Expiry: undefined; Profile: undefined
}

export type RootStackParamList = {
  Main: undefined; AddItem: undefined
  EditItem:        { itemId: string }
  ItemDetail:      { itemId: string }
  PriceCompare:    { query?: string; tab?: 'search' | 'promotions' }
  StoreBrowse:     { storeName: string }
  PriceItemDetail: { productName: string; storeName: string }
  Login: undefined
}