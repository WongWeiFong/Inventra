const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { createClient } = require('@supabase/supabase-js')

dotenv.config()

const PORT = Number(process.env.PORT || 4000)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the backend environment')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const app = express()
app.use(cors())
app.use(express.json())

const itemSelect = '*, categories(id, name, icon), storage_locations(id, name, icon)'
const shoppingListSelect = '*, categories(id, name, icon)'

function getStockStatus(quantity, threshold) {
  if (quantity <= 0) return 'out'
  if (quantity <= threshold) return 'low'
  return 'ok'
}

function getExpiryStatus(expiryDate) {
  if (!expiryDate) return null

  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired'
  if (diffDays <= 3) return 'expiring_soon'
  return 'fresh'
}

function attachItemStatus(item) {
  return {
    ...item,
    stockStatus: getStockStatus(item.quantity, item.low_stock_threshold),
    expiryStatus: getExpiryStatus(item.expiry_date),
  }
}

function sendError(response, error, fallbackMessage = 'Request failed') {
  const status = Number(error?.status || error?.code || 500)
  const message = error?.message || fallbackMessage
  return response.status(Number.isFinite(status) ? status : 500).json({
    error: message,
  })
}

async function fetchItems(queryBuilder) {
  const { data, error } = await queryBuilder
  if (error) throw error
  return (data || []).map(attachItemStatus)
}

function toInteger(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback
  const parsed = Number.parseInt(String(value), 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

function buildItemPayload(body) {
  if (!body?.name) {
    throw Object.assign(new Error('Item name is required'), { status: 400 })
  }

  return {
    name: body.name,
    category_id: body.category_id ?? null,
    storage_location_id: body.storage_location_id ?? null,
    quantity: toInteger(body.quantity, 0),
    unit: body.unit ?? null,
    low_stock_threshold: toInteger(body.low_stock_threshold, 3),
    expiry_date: body.expiry_date ?? null,
    image_url: body.image_url ?? null,
    notes: body.notes ?? null,
  }
}

function buildItemUpdates(body) {
  const updates = {}

  if (body.name !== undefined) updates.name = body.name
  if (body.category_id !== undefined) updates.category_id = body.category_id
  if (body.storage_location_id !== undefined) updates.storage_location_id = body.storage_location_id
  if (body.quantity !== undefined) updates.quantity = toInteger(body.quantity, 0)
  if (body.unit !== undefined) updates.unit = body.unit
  if (body.low_stock_threshold !== undefined) updates.low_stock_threshold = toInteger(body.low_stock_threshold, 3)
  if (body.expiry_date !== undefined) updates.expiry_date = body.expiry_date
  if (body.image_url !== undefined) updates.image_url = body.image_url
  if (body.notes !== undefined) updates.notes = body.notes

  return updates
}

function buildShoppingItemPayload(body) {
  if (!body?.item_name) {
    throw Object.assign(new Error('Shopping item name is required'), { status: 400 })
  }

  return {
    item_name: body.item_name,
    quantity: toInteger(body.quantity, 1),
    unit: body.unit ?? null,
    category_id: body.category_id ?? null,
    is_checked: Boolean(body.is_checked),
    is_auto_generated: Boolean(body.is_auto_generated),
  }
}

app.get('/health', async (_request, response) => {
  response.json({
    status: 'ok',
    service: 'inventra-api',
  })
})

app.get('/api/categories', async (_request, response) => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error) throw error
    response.json(data || [])
  } catch (error) {
    sendError(response, error, 'Unable to load categories')
  }
})

app.get('/api/storage-locations', async (_request, response) => {
  try {
    const { data, error } = await supabase.from('storage_locations').select('*').order('name')
    if (error) throw error
    response.json(data || [])
  } catch (error) {
    sendError(response, error, 'Unable to load storage locations')
  }
})

app.get('/api/items', async (request, response) => {
  try {
    let query = supabase.from('items').select(itemSelect).order('name')

    if (request.query.location_id) {
      query = query.eq('storage_location_id', request.query.location_id)
    }

    const items = await fetchItems(query)
    response.json(items)
  } catch (error) {
    sendError(response, error, 'Unable to load items')
  }
})

app.get('/api/items/location/:locationId', async (request, response) => {
  try {
    const items = await fetchItems(
      supabase.from('items').select(itemSelect).eq('storage_location_id', request.params.locationId).order('name')
    )
    response.json(items)
  } catch (error) {
    sendError(response, error, 'Unable to load items by location')
  }
})

app.get('/api/items/low-stock', async (_request, response) => {
  try {
    const { data, error } = await supabase.from('items').select(itemSelect).order('name')
    if (error) throw error

    const items = (data || []).map(attachItemStatus).filter((item) => item.stockStatus !== 'ok')
    response.json(items)
  } catch (error) {
    sendError(response, error, 'Unable to load low stock items')
  }
})

app.get('/api/items/expiring', async (request, response) => {
  try {
    const withinDays = toInteger(request.query.withinDays, 3)
    const today = new Date()
    const future = new Date()
    future.setDate(today.getDate() + withinDays)

    const { data, error } = await supabase
      .from('items')
      .select(itemSelect)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', future.toISOString().split('T')[0])
      .order('expiry_date')

    if (error) throw error
    response.json((data || []).map(attachItemStatus))
  } catch (error) {
    sendError(response, error, 'Unable to load expiring items')
  }
})

