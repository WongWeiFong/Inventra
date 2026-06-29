// ============================================================
// mobile/lib/api/prices.ts
// All calls to the MyGroceryPricer API (Render deployment).
// Add your Render URL to mobile/.env:
//   EXPO_PUBLIC_PRICE_API_URL=https://your-app.onrender.com
// ============================================================

const BASE_URL = process.env.EXPO_PUBLIC_PRICE_API_URL //render

// ── Types ────────────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────

async function apiFetch(path: string) {
  if (!BASE_URL) throw new Error('EXPO_PUBLIC_PRICE_API_URL is not set in .env')
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)
  return res.json()
}

// ── API calls ────────────────────────────────────────────────

// Search products across all stores
export async function searchPrices(query: string, limit = 20): Promise<PriceResult[]> {
  const data = await apiFetch(
    `/api/search?q=${encodeURIComponent(query)}&limit=${limit}`
  )
  return data.results ?? []
}

// Compare prices across stores — grouped by product
// This is the main call used by PriceCompareScreen
export async function comparePrices(query: string): Promise<CompareProduct[]> {
  const data = await apiFetch(
    `/api/compare?q=${encodeURIComponent(query)}`
  )
  return data.products ?? []
}

// Quick single-item price check — used by shopping list
// Returns cheapest store + price for a given item name
export async function getCheapestPrice(
  itemName: string
): Promise<{ store: string; price: number; is_promotion: boolean } | null> {
  try {
    const products = await comparePrices(itemName)
    if (!products.length) return null
    // First result is already sorted cheapest first
    const top = products[0]
    return {
      store:        top.cheapest_store,
      price:        top.cheapest_price,
      is_promotion: top.stores[0]?.is_promotion ?? false,
    }
  } catch {
    return null  // silently fail — price hints are optional
  }
}

// All current promotions
export async function getPromotions(store?: string): Promise<Promotion[]> {
  const storeParam = store ? `&store=${encodeURIComponent(store)}` : ''
  const data = await apiFetch(`/api/promotions?limit=50${storeParam}`)
  return data.promotions ?? []
}

// Health check — confirm API is reachable
export async function checkApiHealth(): Promise<{ ok: boolean; total_products: number }> {
  try {
    const data = await apiFetch('/api/health')
    return { ok: data.status === 'ok', total_products: data.total_products ?? 0 }
  } catch {
    return { ok: false, total_products: 0 }
  }
}