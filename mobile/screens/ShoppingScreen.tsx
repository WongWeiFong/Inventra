// ============================================================
// mobile/screens/ShoppingScreen.tsx
// Shopping list with per-item cheapest price hints (PriceTag)
// ============================================================
import React, { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useShopping } from '../hooks/useShopping'
import {
  toggleShoppingItem, deleteShoppingItem,
  clearCheckedItems, addShoppingItem, generateShoppingList,
} from '../lib/api'
import EmptyState from '../components/EmptyState'
import PriceTag   from '../components/PriceTag'
import { ShoppingListItem } from '../types'

export default function ShoppingScreen() {
  const nav = useNavigation<any>()
  const { unchecked, checked, loading, refetch } = useShopping()
  const [newItem,    setNewItem]    = useState('')
  const [generating, setGenerating] = useState(false)

  async function handleAdd() {
    if (!newItem.trim()) return
    await addShoppingItem({
      item_name: newItem.trim(), quantity: 1, unit: null, category_id: null,
    })
    setNewItem('')
    refetch()
  }

  async function handleToggle(item: ShoppingListItem) {
    await toggleShoppingItem(item.id, !item.is_checked)
    refetch()
  }

  async function handleDelete(item: ShoppingListItem) {
    await deleteShoppingItem(item.id)
    refetch()
  }

  async function handleGenerate() {
    setGenerating(true)
    const added = await generateShoppingList()
    setGenerating(false)
    refetch()
    if (added.length === 0) Alert.alert('All stocked up!', 'No low-stock items to add.')
    else Alert.alert('Done', `Added ${added.length} item${added.length > 1 ? 's' : ''} from low-stock inventory.`)
  }

  async function handleClearChecked() {
    Alert.alert('Clear checked', 'Remove all checked items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => { await clearCheckedItems(); refetch() } },
    ])
  }

  const renderItem = ({ item }: { item: ShoppingListItem }) => (
    <TouchableOpacity style={s.item} onPress={() => handleToggle(item)} activeOpacity={0.75}>
      <View style={[s.check, item.is_checked && s.checkDone]}>
        {item.is_checked && <Text style={s.checkMark}>✓</Text>}
      </View>

      <View style={s.itemInfo}>
        <Text style={[s.itemName, item.is_checked && s.strikethrough]}>
          {item.item_name}
        </Text>
        {(item.quantity > 1 || item.unit) && (
          <Text style={s.itemMeta}>{item.quantity}{item.unit ? ' ' + item.unit : ''}</Text>
        )}

        {/* Source info row — store + date added */}
        <View style={s.sourceRow}>
          {item.added_from === 'price_tab' && item.source_store_chain ? (
            <View style={s.sourceBadge}>
              <Text style={s.sourceBadgeText}>
                🏪 {item.source_store_chain}
                {item.source_price ? `  ·  RM ${item.source_price.toFixed(2)}` : ''}
              </Text>
            </View>
          ) : item.added_from === 'auto_generated' ? (
            <View style={[s.sourceBadge, s.sourceBadgeAuto]}>
              <Text style={[s.sourceBadgeText, s.sourceBadgeTextAuto]}>⚡ Auto-generated</Text>
            </View>
          ) : null}
          <Text style={s.dateAdded}>
            {new Date(item.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>

        {!item.is_checked && <PriceTag itemName={item.item_name} />}
      </View>

      <TouchableOpacity onPress={() => handleDelete(item)} style={s.deleteBtn}>
        <Text style={s.deleteX}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Shopping List</Text>
        <View style={s.headerActions}>
          {checked.length > 0 && (
            <TouchableOpacity onPress={handleClearChecked} style={s.clearBtn}>
              <Text style={s.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity style={s.generateBtn} onPress={handleGenerate} disabled={generating}>
        {generating
          ? <ActivityIndicator size="small" color="#4A42B0" />
          : <Text style={s.generateText}>✨ Generate from low-stock items</Text>}
      </TouchableOpacity>

      <View style={s.addRow}>
        <TextInput
          style={s.addInput} placeholder="Add item..." placeholderTextColor="#AAA"
          value={newItem} onChangeText={setNewItem}
          onSubmitEditing={handleAdd} returnKeyType="done"
        />
        <TouchableOpacity style={s.addBtn} onPress={handleAdd}>
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={s.legend}>
        <View style={[s.legendDot, { backgroundColor: '#EAF3DE' }]} />
        <Text style={s.legendText}>Cheapest store</Text>
        <View style={[s.legendDot, { backgroundColor: '#FBEAF0', marginLeft: 10 }]} />
        <Text style={s.legendText}>On promotion</Text>
      </View>

      {loading
        ? <ActivityIndicator style={{ marginTop: 40 }} />
        : <FlatList
            data={[...unchecked, ...checked]}
            keyExtractor={i => i.id}
            contentContainerStyle={s.list}
            renderItem={renderItem}
            ListEmptyComponent={
              <EmptyState icon="🛒" title="List is empty"
                subtitle="Add items manually or generate from low-stock inventory" />
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
  headerActions: { flexDirection: 'row', gap: 8 },
  compareBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EEEDFE', borderRadius: 12 },
  compareBtnText: { fontSize: 13, color: '#4A42B0', fontWeight: '600' },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FCEBEB', borderRadius: 12 },
  clearBtnText: { fontSize: 13, color: '#A32D2D', fontWeight: '500' },
  generateBtn: { margin: 16, padding: 14, backgroundColor: '#EEEDFE', borderRadius: 14, alignItems: 'center' },
  generateText: { color: '#4A42B0', fontWeight: '600', fontSize: 14 },
  addRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 10 },
  addInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
    borderWidth: 0.5, borderColor: '#E4E4E4',
  },
  addBtn: { backgroundColor: '#4A42B0', paddingHorizontal: 18, borderRadius: 12, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  legend: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#AAA', marginLeft: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 8, borderWidth: 0.5, borderColor: '#E4E4E4',
  },
  check: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    borderColor: '#C0C0C0', alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkDone: { backgroundColor: '#4A42B0', borderColor: '#4A42B0' },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '500', color: '#1A1A1A' },
  strikethrough: { textDecorationLine: 'line-through', color: '#AAA' },
  itemMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  autoBadge: {
    fontSize: 10, color: '#534AB7', backgroundColor: '#EEEDFE',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    alignSelf: 'flex-start', marginTop: 4,
  },
  deleteBtn: { padding: 6 },
  deleteX: { fontSize: 14, color: '#CCC' },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' },
  sourceBadge: {
    backgroundColor: '#EEEDFE', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  sourceBadgeAuto: { backgroundColor: '#EAF3DE' },
  sourceBadgeText: { fontSize: 10.5, color: '#4A42B0', fontWeight: '500' },
  sourceBadgeTextAuto: { color: '#27500A' },
  dateAdded: { fontSize: 10.5, color: '#BBB' },
})