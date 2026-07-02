// ============================================================
// mobile/screens/PriceItemDetailScreen.tsx
// SCREEN 3 — Tapped an item in StoreBrowseScreen.
// Shows: image, price, description, "Compare across stores"
// section, "Similar items in same store" section,
// and one-tap Add to Shopping List button.
// ============================================================
import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, Alert, Linking,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { comparePrices, searchPrices, CompareProduct, PriceResult } from '../lib/api/price'
import { addFromPriceTab } from '../lib/api/shopping'

export default function PriceItemDetailScreen() {
  const nav    = useNavigation<any>()
  const route  = useRoute<any>()
  const { productName, storeName } = route.params

  const [item,         setItem]         = useState<PriceResult | null>(null)
  const [comparing,    setComparing]    = useState(true)
  const [compareData,  setCompareData]  = useState<CompareProduct | null>(null)
  const [similarItems, setSimilarItems] = useState<PriceResult[]>([])
  const [loadingSim,   setLoadingSim]   = useState(true)
  const [adding,       setAdding]       = useState(false)

  useEffect(() => {
    loadAll()
  }, [productName, storeName])

  async function loadAll() {
    // 1. Get this item's own details from search
    setComparing(true)
    setLoadingSim(true)

    try {
      // Fetch this item's details
      const searchResults = await searchPrices(productName, 5)
      const thisItem = searchResults.find(r =>
        r.product_name.toLowerCase() === productName.toLowerCase() &&
        r.store_name === storeName
      ) || searchResults[0] || null
      setItem(thisItem)

      // 2. Compare across stores
      const keyword = productName.split(' ').slice(0, 3).join(' ')
      const compared = await comparePrices(keyword)
      const match = compared.find(p =>
        p.name.toLowerCase().includes(keyword.toLowerCase().split(' ')[0])
      ) || compared[0] || null
      setCompareData(match)
    } catch (e: any) {
      console.error('Detail load error:', e.message)
    } finally {
      setComparing(false)
    }

    // 3. Find similar items in the same store
    try {
      const keyword = productName.split(' ')[0]
      const results = await searchPrices(keyword, 10)
      setSimilarItems(
        results
          .filter(r => r.store_name === storeName && r.product_name !== productName)
          .slice(0, 5)
      )
    } catch { /* silently fail */ }
    finally { setLoadingSim(false) }
  }

  async function handleAddToList(
    name: string,
    store: string,
    price?: number,
  ) {
    setAdding(true)
    try {
      const chainName = store.split('(')[0].trim()
      await addFromPriceTab({
        item_name:           name,
        source_store:        store,
        source_store_chain:  chainName,
        source_price:        price,
      })
      Alert.alert('Added! 🛒', `"${name}" added to your shopping list from ${chainName}.`)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={s.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{productName}</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Product image */}
      {item?.image_url ? (
        <Image source={{ uri: item.image_url }} style={s.productImage} resizeMode="contain" />
      ) : (
        <View style={s.productImagePlaceholder}>
          <Text style={{ fontSize: 52 }}>🛒</Text>
        </View>
      )}

      {/* Price + name */}
      <View style={s.priceBlock}>
        <Text style={s.productName}>{productName}</Text>
        <Text style={s.storeName}>@ {storeName}</Text>
        {item ? (
          <View style={s.priceRow}>
            <Text style={s.price}>RM {item.price.toFixed(2)}</Text>
            {item.original_price && item.original_price > item.price && (
              <>
                <Text style={s.originalPrice}>RM {item.original_price.toFixed(2)}</Text>
                <View style={s.promoTag}>
                  <Text style={s.promoTagText}>🏷 {item.discount_pct}% off</Text>
                </View>
              </>
            )}
          </View>
        ) : (
          <ActivityIndicator style={{ marginTop: 8 }} />
        )}
        {item?.description && (
          <Text style={s.description} numberOfLines={3}>{item.description}</Text>
        )}
      </View>

      {/* Add to shopping list — primary CTA */}
      <TouchableOpacity
        style={[s.addBtn, adding && s.addBtnLoading]}
        onPress={() => item && handleAddToList(productName, storeName, item.price)}
        disabled={adding || !item}
      >
        {adding
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.addBtnText}>＋ Add to shopping list</Text>
        }
      </TouchableOpacity>

      {item?.product_url && (
        <TouchableOpacity style={s.viewOnlineBtn} onPress={() => Linking.openURL(item.product_url!)}>
          <Text style={s.viewOnlineBtnText}>View on {storeName.split('(')[0].trim()} website →</Text>
        </TouchableOpacity>
      )}

      {/* ── Compare across stores ── */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Compare across stores</Text>
        <Text style={s.sectionSub}>Same or similar item at other stores</Text>
      </View>

      {comparing ? (
        <ActivityIndicator style={{ marginVertical: 16 }} color="#4A42B0" />
      ) : compareData ? (
        <View style={s.compareCard}>
          {compareData.stores.map((store, i) => (
            <View
              key={i}
              style={[s.compareRow, store.cheapest && s.compareRowCheapest]}
            >
              <View style={s.compareLeft}>
                {store.cheapest && (
                  <View style={s.cheapestBadge}>
                    <Text style={s.cheapestBadgeText}>Cheapest</Text>
                  </View>
                )}
                <Text style={[s.compareStore, store.cheapest && s.compareStoreCheapest]}>
                  {store.store}
                </Text>
                {store.is_promotion && (
                  <Text style={s.comparePromo}>🏷 {store.discount_pct}% off</Text>
                )}
              </View>
              <View style={s.compareRight}>
                <Text style={[s.comparePrice, store.cheapest && s.comparePriceCheapest]}>
                  RM {store.price.toFixed(2)}
                </Text>
                {store.original_price && store.original_price > store.price && (
                  <Text style={s.compareOriginal}>RM {store.original_price.toFixed(2)}</Text>
                )}
              </View>
              <TouchableOpacity
                style={s.compareAddBtn}
                onPress={() => handleAddToList(compareData.name, store.store, store.price)}
              >
                <Text style={s.compareAddBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View style={s.emptyBox}>
          <Text style={s.emptyText}>No comparison data found for this item</Text>
        </View>
      )}

      {/* ── Similar items in same store ── */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Similar items in {storeName.split('(')[0].trim()}</Text>
        <Text style={s.sectionSub}>Other products you might consider</Text>
      </View>

      {loadingSim ? (
        <ActivityIndicator style={{ marginVertical: 16 }} color="#4A42B0" />
      ) : similarItems.length > 0 ? (
        <View style={s.similarList}>
          {similarItems.map((sim, i) => (
            <TouchableOpacity
              key={i}
              style={s.similarRow}
              onPress={() => nav.replace('PriceItemDetail', {
                productName: sim.product_name,
                storeName:   sim.store_name,
              })}
            >
              {sim.image_url ? (
                <Image source={{ uri: sim.image_url }} style={s.simImage} />
              ) : (
                <View style={[s.simImage, s.simImagePlaceholder]}>
                  <Text style={{ fontSize: 16 }}>🛒</Text>
                </View>
              )}
              <View style={s.simInfo}>
                <Text style={s.simName} numberOfLines={2}>{sim.product_name}</Text>
                <View style={s.simPriceRow}>
                  <Text style={s.simPrice}>RM {sim.price.toFixed(2)}</Text>
                  {sim.is_promotion && (
                    <Text style={s.simPromo}>🏷 {sim.discount_pct}% off</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={s.simAddBtn}
                onPress={() => handleAddToList(sim.product_name, sim.store_name, sim.price)}
              >
                <Text style={s.simAddBtnText}>＋</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={s.emptyBox}>
          <Text style={s.emptyText}>No similar items found</Text>
        </View>
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F6' },
  content: { paddingBottom: 60 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 14,
    backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8',
  },
  back: { fontSize: 15, color: '#4A42B0', width: 50 },
  headerTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', flex: 1, textAlign: 'center' },
  productImage: { width: '100%', height: 200, backgroundColor: '#F4F4F4' },
  productImagePlaceholder: {
    height: 160, backgroundColor: '#F4F4F4',
    alignItems: 'center', justifyContent: 'center',
  },
  priceBlock: { padding: 20, backgroundColor: '#fff', marginBottom: 10 },
  productName: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  storeName: { fontSize: 13, color: '#888', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  price: { fontSize: 24, fontWeight: '800', color: '#1D9E75' },
  originalPrice: { fontSize: 15, color: '#AAA', textDecorationLine: 'line-through' },
  promoTag: { backgroundColor: '#FBEAF0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  promoTagText: { fontSize: 12, color: '#993556', fontWeight: '600' },
  description: { fontSize: 13, color: '#666', lineHeight: 19, marginTop: 4 },
  addBtn: {
    marginHorizontal: 16, marginBottom: 10, paddingVertical: 15,
    backgroundColor: '#4A42B0', borderRadius: 14, alignItems: 'center',
  },
  addBtnLoading: { backgroundColor: '#C0BDEA' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  viewOnlineBtn: { marginHorizontal: 16, marginBottom: 20, alignItems: 'center' },
  viewOnlineBtnText: { fontSize: 13, color: '#4A42B0' },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: '#F8F8F6' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  sectionSub: { fontSize: 12, color: '#888', marginTop: 2 },
  compareCard: {
    marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 0.5, borderColor: '#E4E4E4', overflow: 'hidden', marginBottom: 8,
  },
  compareRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0',
  },
  compareRowCheapest: { backgroundColor: '#F0FBF0' },
  compareLeft: { flex: 1 },
  cheapestBadge: {
    backgroundColor: '#EAF3DE', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6, alignSelf: 'flex-start', marginBottom: 3,
  },
  cheapestBadgeText: { fontSize: 10, fontWeight: '700', color: '#27500A' },
  compareStore: { fontSize: 13, color: '#555', fontWeight: '500' },
  compareStoreCheapest: { color: '#1A1A1A', fontWeight: '700' },
  comparePromo: { fontSize: 11, color: '#993556', marginTop: 2 },
  compareRight: { alignItems: 'flex-end' },
  comparePrice: { fontSize: 15, fontWeight: '600', color: '#333' },
  comparePriceCheapest: { fontSize: 16, fontWeight: '800', color: '#1D9E75' },
  compareOriginal: { fontSize: 11, color: '#BBB', textDecorationLine: 'line-through' },
  compareAddBtn: {
    backgroundColor: '#EEEDFE', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10,
  },
  compareAddBtnText: { fontSize: 13, color: '#4A42B0', fontWeight: '600' },
  emptyBox: { marginHorizontal: 16, padding: 20, backgroundColor: '#fff', borderRadius: 14, alignItems: 'center' },
  emptyText: { fontSize: 13, color: '#AAA' },
  similarList: { marginHorizontal: 16, marginBottom: 8 },
  similarRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 14, padding: 10,
    marginBottom: 8, borderWidth: 0.5, borderColor: '#E4E4E4',
  },
  simImage: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#F4F4F4' },
  simImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  simInfo: { flex: 1 },
  simName: { fontSize: 13, fontWeight: '500', color: '#1A1A1A', lineHeight: 17 },
  simPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  simPrice: { fontSize: 13, fontWeight: '700', color: '#1D9E75' },
  simPromo: { fontSize: 11, color: '#993556' },
  simAddBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#4A42B0', alignItems: 'center', justifyContent: 'center',
  },
  simAddBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: -1 },
})
