// ============================================================
// mobile/screens/StoreBrowseScreen.tsx
// SCREEN 2 — Browse all items within one store.
// Has its own search bar (search within store), infinite scroll
// pagination, and tapping an item goes to PriceItemDetailScreen.
// ============================================================
import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Image, ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { browseStore, PriceResult } from '../lib/api/price'

export default function StoreBrowseScreen() {
  const nav   = useNavigation<any>()
  const route = useRoute<any>()
  const { storeName } = route.params

  const [query,      setQuery]      = useState('')
  const [debounced,  setDebounced]  = useState('')
  const [items,      setItems]      = useState<PriceResult[]>([])
  const [page,       setPage]       = useState(1)
  const [hasMore,    setHasMore]    = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [loadingMore,setLoadingMore]= useState(false)
  const [error,      setError]      = useState<string | null>(null)

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 350)
    return () => clearTimeout(t)
  }, [query])

  // Initial load + reload whenever search term changes
  useEffect(() => {
    setLoading(true)
    setError(null)
    setPage(1)
    browseStore(storeName, debounced || undefined, 1)
      .then(res => {
        setItems(res.results)
        setHasMore(res.has_more)
        setTotalCount(res.total_count)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [debounced, storeName])

  // Load next page — infinite scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await browseStore(storeName, debounced || undefined, nextPage)
      setItems(prev => [...prev, ...res.results])
      setHasMore(res.has_more)
      setPage(nextPage)
    } catch {
      // silently fail on pagination errors — user can keep scrolling/retry
    } finally {
      setLoadingMore(false)
    }
  }, [page, hasMore, loading, loadingMore, debounced, storeName])

  function renderItem({ item }: { item: PriceResult }) {
    return (
      <TouchableOpacity
        style={s.itemRow}
        activeOpacity={0.75}
        onPress={() => nav.navigate('PriceItemDetail', {
          productName: item.product_name,
          storeName:   item.store_name,
        })}
      >
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={s.itemImage} />
        ) : (
          <View style={[s.itemImage, s.itemImagePlaceholder]}>
            <Text style={{ fontSize: 18 }}>🛒</Text>
          </View>
        )}

        <View style={s.itemInfo}>
          <Text style={s.itemName} numberOfLines={2}>{item.product_name}</Text>
          <View style={s.priceRow}>
            <Text style={s.itemPrice}>RM {item.price.toFixed(2)}</Text>
            {item.is_promotion && item.original_price && (
              <Text style={s.itemOriginal}>RM {item.original_price.toFixed(2)}</Text>
            )}
          </View>
          {item.is_promotion && (
            <View style={s.promoTag}>
              <Text style={s.promoTagText}>🏷 {item.discount_pct}% off</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={s.addBtn}
          onPress={() => nav.navigate('PriceItemDetail', {
            productName: item.product_name,
            storeName:   item.store_name,
          })}
        >
          {/* NOTE: PriceItemDetailScreen is built in the next step.
              This button is wired now so no further changes needed later. */}
          <Text style={s.addBtnText}>＋</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={s.back}>‹ Stores</Text>
        </TouchableOpacity>
        <Text style={s.title} numberOfLines={1}>{storeName}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Search within store */}
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder={`Search in ${storeName}...`}
          placeholderTextColor="#AAA"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={s.clearBtn}>
            <Text style={s.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {!loading && !error && (
        <Text style={s.resultCount}>
          {totalCount.toLocaleString()} item{totalCount !== 1 ? 's' : ''}
          {debounced ? ` matching "${debounced}"` : ''}
        </Text>
      )}

      {/* Content */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#4A42B0" />
      ) : error ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>⚠️</Text>
          <Text style={s.emptyTitle}>Couldn't load items</Text>
          <Text style={s.emptySub}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>🔍</Text>
          <Text style={s.emptyTitle}>No items found</Text>
          <Text style={s.emptySub}>
            {debounced ? `Nothing matches "${debounced}"` : 'This store has no items yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => `${item.product_name}-${i}`}
          contentContainerStyle={s.list}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 16 }} color="#4A42B0" />
            ) : !hasMore && items.length > 0 ? (
              <Text style={s.endText}>You've reached the end</Text>
            ) : null
          }
        />
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
  back: { fontSize: 15, color: '#4A42B0', width: 60 },
  title: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', flex: 1, textAlign: 'center' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
  },
  searchInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    borderWidth: 0.5, borderColor: '#E4E4E4',
  },
  clearBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEE',
    alignItems: 'center', justifyContent: 'center',
  },
  clearBtnText: { fontSize: 13, color: '#888' },
  resultCount: { fontSize: 12, color: '#AAA', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 10,
    marginBottom: 8, borderWidth: 0.5, borderColor: '#E4E4E4',
  },
  itemImage: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#F4F4F4' },
  itemImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13.5, fontWeight: '500', color: '#1A1A1A', marginBottom: 4, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#1D9E75' },
  itemOriginal: { fontSize: 12, color: '#AAA', textDecorationLine: 'line-through' },
  promoTag: {
    backgroundColor: '#FBEAF0', alignSelf: 'flex-start',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 4,
  },
  promoTagText: { fontSize: 10, color: '#993556', fontWeight: '600' },
  addBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#4A42B0', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  addBtnText: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: -2 },
  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  emptySub: { fontSize: 13, color: '#888', marginTop: 6, textAlign: 'center', lineHeight: 19 },
  endText: { textAlign: 'center', fontSize: 12, color: '#BBB', paddingVertical: 16 },
})