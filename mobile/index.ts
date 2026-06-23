import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
``

// ============================================================
// INVENTRA — SHARED TYPES
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
  expiry_date: string | null   // ISO date string YYYY-MM-DD
  image_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined fields
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

// Navigation param types
export type RootTabParamList = {
  Home: undefined
  Shopping: undefined
  AddItem: undefined
  Expiry: undefined
  Profile: undefined
}

export type RootStackParamList = {
  Main: undefined
  ItemDetail: { itemId: string }
  EditItem: { itemId: string }
  AddItem: undefined
}
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
