<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

type TableSummary = { name: string; rows: number; shape: 'array' }
type TableData = TableSummary & { columns: string[]; rows: Record<string, unknown>[] }

const emit = defineEmits<{ changed: [table: string] }>()
const tables = ref<TableSummary[]>([])
const selectedTable = ref('')
const tableData = ref<TableData | null>(null)
const loading = ref(false)
const error = ref('')
const result = ref('')
const newTableName = ref('')
const newColumnName = ref('')
const queryOperation = ref('select')
const whereColumn = ref('')
const whereValue = ref('')
const valuesJson = ref('{}')
const rowDrafts = ref<string[]>([])
const hasRows = computed(() => Boolean(tableData.value?.rows.length))

const api = async (body?: Record<string, unknown>, table?: string) => {
  const response = await fetch(table ? `/api/database?table=${encodeURIComponent(table)}` : '/api/database', body ? {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  } : undefined)
  const payload = await response.json().catch(() => ({})) as { message?: string }
  if (!response.ok) throw new Error(payload.message || `Database request failed (${response.status}).`)
  return payload
}

const loadTables = async () => {
  loading.value = true
  error.value = ''
  try {
    tables.value = await api() as unknown as TableSummary[]
    if (!tables.value.some((table) => table.name === selectedTable.value)) selectedTable.value = tables.value[0]?.name ?? ''
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Tables could not be loaded.'
  } finally {
    loading.value = false
  }
}

const loadTable = async () => {
  if (!selectedTable.value) {
    tableData.value = null
    return
  }
  loading.value = true
  error.value = ''
  try {
    tableData.value = await api(undefined, selectedTable.value) as unknown as TableData
    rowDrafts.value = tableData.value.rows.map((row) => JSON.stringify(row, null, 2))
    whereColumn.value = tableData.value.columns[0] ?? ''
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Table could not be loaded.'
  } finally {
    loading.value = false
  }
}

const parseObject = (value: string, label: string) => {
  try {
    const parsed = JSON.parse(value) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
    return parsed as Record<string, unknown>
  } catch {
    throw new Error(`${label} must be a valid JSON object.`)
  }
}

const run = async (body: Record<string, unknown>, reload = true) => {
  error.value = ''
  result.value = ''
  try {
    const payload = await api({ ...body, table: body.table ?? selectedTable.value })
    result.value = JSON.stringify(payload, null, 2)
    if (reload) {
      await loadTables()
      await loadTable()
      emit('changed', selectedTable.value)
    }
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Operation failed.'
  }
}

const createTable = async () => {
  const name = newTableName.value.trim()
  if (!name) return
  selectedTable.value = name
  await run({ operation: 'createTable', table: name })
  newTableName.value = ''
}

const dropTable = async () => {
  if (!selectedTable.value || !window.confirm(`Delete table "${selectedTable.value}" permanently?`)) return
  const deletedTable = selectedTable.value
  await run({ operation: 'dropTable' }, false)
  selectedTable.value = ''
  await loadTables()
  await loadTable()
  emit('changed', deletedTable)
}

const addColumn = async () => {
  if (!newColumnName.value.trim()) return
  await run({ operation: 'addColumn', column: newColumnName.value.trim() })
  newColumnName.value = ''
}

const dropColumn = async (column: string) => {
  if (window.confirm(`Delete column "${column}" permanently?`)) await run({ operation: 'dropColumn', column })
}

const saveRow = async (index: number) => {
  try {
    await run({ operation: 'updateRow', index, values: parseObject(rowDrafts.value[index] ?? '{}', 'Row') })
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Row could not be saved.'
  }
}

const deleteRow = async (index: number) => {
  if (window.confirm(`Delete row ${index + 1}?`)) await run({ operation: 'deleteRow', index })
}

const runQuery = async () => {
  try {
    const body: Record<string, unknown> = {
      operation: queryOperation.value,
      whereColumn: whereColumn.value || undefined,
      whereValue: whereValue.value,
    }
    if (['insert', 'update'].includes(queryOperation.value)) body.values = parseObject(valuesJson.value, 'Values')
    if (queryOperation.value === 'delete' && !window.confirm('Run this delete operation?')) return
    await run(body, !['select', 'count'].includes(queryOperation.value))
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Operation failed.'
  }
}

watch(selectedTable, () => void loadTable())
onMounted(() => void loadTables())
</script>

<template>
  <section class="admin-card database-panel">
    <div class="admin-card-header">
      <div><p>Railway MySQL</p><h2>Database control</h2><span>Select tables and manage their columns and data.</span></div>
      <button class="admin-button soft" type="button" :disabled="loading" @click="loadTables"><i class="fa-solid fa-rotate"></i> Refresh</button>
    </div>
    <p v-if="error" class="database-error">{{ error }}</p>

    <div class="database-toolbar">
      <label><span>Table</span><select v-model="selectedTable"><option v-for="table in tables" :key="table.name" :value="table.name">{{ table.name }} ({{ table.rows }})</option></select></label>
      <label><span>New table</span><input v-model="newTableName" placeholder="table_name" @keyup.enter="createTable" /></label>
      <button class="admin-button primary" type="button" @click="createTable"><i class="fa-solid fa-plus"></i> Add table</button>
      <button class="admin-button danger" type="button" :disabled="!selectedTable" @click="dropTable"><i class="fa-solid fa-trash"></i> Delete table</button>
    </div>

    <div v-if="tableData" class="database-columns">
      <strong>Columns</strong>
      <button v-for="column in tableData.columns" :key="column" type="button" @click="dropColumn(column)">{{ column }} <i class="fa-solid fa-xmark"></i></button>
      <input v-model="newColumnName" placeholder="new_column" @keyup.enter="addColumn" />
      <button class="admin-button soft" type="button" @click="addColumn"><i class="fa-solid fa-plus"></i> Add column</button>
    </div>

    <div class="database-query">
      <h3>Data operation</h3>
      <select v-model="queryOperation"><option value="select">Select</option><option value="count">Count</option><option value="insert">Add data</option><option value="update">Update data</option><option value="delete">Delete data</option></select>
      <select v-model="whereColumn"><option value="">All rows</option><option v-for="column in tableData?.columns" :key="column" :value="column">{{ column }}</option></select>
      <input v-model="whereValue" placeholder="Filter value" />
      <textarea v-if="['insert', 'update'].includes(queryOperation)" v-model="valuesJson" rows="3" aria-label="JSON values"></textarea>
      <button class="admin-button primary" type="button" :disabled="!selectedTable" @click="runQuery">Run</button>
      <pre v-if="result">{{ result }}</pre>
    </div>

    <div v-if="tableData" class="database-rows">
      <div class="database-rows-heading"><h3>Table data</h3><span>{{ tableData.rows.length }} records</span></div>
      <p v-if="!hasRows">This table is empty. Use Add data above.</p>
      <article v-for="(_, index) in tableData.rows" :key="index">
        <strong>Row {{ index + 1 }}</strong>
        <textarea v-model="rowDrafts[index]" rows="8"></textarea>
        <div><button class="admin-button primary" type="button" @click="saveRow(index)">Save</button><button class="admin-button danger" type="button" @click="deleteRow(index)">Delete</button></div>
      </article>
    </div>
  </section>
</template>
