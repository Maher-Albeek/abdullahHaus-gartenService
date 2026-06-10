<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWebsiteContentStore, type ContentItem, type WebsiteSection } from '../stores/websiteContent'

const store = useWebsiteContentStore()
const activeId = ref(store.content.sections[0]?.id ?? 'hero')
const search = ref('')
const notice = ref('')
const importInput = ref<HTMLInputElement | null>(null)

const activeSection = computed(
  () => store.content.sections.find((section) => section.id === activeId.value) ?? store.content.sections[0]!,
)
const filteredSections = computed(() => {
  const query = search.value.trim().toLowerCase()
  return query
    ? store.content.sections.filter((section) => section.label.toLowerCase().includes(query))
    : store.content.sections
})
const visibleCount = computed(() => store.content.sections.filter((section) => section.enabled).length)

const labelFor = (key: string) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())

const inputType = (key: string, value: unknown) => {
  if (typeof value === 'number') return 'number'
  if (key.toLowerCase().includes('color')) return 'color'
  if (key.toLowerCase().includes('email')) return 'email'
  if (key.toLowerCase().includes('url') || key.toLowerCase().includes('video')) return 'url'
  return 'text'
}

const isLongText = (key: string, value: unknown) =>
  ['text', 'intro', 'subtitle', 'description', 'answer'].includes(key) || String(value).length > 80

const addItem = (section: WebsiteSection) => {
  const template = section.items[0]
  section.items.push(
    template
      ? Object.fromEntries(Object.entries(template).map(([key, value]) => [key, typeof value === 'number' ? 0 : '']))
      : { title: 'Neuer Eintrag', description: '' },
  )
}

const removeItem = (section: WebsiteSection, index: number) => section.items.splice(index, 1)

