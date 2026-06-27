// ============================================================
// mobile/screens/AddItemScreen.tsx
// Thin wrapper around ItemForm — just handles the save logic
// ============================================================
import React, { useState } from 'react'
import { Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import ItemForm, { ItemFormValues } from '../components/ItemForm'
import { addItem } from '../lib/api'

export default function AddItemScreen() {
  const nav = useNavigation()
  const [saving, setSaving] = useState(false)

  async function handleSave(values: ItemFormValues) {
    if (!values.name.trim()) {
      Alert.alert('Name required', 'Please enter an item name.')
      return
    }
    try {
      setSaving(true)
      await addItem({
        name:                values.name.trim(),
        quantity:            parseFloat(values.quantity) || 1,
        unit:                values.unit.trim() || null,
        low_stock_threshold: parseFloat(values.threshold) || 1,
        expiry_date:         values.expiryDate || null,
        notes:               values.notes.trim() || null,
        category_id:         values.categoryId,
        storage_location_id: values.locationId,
      })
      nav.goBack()
    } catch (e: any) {
      Alert.alert('Error saving item', e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <ItemForm
      title="Add Item"
      saving={saving}
      onSave={handleSave}
      onCancel={() => nav.goBack()}
    />
  )
}