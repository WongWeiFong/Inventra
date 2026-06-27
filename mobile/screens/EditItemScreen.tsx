// ============================================================
// mobile/screens/EditItemScreen.tsx
// Pre-fills ItemForm with existing item data, saves updates
// ============================================================
import React, { useState, useEffect } from 'react'
import { Alert, View, ActivityIndicator } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import ItemForm, { ItemFormValues } from '../components/ItemForm'
import { getItemById, updateItem } from '../lib/api'
import { ItemWithStatus } from '../types'

export default function EditItemScreen() {
  const nav    = useNavigation()
  const route  = useRoute<any>()
  const { itemId } = route.params

  const [item,   setItem]   = useState<ItemWithStatus | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getItemById(itemId).then(setItem).catch(e => {
      Alert.alert('Error loading item', e.message)
      nav.goBack()
    })
  }, [itemId])

  async function handleSave(values: ItemFormValues) {
    if (!values.name.trim()) {
      Alert.alert('Name required', 'Please enter an item name.')
      return
    }
    try {
      setSaving(true)
      await updateItem(itemId, {
        name:                values.name.trim(),
        quantity:            parseFloat(values.quantity) || 1,
        unit:                values.unit.trim() || null,
        low_stock_threshold: parseFloat(values.threshold) || 1,
        expiry_date:         values.expiryDate || null,
        notes:               values.notes.trim() || null,
        category_id:         values.categoryId,
        storage_location_id: values.locationId,
      })
      // Go back twice — back past ItemDetail to Home, so list refreshes
      nav.goBack()
    } catch (e: any) {
      Alert.alert('Error saving changes', e.message)
    } finally {
      setSaving(false)
    }
  }

  // Show spinner while loading item data
  if (!item) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A42B0" />
      </View>
    )
  }

  // Pre-fill form with existing item values
  const initial: ItemFormValues = {
    name:        item.name,
    quantity:    String(item.quantity),
    unit:        item.unit ?? '',
    threshold:   String(item.low_stock_threshold),
    expiryDate:  item.expiry_date ?? '',
    notes:       item.notes ?? '',
    categoryId:  item.category_id,
    locationId:  item.storage_location_id,
  }

  return (
    <ItemForm
      title="Edit Item"
      initial={initial}
      saving={saving}
      onSave={handleSave}
      onCancel={() => nav.goBack()}
    />
  )
}
