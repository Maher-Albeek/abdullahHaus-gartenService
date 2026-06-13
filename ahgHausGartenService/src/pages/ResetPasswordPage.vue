<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { readApiResponse } from '../utils/apiResponse'
const route = useRoute()
const router = useRouter()
const password = ref('')
const passwordConfirmation = ref('')
const message = ref('')
const error = ref('')
const passwordRules = computed(() => [
  { label: 'Mindestens 12 Zeichen', valid: password.value.length >= 12 },
  { label: 'Mindestens ein Großbuchstabe', valid: /[A-Z]/.test(password.value) },
  { label: 'Mindestens eine Zahl', valid: /\d/.test(password.value) },
  { label: 'Nur Buchstaben, Zahlen oder * @ _ . # $ %', valid: /^[A-Za-z0-9*@_.#$%]*$/.test(password.value) },
])
const passwordIsStrong = computed(() => passwordRules.value.every((rule) => rule.valid))
const passwordsMatch = computed(() => password.value !== '' && password.value === passwordConfirmation.value)
const canSubmit = computed(() => passwordIsStrong.value && passwordsMatch.value)
const reset = async () => {
  error.value = ''
  message.value = ''
  if (!passwordIsStrong.value) {
    error.value = 'Das neue Passwort erfüllt nicht alle Anforderungen.'
    return
  }
  if (password.value !== passwordConfirmation.value) {
    error.value = 'Die Passwörter stimmen nicht überein.'
    return
  }
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
<template>
  <main class="login-page">
    <section class="login-card">
      <div class="login-heading"><p>Sicherheit</p><h1>Passwort zurücksetzen</h1></div>
      <form @submit.prevent="reset">
        <label>
          <span>Neues Passwort</span>
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            minlength="12"
            pattern="[A-Za-z0-9*@_.#$%]+"
            required
          />
        </label>
        <ul class="password-requirements" aria-live="polite">
          <li v-for="rule in passwordRules" :key="rule.label" :class="{ valid: rule.valid }">
            <i :class="`fa-solid fa-${rule.valid ? 'check' : 'circle'}`" aria-hidden="true"></i>
            {{ rule.label }}
          </li>
        </ul>
        <label>
          <span>Neues Passwort bestätigen</span>
          <input
            v-model="passwordConfirmation"
            type="password"
            autocomplete="new-password"
            minlength="12"
            required
          />
        </label>
        <p v-if="passwordConfirmation" class="password-match" :class="{ valid: passwordsMatch }">
          <i :class="`fa-solid fa-${passwordsMatch ? 'check' : 'xmark'}`" aria-hidden="true"></i>
          {{ passwordsMatch ? 'Passwörter stimmen überein.' : 'Passwörter stimmen nicht überein.' }}
        </p>
        <p v-if="error" class="login-error" role="alert">{{ error }}</p>
        <p v-if="message">{{ message }}</p>
        <button type="submit" :disabled="!canSubmit">Passwort speichern</button>
      </form>
    </section>
  </main>
</template>