app.get('/api/items/search', async (request, response) => {
  try {
    const queryText = String(request.query.q || '').trim()
    if (!queryText) {
      return response.json([])
    }

    const { data, error } = await supabase
      .from('items')
      .select(itemSelect)
      .ilike('name', `%${queryText}%`)
      .order('name')

    if (error) throw error
    response.json((data || []).map(attachItemStatus))
  } catch (error) {
    sendError(response, error, 'Unable to search items')
  }
})

app.get('/api/items/:id', async (request, response) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select(itemSelect)
      .eq('id', request.params.id)
      .single()

    if (error) throw error
    response.json(attachItemStatus(data))
  } catch (error) {
    sendError(response, error, 'Unable to load item')
  }
})

app.post('/api/items', async (request, response) => {
  try {
    const payload = buildItemPayload(request.body)
    const { data, error } = await supabase.from('items').insert(payload).select(itemSelect).single()
    if (error) throw error
    response.status(201).json(attachItemStatus(data))
  } catch (error) {
    sendError(response, error, 'Unable to create item')
  }
})

app.patch('/api/items/:id', async (request, response) => {
  try {
    const updates = buildItemUpdates(request.body)
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', request.params.id)
      .select(itemSelect)
      .single()

    if (error) throw error
    response.json(attachItemStatus(data))
  } catch (error) {
    sendError(response, error, 'Unable to update item')
  }
})

app.delete('/api/items/:id', async (request, response) => {
  try {
    const { error } = await supabase.from('items').delete().eq('id', request.params.id)
    if (error) throw error
    response.status(204).send()
  } catch (error) {
    sendError(response, error, 'Unable to delete item')
  }
})

app.get('/api/shopping-list', async (_request, response) => {
  try {
    const { data, error } = await supabase
      .from('shopping_list')
      .select(shoppingListSelect)
      .order('is_checked')
      .order('created_at')

    if (error) throw error
    response.json(data || [])
  } catch (error) {
    sendError(response, error, 'Unable to load shopping list')
  }
})

app.post('/api/shopping-list', async (request, response) => {
  try {
    const payload = buildShoppingItemPayload(request.body)
    const { data, error } = await supabase.from('shopping_list').insert(payload).select(shoppingListSelect).single()
    if (error) throw error
    response.status(201).json(data)
  } catch (error) {
    sendError(response, error, 'Unable to add shopping list item')
  }
})

app.patch('/api/shopping-list/:id', async (request, response) => {
  try {
    const updates = {}

    if (request.body.item_name !== undefined) updates.item_name = request.body.item_name
    if (request.body.quantity !== undefined) updates.quantity = toInteger(request.body.quantity, 1)
    if (request.body.unit !== undefined) updates.unit = request.body.unit
    if (request.body.category_id !== undefined) updates.category_id = request.body.category_id
    if (request.body.is_checked !== undefined) updates.is_checked = Boolean(request.body.is_checked)
    if (request.body.is_auto_generated !== undefined) updates.is_auto_generated = Boolean(request.body.is_auto_generated)

    const { data, error } = await supabase
      .from('shopping_list')
      .update(updates)
      .eq('id', request.params.id)
      .select(shoppingListSelect)
      .single()

    if (error) throw error
    response.json(data)
  } catch (error) {
    sendError(response, error, 'Unable to update shopping list item')
  }
})

app.delete('/api/shopping-list/:id', async (request, response) => {
  try {
    const { error } = await supabase.from('shopping_list').delete().eq('id', request.params.id)
    if (error) throw error
    response.status(204).send()
  } catch (error) {
    sendError(response, error, 'Unable to delete shopping list item')
  }
})

app.delete('/api/shopping-list/checked', async (_request, response) => {
  try {
    const { error } = await supabase.from('shopping_list').delete().eq('is_checked', true)
    if (error) throw error
    response.status(204).send()
  } catch (error) {
    sendError(response, error, 'Unable to clear checked shopping list items')
  }
})

app.post('/api/shopping-list/generate', async (_request, response) => {
  try {
    const { data: lowStockItems, error: lowStockError } = await supabase.from('items').select(itemSelect).order('name')
    if (lowStockError) throw lowStockError

    const items = (lowStockItems || []).map(attachItemStatus).filter((item) => item.stockStatus !== 'ok')

    await supabase.from('shopping_list').delete().eq('is_auto_generated', true)

    if (items.length === 0) {
      return response.json([])
    }

    const entries = items.map((item) => ({
      item_name: item.name,
      quantity: item.low_stock_threshold,
      unit: item.unit,
      category_id: item.category_id,
      is_checked: false,
      is_auto_generated: true,
    }))

    const { data, error } = await supabase.from('shopping_list').insert(entries).select(shoppingListSelect)
    if (error) throw error
    response.status(201).json(data || [])
  } catch (error) {
    sendError(response, error, 'Unable to generate shopping list')
  }
})

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' })
})

app.use((error, _request, response, _next) => {
  sendError(response, error, 'Unexpected server error')
})

app.listen(PORT, () => {
  console.log(`Inventra API running on http://localhost:${PORT}`)
})