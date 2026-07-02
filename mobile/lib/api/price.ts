// ============================================================
// mobile/lib/api/prices.ts
// All calls to the MyGroceryPricer API (Render deployment).
// Add your Render URL to mobile/.env:
//   EXPO_PUBLIC_PRICE_API_URL=https://your-app.onrender.com
// ============================================================

const BASE_URL = process.env.EXPO_PUBLIC_PRICE_API_URL

export interface StorePrice {
  store: string
  price: number
  original_price: number | null
  product_url: string | null
  is_promotion: boolean
  discount_pct: number | null
  cheapest: boolean
}

export interface PriceResult {
  store_name: string
  product_name: string
  description: string | null
  price: number
  original_price: number | null
  image_url: string | null
  product_url: string | null
  is_promotion: boolean
  discount_pct: number | null
}

export interface CompareProduct {
  name: string
  image_url: string | null
  scraped_at: string
  stores: StorePrice[]
  cheapest_store: string
  cheapest_price: number
  price_range: { min: number; max: number } | null
}

export interface Promotion {
  store_name: string
  product_name: string
  price: number
  original_price: number
  image_url: string | null
  product_url: string | null
  discount_pct: number
  savings: string
}

export interface StoreInfo {
  store_name: string
  display_name: string
  product_count: number
  last_scraped: string
  image_url: string | null
  banner_color: string | null
  website_url: string | null
  description: string | null
}

export interface BrowseResult {
  store: string
  page: number
  page_size: number
  total_count: number
  has_more: boolean
  results: PriceResult[]
}

async function apiFetch(path: string) {
  if (!BASE_URL) throw new Error('EXPO_PUBLIC_PRICE_API_URL is not set in .env')
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)
  return res.json()
}

export async function searchPrices(query: string, limit = 20): Promise<PriceResult[]> {
  const data = await apiFetch(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  return data.results ?? []
}

export async function comparePrices(query: string): Promise<CompareProduct[]> {
  const data = await apiFetch(`/api/compare?q=${encodeURIComponent(query)}`)
  return data.products ?? []
}

export async function getCheapestPrice(
  itemName: string
): Promise<{ store: string; price: number; is_promotion: boolean } | null> {
  try {
    const products = await comparePrices(itemName)
    if (!products.length) return null
    const top = products[0]
    return {
      store:        top.cheapest_store,
      price:        top.cheapest_price,
      is_promotion: top.stores[0]?.is_promotion ?? false,
    }
  } catch {
    return null
  }
}

export async function getPromotions(store?: string): Promise<Promotion[]> {
  const storeParam = store ? `&store=${encodeURIComponent(store)}` : ''
  const data = await apiFetch(`/api/promotions?limit=50${storeParam}`)
  return data.promotions ?? []
}

export async function getStores(): Promise<StoreInfo[]> {
  const data = await apiFetch('/api/stores')
  return data.stores ?? []
}

export async function browseStore(
  storeName: string,
  query?: string,
  page = 1
): Promise<BrowseResult> {
  const qParam = query ? `&q=${encodeURIComponent(query)}` : ''
  return apiFetch(`/api/browse?store=${encodeURIComponent(storeName)}&page=${page}${qParam}`)
}

export async function checkApiHealth(): Promise<{ ok: boolean; total_products: number }> {
  try {
    const data = await apiFetch('/api/health')
    return { ok: data.status === 'ok', total_products: data.total_products ?? 0 }
  } catch {
    return { ok: false, total_products: 0 }
  }
}