const exportContent = () => {
  const blob = new Blob([JSON.stringify(store.content, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'ahg-website-content.json'
  link.click()
  URL.revokeObjectURL(link.href)
  showNotice('Content exported')
}

const importContent = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  store.content = JSON.parse(await file.text())
  activeId.value = store.content.sections[0]?.id ?? ''
  showNotice('Content imported')
}

const resetContent = () => {
  if (!window.confirm('Alle Änderungen zurücksetzen?')) return
  store.reset()
  activeId.value = store.content.sections[0]?.id ?? ''
  showNotice('Content reset')
}

const showNotice = (message: string) => {
  notice.value = message
  window.setTimeout(() => (notice.value = ''), 2400)
}
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <a href="/" class="admin-brand">
        <span class="admin-brand-mark">A</span>
        <span><strong>AHG</strong><small>Content Studio</small></span>
      </a>

      <label class="admin-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input v-model="search" type="search" placeholder="Bereich suchen..." />
      </label>

      <div class="admin-nav-heading">
        <span>Website-Bereiche</span>
        <span>{{ visibleCount }}/{{ store.content.sections.length }}</span>
      </div>
      <nav class="admin-section-nav">
        <button
          v-for="section in filteredSections"
          :key="section.id"
          type="button"
          :class="{ active: activeId === section.id }"
          @click="activeId = section.id"
        >
          <i :class="`fa-solid fa-${section.enabled ? 'circle-check' : 'circle-minus'}`"></i>
          <span>{{ section.label }}</span>
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </nav>

      <div class="admin-sidebar-footer">
        <a href="/" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> Website öffnen</a>
      </div>
    </aside>

    <main class="admin-main">
      <header class="admin-topbar">
        <div>
          <p>Website-Verwaltung</p>
          <h1>Inhalte & Bereiche</h1>
        </div>
        <div class="admin-actions">
          <button type="button" class="admin-button ghost" @click="importInput?.click()">
            <i class="fa-solid fa-file-import"></i> Import
          </button>
          <input ref="importInput" hidden type="file" accept="application/json" @change="importContent" />
          <button type="button" class="admin-button ghost" @click="exportContent">
            <i class="fa-solid fa-download"></i> Export
          </button>
          <button type="button" class="admin-button primary" @click="store.save(); showNotice('Changes saved')">
            <i class="fa-solid fa-check"></i> Speichern
          </button>
        </div>
      </header>

      <section class="admin-stats">
        <article><i class="fa-solid fa-layer-group"></i><div><strong>{{ store.content.sections.length }}</strong><span>Bereiche</span></div></article>
        <article><i class="fa-solid fa-eye"></i><div><strong>{{ visibleCount }}</strong><span>Aktiv</span></div></article>
        <article><i class="fa-solid fa-pen-ruler"></i><div><strong>2</strong><span>Markenfarben</span></div></article>
        <article><i class="fa-solid fa-cloud"></i><div><strong>Auto</strong><span>Lokal gespeichert</span></div></article>
      </section>

      <div class="admin-workspace">
        <div class="admin-editor">
          <section class="admin-card">
            <div class="admin-card-header">
              <div><p>Aktiver Bereich</p><h2>{{ activeSection.label }}</h2><span>{{ activeSection.description }}</span></div>
              <label class="admin-switch"><input v-model="activeSection.enabled" type="checkbox" /><span></span>{{ activeSection.enabled ? 'Sichtbar' : 'Ausgeblendet' }}</label>
            </div>

            <div class="admin-form-grid">
              <label v-for="(value, key) in activeSection.content" :key="key" :class="{ wide: isLongText(String(key), value) }">
                <span>{{ labelFor(String(key)) }}</span>
                <textarea v-if="isLongText(String(key), value)" v-model="activeSection.content[key]" rows="3"></textarea>
                <div v-else-if="inputType(String(key), value) === 'color'" class="admin-color-field">
                  <input v-model="activeSection.content[key]" type="color" />
                  <input v-model="activeSection.content[key]" type="text" />
                </div>
                <input v-else v-model="activeSection.content[key]" :type="inputType(String(key), value)" />
              </label>
            </div>
          </section>

          <section v-if="activeSection.items.length || ['services', 'gallery', 'testimonials', 'faq'].includes(activeSection.id)" class="admin-card">
            <div class="admin-card-header compact">
              <div><p>Wiederholbare Inhalte</p><h2>Einträge</h2></div>
              <button type="button" class="admin-button soft" @click="addItem(activeSection)"><i class="fa-solid fa-plus"></i> Hinzufügen</button>
            </div>
            <div class="admin-items">
              <details v-for="(item, index) in activeSection.items" :key="index" :open="index === 0">
                <summary><span class="admin-item-index">{{ index + 1 }}</span><strong>{{ item.title || item.question || item.name || item.alt || `Eintrag ${index + 1}` }}</strong><i class="fa-solid fa-chevron-down"></i></summary>
                <div class="admin-item-body">
                  <label v-for="(value, key) in item" :key="key" :class="{ wide: isLongText(String(key), value) }">
                    <span>{{ labelFor(String(key)) }}</span>
                    <textarea v-if="isLongText(String(key), value)" v-model="item[key]" rows="3"></textarea>
                    <input v-else v-model="item[key]" :type="inputType(String(key), value)" />
                  </label>
                  <button type="button" class="admin-delete" @click="removeItem(activeSection, index)"><i class="fa-solid fa-trash"></i> Eintrag löschen</button>
                </div>
              </details>
            </div>
          </section>

          <section class="admin-card">
            <div class="admin-card-header compact"><div><p>Globale Einstellungen</p><h2>Marke & Kontakt</h2></div></div>
            <div class="admin-form-grid">
              <label v-for="(value, key) in store.content.brand" :key="key">
                <span>{{ labelFor(String(key)) }}</span>
                <div v-if="String(key).includes('Color')" class="admin-color-field"><input v-model="store.content.brand[key]" type="color" /><input v-model="store.content.brand[key]" type="text" /></div>
                <input v-else v-model="store.content.brand[key]" type="text" />
              </label>
              <label v-for="(value, key) in store.content.contact" :key="key"><span>{{ labelFor(String(key)) }}</span><input v-model="store.content.contact[key]" type="text" /></label>
            </div>
          </section>

          <button type="button" class="admin-reset" @click="resetContent"><i class="fa-solid fa-arrow-rotate-left"></i> Auf Standardinhalte zurücksetzen</button>
        </div>

        <aside class="admin-preview">
          <div class="admin-preview-label"><span>Live-Vorschau</span><i class="fa-solid fa-desktop"></i></div>
          <div class="preview-window" :style="{ '--preview-green': store.content.brand.primaryColor, '--preview-red': store.content.brand.accentColor }">
            <div class="preview-browser"><i></i><i></i><i></i><span>{{ store.content.brand.businessName }}</span></div>
            <div class="preview-page">
              <img :src="store.content.brand.logoUrl" alt="" />
              <p>{{ activeSection.content.kicker || activeSection.label }}</p>
              <h3>{{ activeSection.content.title || activeSection.label }}</h3>
              <span>{{ activeSection.content.intro || activeSection.content.subtitle || activeSection.content.text || activeSection.description }}</span>
              <div v-if="activeSection.items.length" class="preview-items">
                <div v-for="(item, index) in activeSection.items.slice(0, 3)" :key="index"><b>{{ item.title || item.question || item.name || item.alt }}</b><small>{{ item.description || item.answer || item.text || '' }}</small></div>
              </div>
              <button>{{ activeSection.content.buttonLabel || 'Mehr erfahren' }}</button>
            </div>
          </div>
          <div class="admin-order">
            <h3>Reihenfolge</h3>
            <div v-for="(section, index) in store.content.sections" :key="section.id">
              <span>{{ index + 1 }}</span><b>{{ section.label }}</b>
              <button :disabled="index === 0" @click="store.moveSection(index, -1)"><i class="fa-solid fa-arrow-up"></i></button>
              <button :disabled="index === store.content.sections.length - 1" @click="store.moveSection(index, 1)"><i class="fa-solid fa-arrow-down"></i></button>
            </div>
          </div>
        </aside>
      </div>
    </main>
    <div v-if="notice" class="admin-toast"><i class="fa-solid fa-circle-check"></i>{{ notice }}</div>
  </div>
</template>
