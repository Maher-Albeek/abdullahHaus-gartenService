<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { readApiResponse } from '../utils/apiResponse'
const route = useRoute()
const router = useRouter()
const password = ref('')
const message = ref('')
const error = ref('')
const reset = async () => {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: route.query.token, password: password.value }),
  })
  const result = await readApiResponse<{ message?: string }>(response)
  if (!response.ok) { error.value = result.message || 'Zurücksetzen fehlgeschlagen.'; return }
  message.value = 'Passwort geändert. Sie werden zur Anmeldung weitergeleitet.'
  window.setTimeout(() => router.replace('/login'), 1200)
}
</script>
<template><main class="login-page"><section class="login-card"><div class="login-heading"><p>Sicherheit</p><h1>Passwort zurücksetzen</h1></div><form @submit.prevent="reset"><label><span>Neues Passwort</span><input v-model="password" type="password" minlength="8" required /></label><p v-if="error" class="login-error">{{ error }}</p><p v-if="message">{{ message }}</p><button type="submit">Passwort speichern</button></form></section></main></template>
