// ============================================================
// mobile/screens/PricesScreen.tsx — Store list with images
// ============================================================
import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Image,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { getStores, StoreInfo } from '../lib/api/price'

// Group branches under one parent store chain
function groupByChain(stores: StoreInfo[]) {
  const groups: Record<string, {
    totalCount: number; branches: StoreInfo[];
    lastScraped: string; meta: StoreInfo
  }> = {}

  for (const s of stores) {
    const chainName = s.store_name.split('(')[0].trim()
    if (!groups[chainName]) {
      groups[chainName] = { totalCount: 0, branches: [], lastScraped: s.last_scraped, meta: s }
    }
    groups[chainName].totalCount += s.product_count
    groups[chainName].branches.push(s)
    if (new Date(s.last_scraped) > new Date(groups[chainName].lastScraped)) {
      groups[chainName].lastScraped = s.last_scraped
    }
  }

  return Object.entries(groups).map(([name, info]) => ({
    chainName: name,
    ...info,
  }))
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const hours  = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1)  return 'Updated just now'
  if (hours < 24) return `Updated ${hours}h ago`
  return `Updated ${Math.floor(hours / 24)}d ago`
}

export default function PricesScreen() {
  const nav = useNavigation<any>()
  const [stores,  setStores]  = useState<ReturnType<typeof groupByChain>>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [query,   setQuery]   = useState('')

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      setError(null)
      getStores()
        .then(data => setStores(groupByChain(data)))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }, [])
  )

  function handleSearch() {
    if (!query.trim()) return
    nav.navigate('PriceCompare', { query: query.trim() })
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Grocery prices</Text>
        <Text style={s.sub}>Compare prices across Malaysian stores</Text>
      </View>

      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search any product across all stores..."
          placeholderTextColor="#AAA"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={[s.searchBtn, !query.trim() && s.searchBtnDisabled]}
          onPress={handleSearch}
          disabled={!query.trim()}
        >
          <Text style={s.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={s.promoBanner}
        onPress={() => nav.navigate('PriceCompare', { tab: 'promotions' })}
      >
        <Text style={s.promoIcon}>🏷</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.promoTitle}>Current promotions</Text>
          <Text style={s.promoSub}>See what's on sale right now</Text>
        </View>
        <Text style={s.promoArrow}>→</Text>
      </TouchableOpacity>

      <Text style={s.sectionLabel}>Browse by store</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4A42B0" />
      ) : error ? (
        <View style={s.errorBox}>
          <Text style={s.errorIcon}>⚠️</Text>
          <Text style={s.errorText}>Couldn't load stores</Text>
          <Text style={s.errorSub}>{error}</Text>
          <Text style={s.errorHint}>Server may be waking up — try again in 30 seconds.</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={item => item.chainName}
          contentContainerStyle={s.list}
          renderItem={({ item }) => {
            const { meta } = item
            const bannerColor = meta.banner_color || '#4A42B0'
            return (
              <TouchableOpacity
                style={s.storeCard}
                onPress={() => nav.navigate('StoreBrowse', { storeName: item.chainName })}
                activeOpacity={0.85}
              >
                {/* Banner — shows image_url if set, otherwise colored fallback */}
                <View style={[s.banner, { backgroundColor: bannerColor }]}>
                  {meta.image_url ? (
                    <Image
                      source={{ uri: meta.image_url }}
                      style={s.bannerImage}
                      resizeMode="cover"
                    />
                  ) : (
                    // Fallback until you add an image_url in Supabase
                    <View style={s.bannerFallback}>
                      <Text style={s.bannerFallbackText}>
                        {item.chainName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </Text>
                      <Text style={s.bannerFallbackSub}>Tap to add store image in Supabase</Text>
                    </View>
                  )}
                  {/* Overlay gradient effect — dark band at bottom for readability */}
                  <View style={s.bannerOverlay} />
                  {/* Store name overlaid on banner */}
                  <Text style={s.bannerStoreName}>{item.chainName}</Text>
                </View>

                {/* Info row below banner */}
                <View style={s.storeInfoRow}>
                  <View style={s.storeInfo}>
                    {meta.description && (
                      <Text style={s.storeDesc} numberOfLines={1}>{meta.description}</Text>
                    )}
                    <Text style={s.storeMeta}>
                      {item.branches.length > 1 ? `${item.branches.length} branches · ` : ''}
                      {item.totalCount.toLocaleString()} items
                    </Text>
                    <Text style={s.storeUpdated}>{timeAgo(item.lastScraped)}</Text>
                  </View>
                  <View style={[s.browseBtn, { backgroundColor: bannerColor }]}>
                    <Text style={s.browseBtnText}>Browse →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <View style={s.errorBox}>
              <Text style={s.errorIcon}>🏪</Text>
              <Text style={s.errorText}>No stores yet</Text>
              <Text style={s.errorSub}>Run the scraper in MyGroceryPricer to populate prices</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F6' },
  header: {
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  sub:   { fontSize: 13, color: '#888', marginTop: 2 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 14, gap: 10 },
  searchInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14,
    borderWidth: 0.5, borderColor: '#E4E4E4',
  },
  searchBtn: { width: 44, backgroundColor: '#4A42B0', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  searchBtnDisabled: { backgroundColor: '#C0BDEA' },
  searchBtnText: { fontSize: 16 },
  promoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FBEAF0', marginHorizontal: 16, marginTop: 14,
    padding: 14, borderRadius: 14,
  },
  promoIcon: { fontSize: 24 },
  promoTitle: { fontSize: 14, fontWeight: '600', color: '#993556' },
  promoSub: { fontSize: 12, color: '#A8557A', marginTop: 1 },
  promoArrow: { fontSize: 18, color: '#993556' },
  sectionLabel: { fontSize: 13, fontWeight: '500', color: '#888', marginHorizontal: 20, marginTop: 22, marginBottom: 10 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  storeCard: {
    backgroundColor: '#fff', borderRadius: 18, marginBottom: 18,
    borderWidth: 0.5, borderColor: '#E4E4E4', overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  banner: { height: 140, justifyContent: 'flex-end', overflow: 'hidden' },
  bannerImage: { ...StyleSheet.absoluteFillObject },
  bannerFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bannerFallbackText: { fontSize: 40, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  bannerFallbackSub: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    // simulated gradient: transparent top → semi-dark bottom
    backgroundColor: 'transparent',
    borderBottomColor: 'rgba(0,0,0,0.45)',
    borderBottomWidth: 50,
  },
  bannerStoreName: {
    position: 'absolute', bottom: 12, left: 14,
    fontSize: 20, fontWeight: '800', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  storeInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  storeInfo: { flex: 1 },
  storeDesc: { fontSize: 12.5, color: '#555', marginBottom: 3 },
  storeMeta: { fontSize: 12, color: '#888' },
  storeUpdated: { fontSize: 11, color: '#AAA', marginTop: 2 },
  browseBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  browseBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  errorBox: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 },
  errorIcon: { fontSize: 40, marginBottom: 10 },
  errorText: { fontSize: 16, fontWeight: '600', color: '#333' },
  errorSub: { fontSize: 13, color: '#888', marginTop: 4, textAlign: 'center' },
  errorHint: { fontSize: 12, color: '#AAA', marginTop: 10, textAlign: 'center', lineHeight: 18 },
})