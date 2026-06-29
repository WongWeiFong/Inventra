// ============================================================
// mobile/components/PriceTag.tsx
// Compact price hint shown on each shopping list item.
// Fetches cheapest price in background — shows nothing while
// loading and silently hides if no price found.
// ============================================================
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { getCheapestPrice } from '../lib/api/price'

interface PriceInfo {
  store: string
  price: number
  is_promotion: boolean
}

interface Props {
  itemName: string
}

export default function PriceTag({ itemName }: Props) {
  const [price,   setPrice]   = useState<PriceInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getCheapestPrice(itemName).then(result => {
      if (!cancelled) {
        setPrice(result)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [itemName])

  // Don't show anything while loading or if no price found
  if (loading || !price) return null

  return (
    <View style={[s.tag, price.is_promotion && s.tagPromo]}>
      {price.is_promotion && <Text style={s.promoIcon}>🏷</Text>}
      <Text style={[s.price, price.is_promotion && s.pricePromo]}>
        RM {price.price.toFixed(2)}
      </Text>
      <Text style={[s.store, price.is_promotion && s.storePromo]}>
        @ {price.store.replace('Jaya Grocer ', 'JG ').replace("Lotus's", "Lotus's")}
      </Text>
    </View>
  )
}

const s = StyleSheet.create({
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EAF3DE', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, marginTop: 5, alignSelf: 'flex-start',
  },
  tagPromo: { backgroundColor: '#FBEAF0' },
  promoIcon: { fontSize: 11 },
  price: { fontSize: 12, fontWeight: '700', color: '#27500A' },
  pricePromo: { color: '#993556' },
  store: { fontSize: 11, color: '#3B6D11' },
  storePromo: { color: '#993556' },
})
