<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { readApiResponse } from '../utils/apiResponse'
const props = defineProps<{ canManage: boolean }>()

type User = { id: string; email: string; displayName: string; role: string; isActive: boolean }
type SessionUser = Pick<User, 'id' | 'email' | 'displayName' | 'role'>

const users = ref<User[]>([])
const sessionUser = ref<SessionUser | null>(null)
const error = ref('')
const notice = ref('')
const newUser = ref({ email: '', displayName: '', password: '', passwordConfirmation: '', role: 'editor' })
const password = ref({ currentPassword: '', newPassword: '', passwordConfirmation: '' })
const profile = ref({ email: '', displayName: '' })
const canSaveProfile = computed(() => profile.value.displayName.trim() !== '' && profile.value.email.includes('@'))
const assignableRoles = computed(() => sessionUser.value?.role === 'boss' ? ['boss', 'owner', 'editor'] : ['owner', 'editor'])
const passwordRules = (value: string) => [
  { label: 'Mindestens 12 Zeichen', valid: value.length >= 12 },
  { label: 'Mindestens ein Großbuchstabe', valid: /[A-Z]/.test(value) },
  { label: 'Mindestens eine Zahl', valid: /\d/.test(value) },
  { label: 'Nur Buchstaben, Zahlen oder * @ _ . # $ %', valid: /^[A-Za-z0-9*@_.#$%]*$/.test(value) },
]
const newUserPasswordRules = computed(() => passwordRules(newUser.value.password))
const changedPasswordRules = computed(() => passwordRules(password.value.newPassword))
const newUserPasswordsMatch = computed(() =>
  newUser.value.password !== '' && newUser.value.password === newUser.value.passwordConfirmation)
const changedPasswordsMatch = computed(() =>
  password.value.newPassword !== '' && password.value.newPassword === password.value.passwordConfirmation)
const canCreateUser = computed(() =>
  newUser.value.displayName.trim() !== '' &&
  newUser.value.email.includes('@') &&
  newUserPasswordRules.value.every((rule) => rule.valid) &&
  newUserPasswordsMatch.value)
const canChangePassword = computed(() =>
  password.value.currentPassword !== '' &&
  changedPasswordRules.value.every((rule) => rule.valid) &&
  changedPasswordsMatch.value)

const request = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options)
  const result = await readApiResponse<{ message?: string }>(response)
  if (!response.ok) throw new Error(result.message || 'Request failed.')
  return result
}
const load = async () => {
  error.value = ''
  try {
    const session = await request('/api/auth/session') as { user: SessionUser }
    sessionUser.value = session.user
    profile.value = { email: session.user.email, displayName: session.user.displayName }
    if (props.canManage) users.value = await request('/api/users') as unknown as User[]
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Benutzer konnten nicht geladen werden.'
  }
}
const createUser = async () => {
  if (!canCreateUser.value) return
  try {
    const payload = {
      email: newUser.value.email,
      displayName: newUser.value.displayName,
      password: newUser.value.password,
      role: newUser.value.role,
    }
    await request('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    newUser.value = { email: '', displayName: '', password: '', passwordConfirmation: '', role: 'editor' }
    notice.value = 'Benutzer wurde erstellt.'
    await load()
  } catch (reason) { error.value = reason instanceof Error ? reason.message : 'Benutzer konnte nicht erstellt werden.' }
}
const saveUser = async (user: User) => {
  try {
    await request('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) })
    notice.value = 'Berechtigungen wurden gespeichert.'
    await load()
  } catch (reason) { error.value = reason instanceof Error ? reason.message : 'Benutzer konnte nicht gespeichert werden.' }
}
const saveProfile = async () => {
  if (!canSaveProfile.value) return
  try {
    const result = await request('/api/users/self', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile.value),
    }) as { user: SessionUser }
    sessionUser.value = result.user
    profile.value = { email: result.user.email, displayName: result.user.displayName }
    notice.value = 'Eigene Daten wurden gespeichert.'
  } catch (reason) { error.value = reason instanceof Error ? reason.message : 'Eigene Daten konnten nicht gespeichert werden.' }
}
const changePassword = async () => {
  if (!canChangePassword.value) return
  try {
    const payload = { currentPassword: password.value.currentPassword, newPassword: password.value.newPassword }
    await request('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    password.value = { currentPassword: '', newPassword: '', passwordConfirmation: '' }
    notice.value = 'Passwort wurde geändert.'
  } catch (reason) { error.value = reason instanceof Error ? reason.message : 'Passwort konnte nicht geändert werden.' }
}
onMounted(load)
</script>

<template>
  <section class="admin-card users-panel">
    <div class="admin-card-header compact"><div><p>Zugriff & Sicherheit</p><h2>Benutzerverwaltung</h2><span>Passwörter sind verschlüsselt und können nicht angezeigt werden.</span></div></div>
    <p v-if="error" class="database-error">{{ error }}</p>
    <p v-if="notice" class="users-notice">{{ notice }}</p>
    <div class="users-grid">
      <form class="users-form users-profile-form" @submit.prevent="saveProfile">
        <h3>Eigene Daten ändern</h3>
        <input v-model.trim="profile.displayName" type="text" placeholder="Name" required />
        <input v-model.trim="profile.email" type="email" placeholder="E-Mail" required />
        <button class="admin-button primary" type="submit" :disabled="!canSaveProfile">Eigene Daten speichern</button>
      </form>
      <form class="users-form" @submit.prevent="changePassword">
        <h3>Eigenes Passwort ändern</h3>
        <input v-model="password.currentPassword" type="password" autocomplete="current-password" placeholder="Aktuelles Passwort" required />
        <input v-model="password.newPassword" type="password" autocomplete="new-password" minlength="12" pattern="[A-Za-z0-9*@_.#$%]+" placeholder="Neues Passwort" required />
        <ul class="users-password-requirements" aria-live="polite">
          <li v-for="rule in changedPasswordRules" :key="rule.label" :class="{ valid: rule.valid }">
            <i :class="`fa-solid fa-${rule.valid ? 'check' : 'circle'}`" aria-hidden="true"></i>{{ rule.label }}
          </li>
        </ul>
        <input v-model="password.passwordConfirmation" type="password" autocomplete="new-password" minlength="12" placeholder="Neues Passwort bestätigen" required />
        <p v-if="password.passwordConfirmation" class="users-password-match" :class="{ valid: changedPasswordsMatch }">
          <i :class="`fa-solid fa-${changedPasswordsMatch ? 'check' : 'xmark'}`" aria-hidden="true"></i>
          {{ changedPasswordsMatch ? 'Passwörter stimmen überein.' : 'Passwörter stimmen nicht überein.' }}
        </p>
        <button class="admin-button primary" type="submit" :disabled="!canChangePassword">Passwort ändern</button>
      </form>
      <form v-if="canManage" class="users-form" @submit.prevent="createUser">
        <h3>Benutzer hinzufügen</h3>
        <input v-model.trim="newUser.displayName" type="text" placeholder="Name" required />
        <input v-model.trim="newUser.email" type="email" placeholder="E-Mail" required />
        <input v-model="newUser.password" type="password" autocomplete="new-password" minlength="12" pattern="[A-Za-z0-9*@_.#$%]+" placeholder="Startpasswort" required />
        <ul class="users-password-requirements" aria-live="polite">
          <li v-for="rule in newUserPasswordRules" :key="rule.label" :class="{ valid: rule.valid }">
            <i :class="`fa-solid fa-${rule.valid ? 'check' : 'circle'}`" aria-hidden="true"></i>{{ rule.label }}
          </li>
        </ul>
        <input v-model="newUser.passwordConfirmation" type="password" autocomplete="new-password" minlength="12" placeholder="Startpasswort bestätigen" required />
        <p v-if="newUser.passwordConfirmation" class="users-password-match" :class="{ valid: newUserPasswordsMatch }">
          <i :class="`fa-solid fa-${newUserPasswordsMatch ? 'check' : 'xmark'}`" aria-hidden="true"></i>
          {{ newUserPasswordsMatch ? 'Passwörter stimmen überein.' : 'Passwörter stimmen nicht überein.' }}
        </p>
        <select v-model="newUser.role"><option v-for="role in assignableRoles" :key="role" :value="role">{{ role }}</option></select>
        <button class="admin-button primary" type="submit" :disabled="!canCreateUser">Benutzer erstellen</button>
      </form>
    </div>
    <div v-if="canManage" class="users-list">
      <article v-for="user in users" :key="user.id">
        <div><strong>{{ user.displayName || user.email }}</strong><small>{{ user.email }}</small></div>
        <select v-model="user.role" :disabled="user.role === 'boss' && sessionUser?.role !== 'boss'">
          <option v-for="role in assignableRoles" :key="role" :value="role">{{ role }}</option>
        </select>
        <label class="admin-switch"><input v-model="user.isActive" type="checkbox" :disabled="user.id === sessionUser?.id" /><span></span>{{ user.isActive ? 'Aktiv' : 'Gesperrt' }}</label>
        <button class="admin-button soft" type="button" @click="saveUser(user)">Speichern</button>
      </article>
    </div>
  </section>
</template>
