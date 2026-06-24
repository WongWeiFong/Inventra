// import { apiRequest } from './backend'
// import { Item, ShoppingListItem, ItemWithStatus, StockStatus, ExpiryStatus } from '../index'

// // ============================================================
// // HELPERS
// // ============================================================

// export function getStockStatus(quantity: number, threshold: number): StockStatus {
//   if (quantity <= 0) return 'out'
//   if (quantity <= threshold) return 'low'
//   return 'ok'
// }

// export function getExpiryStatus(expiryDate: string | null): ExpiryStatus | null {
//   if (!expiryDate) return null
//   const today = new Date()
//   const expiry = new Date(expiryDate)
//   const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
//   if (diffDays < 0) return 'expired'
//   if (diffDays <= 3) return 'expiring_soon'
//   return 'fresh'
// }

// function attachStatus(item: Item): ItemWithStatus {
//   return {
//     ...item,
//     stockStatus: getStockStatus(item.quantity, item.low_stock_threshold),
//     expiryStatus: getExpiryStatus(item.expiry_date),
//   }
// }

// // ============================================================
// // CATEGORIES
// // ============================================================

// export async function getCategories() {
//   return apiRequest('/api/categories')
// }

// // ============================================================
// // STORAGE LOCATIONS
// // ============================================================

// export async function getStorageLocations() {
//   return apiRequest('/api/storage-locations')
// }

// // ============================================================
// // ITEMS — CRUD
// // ============================================================

// export async function getAllItems(): Promise<ItemWithStatus[]> {
//   const data = await apiRequest<Item[]>('/api/items')
//   return data.map(attachStatus)
// }

// export async function getItemsByLocation(locationId: string): Promise<ItemWithStatus[]> {
//   const data = await apiRequest<Item[]>(`/api/items/location/${encodeURIComponent(locationId)}`)
//   return data.map(attachStatus)
// }

// export async function getLowStockItems(): Promise<ItemWithStatus[]> {
//   const data = await apiRequest<Item[]>('/api/items/low-stock')
//   return data.map(attachStatus)
// }

// export async function getExpiringItems(withinDays = 3): Promise<ItemWithStatus[]> {
//   const data = await apiRequest<Item[]>(`/api/items/expiring?withinDays=${withinDays}`)
//   return data.map(attachStatus)
// }

// export async function searchItems(query: string): Promise<ItemWithStatus[]> {
//   const data = await apiRequest<Item[]>(`/api/items/search?q=${encodeURIComponent(query)}`)
//   return data.map(attachStatus)
// }

// export async function getItemById(id: string): Promise<ItemWithStatus> {
//   const data = await apiRequest<Item>(`/api/items/${id}`)
//   return attachStatus(data)
// }

// export async function addItem(item: Partial<Item>) {
//   return apiRequest<Item>('/api/items', {
//     method: 'POST',
//     body: item,
//   })
// }

// export async function updateItem(id: string, updates: Partial<Item>) {
//   return apiRequest<Item>(`/api/items/${id}`, {
//     method: 'PATCH',
//     body: updates,
//   })
// }

// export async function updateQuantity(id: string, quantity: number) {
//   return updateItem(id, { quantity })
// }

// export async function deleteItem(id: string) {
//   await apiRequest<void>(`/api/items/${id}`, {
//     method: 'DELETE',
//   })
// }

// // ============================================================
// // SHOPPING LIST
// // ============================================================

// export async function getShoppingList(): Promise<ShoppingListItem[]> {
//   return apiRequest<ShoppingListItem[]>('/api/shopping-list')
// }

// export async function addToShoppingList(item: Partial<ShoppingListItem>) {
//   return apiRequest<ShoppingListItem>('/api/shopping-list', {
//     method: 'POST',
//     body: item,
//   })
// }

// export async function toggleShoppingItem(id: string, is_checked: boolean) {
//   return apiRequest<ShoppingListItem>(`/api/shopping-list/${id}`, {
//     method: 'PATCH',
//     body: { is_checked },
//   })
// }

// export async function deleteShoppingItem(id: string) {
//   await apiRequest<void>(`/api/shopping-list/${id}`, {
//     method: 'DELETE',
//   })
// }

// export async function clearCheckedItems() {
//   await apiRequest<void>('/api/shopping-list/checked', {
//     method: 'DELETE',
//   })
// }

// // Auto-generate shopping list from low stock items
// export async function generateShoppingList() {
//   return apiRequest<ShoppingListItem[]>('/api/shopping-list/generate', {
//     method: 'POST',
//   })
// }