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
const newUser = ref({ email: '', displayName: '', password: '', role: 'editor' })
const password = ref({ currentPassword: '', newPassword: '' })
const assignableRoles = computed(() => sessionUser.value?.role === 'boss' ? ['boss', 'owner', 'editor'] : ['owner', 'editor'])

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
    if (props.canManage) users.value = await request('/api/users') as unknown as User[]
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Benutzer konnten nicht geladen werden.'
  }
}
const createUser = async () => {
  try {
    await request('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser.value) })
    newUser.value = { email: '', displayName: '', password: '', role: 'editor' }
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
const changePassword = async () => {
  try {
    await request('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(password.value) })
    password.value = { currentPassword: '', newPassword: '' }
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
      <form class="users-form" @submit.prevent="changePassword">
        <h3>Eigenes Passwort ändern</h3>
        <input v-model="password.currentPassword" type="password" placeholder="Aktuelles Passwort" required />
        <input v-model="password.newPassword" type="password" minlength="8" placeholder="Neues Passwort (mind. 8 Zeichen)" required />
        <button class="admin-button primary" type="submit">Passwort ändern</button>
      </form>
      <form v-if="canManage" class="users-form" @submit.prevent="createUser">
        <h3>Benutzer hinzufügen</h3>
        <input v-model.trim="newUser.displayName" type="text" placeholder="Name" required />
        <input v-model.trim="newUser.email" type="email" placeholder="E-Mail" required />
        <input v-model="newUser.password" type="password" minlength="8" placeholder="Startpasswort" required />
        <select v-model="newUser.role"><option v-for="role in assignableRoles" :key="role" :value="role">{{ role }}</option></select>
        <button class="admin-button primary" type="submit">Benutzer erstellen</button>
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
