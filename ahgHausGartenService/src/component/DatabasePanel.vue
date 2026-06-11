<script setup lang="ts">
import { computed, ref } from 'vue'

type QueryResult = {
  rows?: Record<string, unknown>[]
  affectedRows?: number
  insertId?: number
  warningStatus?: number
}

const emit = defineEmits<{ changed: [table: string] }>()
const query = ref('SELECT * FROM app_documents LIMIT 100;')
const result = ref<QueryResult | null>(null)
const error = ref('')
const loading = ref(false)
const columns = computed(() => result.value?.rows?.length ? Object.keys(result.value.rows[0]!) : [])

const formatValue = (value: unknown) => {
  if (value === null) return 'NULL'
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

const runQuery = async () => {
  if (!query.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = null
  try {
    const response = await fetch('/api/database/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.value }),
    })
    const payload = await response.json() as QueryResult & { message?: string }
    if (!response.ok) throw new Error(payload.message || `Query failed (${response.status}).`)
    result.value = payload
    if (!/^\s*(SELECT|SHOW|DESCRIBE|DESC|EXPLAIN|WITH)\b/i.test(query.value)) emit('changed', 'app_documents')
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Query failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="admin-card database-panel">
    <label class="database-sql-input">
      <span>SQL query</span>
      <textarea v-model="query" rows="10" spellcheck="false" @keydown.ctrl.enter.prevent="runQuery"></textarea>
    </label>
    <button class="admin-button primary database-run" type="button" :disabled="loading || !query.trim()" @click="runQuery">
      <i :class="`fa-solid fa-${loading ? 'spinner fa-spin' : 'play'}`"></i>
      {{ loading ? 'Running...' : 'Run query' }}
    </button>

    <section class="database-output">
      <span>Result</span>
      <pre v-if="error" class="database-error">{{ error }}</pre>
      <div v-else-if="result?.rows" class="database-result-table">
        <table>
          <thead><tr><th v-for="column in columns" :key="column">{{ column }}</th></tr></thead>
          <tbody>
            <tr v-for="(row, index) in result.rows" :key="index">
              <td v-for="column in columns" :key="column">{{ formatValue(row[column]) }}</td>
            </tr>
          </tbody>
        </table>
        <small>{{ result.rows.length }} rows</small>
      </div>
      <pre v-else-if="result">{{ JSON.stringify(result, null, 2) }}</pre>
      <pre v-else>Run a query to see its result.</pre>
    </section>
  </section>
</template>
