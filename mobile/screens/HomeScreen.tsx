// ============================================================
// mobile/screens/HomeScreen.tsx
// Main inventory dashboard with tabs, search, quick qty update
// ============================================================
import React, { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useItems } from '../hooks/useItems'
import { useSearch } from '../hooks/useSearch'
import { updateQuantity, deleteItem } from '../lib/api'
import ItemCard from '../components/ItemCard'
import EmptyState from '../components/EmptyState'
import { ItemWithStatus } from '../types'

const TABS = [
  { id: 'all',         label: 'All',      icon: '🏠' },
  { id: 'Pantry',      label: 'Pantry',   icon: '🗄️' },
  { id: 'Refrigerator',label: 'Fridge',   icon: '🧊' },
  { id: 'Freezer',     label: 'Freezer',  icon: '❄️' },
  { id: 'Bathroom',    label: 'Bathroom', icon: '🚿' },
]

export default function HomeScreen() {
  const nav = useNavigation<any>()
  const { items, loading, refetch } = useItems()
  const { query, setQuery, results, loading: searching } = useSearch()
  const [activeTab, setActiveTab] = useState('all')

  const lowCount = items.filter(i => i.stockStatus !== 'ok').length
  const expiringCount = items.filter(i => i.expiryStatus && i.expiryStatus !== 'fresh').length

  const tabFiltered = activeTab === 'all'
    ? items
    : items.filter(i => i.storage_locations?.name === activeTab)

  const displayed: ItemWithStatus[] = query.length >= 2 ? results : tabFiltered

  async function handleQtyChange(id: string, qty: number) {
    await updateQuantity(id, qty)
    refetch()
  }

  async function handleDelete(item: ItemWithStatus) {
    Alert.alert('Remove item', `Delete "${item.name}" from inventory?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteItem(item.id); refetch() } },
    ])
  }

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Inventra</Text>
          <Text style={s.sub}>{items.length} items tracked</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => nav.navigate('AddItem')}>
          <Text style={s.addBtnText}>+ Add item</Text>
        </TouchableOpacity>
      </View>

      {/* ── Alert summary ── */}
      {(lowCount > 0 || expiringCount > 0) && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.alertRow}>
          {lowCount > 0 && (
            <View style={[s.alertCard, { backgroundColor: '#FAEEDA' }]}>
              <Text style={s.alertIcon}>⚠️</Text>
              <Text style={[s.alertCount, { color: '#633806' }]}>{lowCount}</Text>
              <Text style={[s.alertLabel, { color: '#633806' }]}>Low / out of stock</Text>
            </View>
          )}
          {expiringCount > 0 && (
            <View style={[s.alertCard, { backgroundColor: '#FBEAF0' }]}>
              <Text style={s.alertIcon}>📅</Text>
              <Text style={[s.alertCount, { color: '#993556' }]}>{expiringCount}</Text>
              <Text style={[s.alertLabel, { color: '#993556' }]}>Expiring / expired</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Search ── */}
      <View style={s.searchWrap}>
        <TextInput
          style={s.search}
          placeholder="Search items..."
          placeholderTextColor="#AAA"
          value={query}
          onChangeText={setQuery}
        />
        {searching && <ActivityIndicator size="small" style={s.spinner} />}
      </View>

      {/* ── Storage tabs ── */}
      {query.length < 2 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[s.tab, activeTab === t.id && s.tabActive]}
              onPress={() => setActiveTab(t.id)}
            >
              <Text style={s.tabIcon}>{t.icon}</Text>
              <Text style={[s.tabLabel, activeTab === t.id && s.tabLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── List ── */}
      {loading
        ? <ActivityIndicator style={{ marginTop: 48 }} />
        : <FlatList
            data={displayed}
            keyExtractor={i => i.id}
            contentContainerStyle={s.list}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                onPress={() => nav.navigate('ItemDetail', { itemId: item.id })}
                onQuantityChange={handleQtyChange}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="📦"
                title="Nothing here yet"
                subtitle='Tap "+ Add item" to start tracking your household inventory'
              />
            }
          />
      }
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
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  sub: { fontSize: 13, color: '#888', marginTop: 2 },
  addBtn: { backgroundColor: '#4A42B0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  alertRow: { paddingHorizontal: 16, paddingVertical: 10, flexGrow: 0 },
  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginRight: 10,
  },
  alertIcon: { fontSize: 16 },
  alertCount: { fontSize: 18, fontWeight: '700' },
  alertLabel: { fontSize: 13, fontWeight: '500' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 10 },
  search: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
    borderWidth: 0.5, borderColor: '#E4E4E4',
  },
  spinner: { marginLeft: 10 },
  tabs: { paddingHorizontal: 12, marginBottom: 8, flexGrow: 0 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E4E4E4',
  },
  tabActive: { backgroundColor: '#4A42B0', borderColor: '#4A42B0' },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 13, color: '#555', fontWeight: '500' },
  tabLabelActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
})