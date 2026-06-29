// ============================================================
// mobile/screens/PriceCompareScreen.tsx
// Full price comparison screen — search any product and see
// prices from every store side by side, cheapest highlighted.
// Also shows current promotions tab.
// ============================================================
import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Image,
  ScrollView, Linking,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { comparePrices, getPromotions, CompareProduct, Promotion } from '../lib/api/price'

type Tab = 'search' | 'promotions'

export default function PriceCompareScreen() {
  const nav   = useNavigation()
  const route = useRoute<any>()

  const [tab,        setTab]        = useState<Tab>('search')
  const [query,      setQuery]      = useState(route.params?.query ?? '')
  const [results,    setResults]    = useState<CompareProduct[]>([])
  const [promos,     setPromos]     = useState<Promotion[]>([])
  const [loading,    setLoading]    = useState(false)
  const [promoLoad,  setPromoLoad]  = useState(false)
  const [searched,   setSearched]   = useState(false)

  // Auto-search if navigated with a query param (from shopping list)
  useEffect(() => {
    if (route.params?.query) handleSearch(route.params.query)
  }, [])

  // Load promotions when switching to that tab
  useEffect(() => {
    if (tab === 'promotions' && promos.length === 0) {
      setPromoLoad(true)
      getPromotions().then(setPromos).finally(() => setPromoLoad(false))
    }
  }, [tab])

  async function handleSearch(q?: string) {
    const searchTerm = (q ?? query).trim()
    if (!searchTerm) return
    setLoading(true)
    setSearched(true)
    setResults([])
    try {
      const data = await comparePrices(searchTerm)
      setResults(data)
    } catch (e: any) {
      console.error('Price compare error:', e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Render one compared product ───────────────────────────
  function renderProduct({ item }: { item: CompareProduct }) {
    return (
      <View style={s.productCard}>
        {/* Product header */}
        <View style={s.productHeader}>
          {item.image_url && (
            <Image source={{ uri: item.image_url }} style={s.productImage} />
          )}
          <View style={s.productInfo}>
            <Text style={s.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={s.productMeta}>
              {item.stores.length} store{item.stores.length > 1 ? 's' : ''} found
              {item.price_range && item.price_range.min !== item.price_range.max
                ? `  ·  RM ${item.price_range.min.toFixed(2)} – RM ${item.price_range.max.toFixed(2)}`
                : ''}
            </Text>
          </View>
        </View>

        {/* Store price rows */}
        {item.stores.map((store, i) => (
          <TouchableOpacity
            key={i}
            style={[s.storeRow, store.cheapest && s.storeRowCheapest]}
            onPress={() => store.product_url && Linking.openURL(store.product_url)}
            activeOpacity={store.product_url ? 0.7 : 1}
          >
            <View style={s.storeLeft}>
              {store.cheapest && <Text style={s.cheapestBadge}>Cheapest</Text>}
              <Text style={[s.storeName, store.cheapest && s.storeNameCheapest]}>
                {store.store}
              </Text>
              {store.is_promotion && (
                <Text style={s.promoLabel}>🏷 {store.discount_pct}% off</Text>
              )}
            </View>
            <View style={s.storeRight}>
              <Text style={[s.storePrice, store.cheapest && s.storePriceCheapest]}>
                RM {store.price.toFixed(2)}
              </Text>
              {store.original_price && store.original_price > store.price && (
                <Text style={s.originalPrice}>
                  RM {store.original_price.toFixed(2)}
                </Text>
              )}
              {store.product_url && (
                <Text style={s.viewLink}>View →</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  // ── Render one promotion ──────────────────────────────────
  function renderPromo({ item }: { item: Promotion }) {
    return (
      <TouchableOpacity
        style={s.promoCard}
        onPress={() => item.product_url && Linking.openURL(item.product_url)}
        activeOpacity={0.75}
      >
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={s.promoImage} />
        )}
        <View style={s.promoInfo}>
          <Text style={s.promoName} numberOfLines={2}>{item.product_name}</Text>
          <Text style={s.promoStore}>{item.store_name}</Text>
          <View style={s.priceRow}>
            <Text style={s.promoPrice}>RM {item.price.toFixed(2)}</Text>
            <Text style={s.promoOriginal}>RM {item.original_price.toFixed(2)}</Text>
          </View>
          <View style={s.savingsBadge}>
            <Text style={s.savingsText}>Save RM {item.savings} · {item.discount_pct}% off</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={s.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Price Compare</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, tab === 'search' && s.tabActive]}
          onPress={() => setTab('search')}
        >
          <Text style={[s.tabLabel, tab === 'search' && s.tabLabelActive]}>🔍 Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === 'promotions' && s.tabActive]}
          onPress={() => setTab('promotions')}
        >
          <Text style={[s.tabLabel, tab === 'promotions' && s.tabLabelActive]}>🏷 Promotions</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search tab ── */}
      {tab === 'search' && (
        <View style={{ flex: 1 }}>
          <View style={s.searchRow}>
            <TextInput
              style={s.searchInput}
              placeholder="Search any product..."
              placeholderTextColor="#AAA"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => handleSearch()}
              returnKeyType="search"
              autoFocus={!route.params?.query}
            />
            <TouchableOpacity
              style={[s.searchBtn, !query.trim() && s.searchBtnDisabled]}
              onPress={() => handleSearch()}
              disabled={!query.trim()}
            >
              <Text style={s.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="large" color="#4A42B0" />
              <Text style={s.loadingText}>Comparing prices...</Text>
            </View>
          )}

          {!loading && searched && results.length === 0 && (
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>🔍</Text>
              <Text style={s.emptyTitle}>No results found</Text>
              <Text style={s.emptySub}>
                Try a different search term or check that the scraper has run recently
              </Text>
            </View>
          )}

          {!loading && !searched && (
            <View style={s.hintWrap}>
              <Text style={s.hintIcon}>💰</Text>
              <Text style={s.hintTitle}>Compare grocery prices</Text>
              <Text style={s.hintSub}>Search any product to see prices across Jaya Grocer, Lotus's, and more</Text>
              {/* Quick search suggestions */}
              <View style={s.suggestions}>
                {['chicken', 'eggs', 'rice', 'milk', 'cooking oil', 'shampoo'].map(term => (
                  <TouchableOpacity
                    key={term}
                    style={s.suggestion}
                    onPress={() => { setQuery(term); handleSearch(term) }}
                  >
                    <Text style={s.suggestionText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {!loading && results.length > 0 && (
            <FlatList
              data={results}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={s.list}
              renderItem={renderProduct}
              ListHeaderComponent={
                <Text style={s.resultCount}>
                  {results.length} product{results.length > 1 ? 's' : ''} found for "{query}"
                </Text>
              }
            />
          )}
        </View>
      )}

      {/* ── Promotions tab ── */}
      {tab === 'promotions' && (
        <View style={{ flex: 1 }}>
          {promoLoad
            ? <View style={s.loadingWrap}>
                <ActivityIndicator size="large" color="#4A42B0" />
                <Text style={s.loadingText}>Loading promotions...</Text>
              </View>
            : <FlatList
                data={promos}
                keyExtractor={(_, i) => String(i)}
                contentContainerStyle={s.list}
                numColumns={2}
                columnWrapperStyle={{ gap: 10 }}
                renderItem={renderPromo}
                ListHeaderComponent={
                  promos.length > 0
                    ? <Text style={s.resultCount}>{promos.length} active promotions</Text>
                    : null
                }
                ListEmptyComponent={
                  <View style={s.emptyWrap}>
                    <Text style={s.emptyIcon}>🏷</Text>
                    <Text style={s.emptyTitle}>No promotions found</Text>
                    <Text style={s.emptySub}>Run the scraper to fetch the latest promotions</Text>
                  </View>
                }
              />
          }
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F6' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8',
  },
  back:  { fontSize: 16, color: '#4A42B0' },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  tabs: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8',
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4A42B0' },
  tabLabel: { fontSize: 14, color: '#888', fontWeight: '500' },
  tabLabelActive: { color: '#4A42B0', fontWeight: '700' },
  searchRow: {
    flexDirection: 'row', padding: 16, gap: 10,
    backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0',
  },
  searchInput: {
    flex: 1, backgroundColor: '#F4F4F4', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
  },
  searchBtn: { backgroundColor: '#4A42B0', paddingHorizontal: 18, borderRadius: 12, justifyContent: 'center' },
  searchBtnDisabled: { backgroundColor: '#C0BDEA' },
  searchBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#888' },
  emptyWrap: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#333' },
  emptySub: { fontSize: 13, color: '#888', marginTop: 6, textAlign: 'center', lineHeight: 20 },
  hintWrap: { flex: 1, alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 },
  hintIcon: { fontSize: 52, marginBottom: 14 },
  hintTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  hintSub: { fontSize: 13, color: '#888', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20, justifyContent: 'center' },
  suggestion: {
    backgroundColor: '#EEEDFE', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
  },
  suggestionText: { fontSize: 13, color: '#4A42B0', fontWeight: '500' },
  list: { padding: 16, paddingBottom: 100 },
  resultCount: { fontSize: 13, color: '#888', marginBottom: 12 },
  // Product cards
  productCard: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 14,
    borderWidth: 0.5, borderColor: '#E4E4E4', overflow: 'hidden',
  },
  productHeader: { flexDirection: 'row', gap: 12, padding: 14 },
  productImage: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#F4F4F4' },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  productMeta: { fontSize: 12, color: '#888' },
  storeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderTopWidth: 0.5, borderTopColor: '#F0F0F0',
  },
  storeRowCheapest: { backgroundColor: '#F0FBF0' },
  storeLeft: { flex: 1 },
  cheapestBadge: {
    fontSize: 10, fontWeight: '700', color: '#27500A',
    backgroundColor: '#EAF3DE', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6, alignSelf: 'flex-start', marginBottom: 3,
  },
  storeName: { fontSize: 13, color: '#555', fontWeight: '500' },
  storeNameCheapest: { color: '#1A1A1A', fontWeight: '700' },
  promoLabel: { fontSize: 11, color: '#993556', marginTop: 2 },
  storeRight: { alignItems: 'flex-end', gap: 2 },
  storePrice: { fontSize: 15, fontWeight: '600', color: '#333' },
  storePriceCheapest: { fontSize: 16, fontWeight: '800', color: '#1D9E75' },
  originalPrice: { fontSize: 12, color: '#AAA', textDecorationLine: 'line-through' },
  viewLink: { fontSize: 11, color: '#4A42B0' },
  // Promo cards
  promoCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    borderWidth: 0.5, borderColor: '#E4E4E4', marginBottom: 10,
  },
  promoImage: { width: '100%', height: 120, backgroundColor: '#F4F4F4' },
  promoInfo: { padding: 10 },
  promoName: { fontSize: 12, fontWeight: '600', color: '#1A1A1A', marginBottom: 3 },
  promoStore: { fontSize: 11, color: '#888', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  promoPrice: { fontSize: 14, fontWeight: '700', color: '#1D9E75' },
  promoOriginal: { fontSize: 12, color: '#AAA', textDecorationLine: 'line-through' },
  savingsBadge: { backgroundColor: '#FBEAF0', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, marginTop: 5, alignSelf: 'flex-start' },
  savingsText: { fontSize: 10, color: '#993556', fontWeight: '600' },
})
