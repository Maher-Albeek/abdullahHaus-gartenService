<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { readApiResponse } from '../utils/apiResponse'

const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)
const resetSent = ref('')

const login = async () => {
  error.value = ''
  loading.value = true
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })
    const result = await readApiResponse<{ message?: string }>(response)
    if (!response.ok) throw new Error(result.message || 'Anmeldung fehlgeschlagen.')
    await router.replace(typeof route.query.redirect === 'string' ? route.query.redirect : '/admin')
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Anmeldung fehlgeschlagen.'
  } finally {
    loading.value = false
  }
}
const forgotPassword = async () => {
  error.value = ''
  if (!email.value) { error.value = 'Bitte geben Sie zuerst Ihre E-Mail-Adresse ein.'; return }
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.value }),
  })
  const result = await readApiResponse<{ message?: string }>(response)
  resetSent.value = response.ok ? 'Falls das Konto existiert, wurde eine Reset-E-Mail versendet.' : (result.message || 'Reset-E-Mail konnte nicht versendet werden.')
}
</script>

<template>
  <main class="login-page">
    <section class="login-card">
      <a class="login-brand" href="/">
        <span>A</span>
        <div><strong>AHG</strong><small>Content Studio</small></div>
      </a>
      <div class="login-heading">
        <p>Geschützter Bereich</p>
        <h1>Admin-Anmeldung</h1>
        <span>Melden Sie sich an, um die Website zu verwalten.</span>
      </div>
      <form @submit.prevent="login">
        <label><span>E-Mail-Adresse</span><input v-model.trim="email" type="email" autocomplete="username" required /></label>
        <label>
          <span>Passwort</span>
          <div class="login-password-field">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required />
            <button
              class="login-password-toggle"
              type="button"
              :aria-label="showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <i :class="`fa-solid fa-eye${showPassword ? '-slash' : ''}`" aria-hidden="true"></i>
            </button>
          </div>
        </label>
        <p v-if="error" class="login-error" role="alert">{{ error }}</p>
        <button type="submit" :disabled="loading">
          <i :class="`fa-solid fa-${loading ? 'spinner fa-spin' : 'right-to-bracket'}`"></i>
          {{ loading ? 'Anmeldung läuft...' : 'Anmelden' }}
        </button>
        <button class="login-secondary" type="button" @click="forgotPassword">Passwort vergessen?</button>
        <p v-if="resetSent">{{ resetSent }}</p>
      </form>
      <a class="login-back" href="/"><i class="fa-solid fa-arrow-left"></i> Zur Website</a>
    </section>
  </main>
</template>
