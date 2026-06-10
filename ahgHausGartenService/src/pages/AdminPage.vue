<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWebsiteContentStore, type ContentItem, type WebsiteSection } from '../stores/websiteContent'

const store = useWebsiteContentStore()
const activeId = ref(store.content.sections[0]?.id ?? 'hero')
const search = ref('')
const notice = ref('')
const importInput = ref<HTMLInputElement | null>(null)
const iconSearch = ref('')
const openIconPicker = ref<number | null>(null)
const newService = ref<ContentItem | null>(null)
const draggedServiceIndex = ref<number | null>(null)
const dragTargetIndex = ref<number | null>(null)
const cloneItem = (item: ContentItem) => JSON.parse(JSON.stringify(item)) as ContentItem
const serviceSection = () => store.content.sections.find((section) => section.id === 'services')
const serviceDrafts = ref<ContentItem[]>(serviceSection()?.items.map(cloneItem) ?? [])

const serviceIcons = [
  ['fa-solid fa-broom', 'Besen'],
  ['fa-solid fa-spray-can-sparkles', 'Reinigung'],
  ['fa-solid fa-soap', 'Seife'],
  ['fa-solid fa-pump-soap', 'Seifenspender'],
  ['fa-solid fa-bucket', 'Eimer'],
  ['fa-solid fa-window-maximize', 'Fenster'],
  ['fa-solid fa-glass-water', 'Glas'],
  ['fa-solid fa-house', 'Haus'],
  ['fa-solid fa-house-chimney', 'Wohnhaus'],
  ['fa-solid fa-building', 'Gebäude'],
  ['fa-solid fa-warehouse', 'Lager'],
  ['fa-solid fa-shop', 'Geschäft'],
  ['fa-solid fa-leaf', 'Blatt'],
  ['fa-solid fa-seedling', 'Pflanze'],
  ['fa-solid fa-tree', 'Baum'],
  ['fa-solid fa-spa', 'Garten'],
  ['fa-solid fa-sun', 'Sonne'],
  ['fa-solid fa-snowflake', 'Winter'],
  ['fa-solid fa-cloud-sun', 'Wetter'],
  ['fa-solid fa-droplet', 'Wasser'],
  ['fa-solid fa-faucet-drip', 'Wasserhahn'],
  ['fa-solid fa-wrench', 'Werkzeug'],
  ['fa-solid fa-screwdriver-wrench', 'Reparatur'],
  ['fa-solid fa-hammer', 'Hammer'],
  ['fa-solid fa-paint-roller', 'Streichen'],
  ['fa-solid fa-brush', 'Pinsel'],
  ['fa-solid fa-toolbox', 'Werkzeugkasten'],
  ['fa-solid fa-truck-moving', 'Umzug'],
  ['fa-solid fa-truck', 'Transport'],
  ['fa-solid fa-box-open', 'Kartons'],
  ['fa-solid fa-people-carry-box', 'Tragen'],
  ['fa-solid fa-recycle', 'Recycling'],
  ['fa-solid fa-trash-can', 'Entsorgung'],
  ['fa-solid fa-check', 'Erledigt'],
  ['fa-solid fa-shield-halved', 'Sicherheit'],
  ['fa-solid fa-key', 'Schlüssel'],
  ['fa-solid fa-clock', 'Termin'],
  ['fa-solid fa-calendar-check', 'Planung'],
  ['fa-solid fa-star', 'Premium'],
  ['fa-solid fa-thumbs-up', 'Empfohlen'],
] as const

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
const filteredServiceIcons = computed(() => {
  const query = iconSearch.value.trim().toLowerCase()
  return query
    ? serviceIcons.filter(([icon, label]) => `${icon} ${label}`.toLowerCase().includes(query))
    : serviceIcons
})

const labelFor = (key: string) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())

const inputType = (key: string, value: unknown) => {
  if (typeof value === 'boolean') return 'checkbox'
  if (typeof value === 'number') return 'number'
  if (key.toLowerCase().includes('color')) return 'color'
  if (key.toLowerCase().includes('email')) return 'email'
  if (key.toLowerCase().includes('url') || key.toLowerCase().includes('video')) return 'url'
  return 'text'
}

const isLongText = (key: string, value: unknown) =>
  ['text', 'intro', 'subtitle', 'description', 'desc', 'details', 'answer'].includes(key) || String(value).length > 80

const updateContentValue = (item: ContentItem, key: string, event: Event) => {
  const input = event.target as HTMLInputElement | HTMLTextAreaElement
  item[key] = input.type === 'number' ? Number(input.value) : input.value
}

const serviceColor = (item: ContentItem, index: number) => {
  const colors = String(item.grad ?? '').split(',').map((color) => color.trim())
  const color = colors[index]
  return /^#[0-9a-f]{6}$/i.test(color ?? '') ? color! : index === 0 ? '#4D8B23' : '#62af2d'
}

const updateServiceColor = (item: ContentItem, index: number, event: Event) => {
  const colors = [serviceColor(item, 0), serviceColor(item, 1)]
  colors[index] = (event.target as HTMLInputElement).value
  item.grad = colors.join(', ')
}

const addItem = (section: WebsiteSection) => {
  if (section.id === 'services') {
    newService.value = {
      title: 'Neue Dienstleistung',
      desc: '',
      icon: 'fa-solid fa-broom',
      details: '',
      grad: '#4D8B23, #62af2d',
      featured: false,
    }
    openIconPicker.value = null
    iconSearch.value = ''
    return
  }

  const template = section.items[0]
  section.items.push(
    template
      ? Object.fromEntries(Object.entries(template).map(([key, value]) => [key, typeof value === 'number' ? 0 : '']))
      : { title: 'Neuer Eintrag', description: '' },
  )
}

const editableItem = (section: WebsiteSection, item: ContentItem, index: number) =>
  section.id === 'services' ? (serviceDrafts.value[index] ?? item) : item

const saveService = (index: number) => {
  const services = serviceSection()
  const draft = serviceDrafts.value[index]
  if (!services || !draft) return
  services.items[index] = cloneItem(draft)
  showNotice('Dienstleistung gespeichert')
}

const cancelServiceEdit = (index: number) => {
  const saved = serviceSection()?.items[index]
  if (!saved) return
  serviceDrafts.value[index] = cloneItem(saved)
  openIconPicker.value = null
  showNotice('Änderungen verworfen')
}

const syncServiceDrafts = () => {
  serviceDrafts.value = serviceSection()?.items.map(cloneItem) ?? []
}

const removeItem = (section: WebsiteSection, index: number) => {
  section.items.splice(index, 1)
  if (section.id === 'services') serviceDrafts.value.splice(index, 1)
}

const startServiceDrag = (index: number, event: DragEvent) => {
  draggedServiceIndex.value = index
  dragTargetIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

const dropService = (targetIndex: number) => {
  const sourceIndex = draggedServiceIndex.value
  const services = serviceSection()
  if (sourceIndex === null || sourceIndex === targetIndex || !services) {
    endServiceDrag()
    return
  }

  const [service] = services.items.splice(sourceIndex, 1)
  const [draft] = serviceDrafts.value.splice(sourceIndex, 1)
  if (service && draft) {
    services.items.splice(targetIndex, 0, service)
    serviceDrafts.value.splice(targetIndex, 0, draft)
    showNotice('Reihenfolge gespeichert')
  }
  endServiceDrag()
}

const moveService = (index: number, direction: -1 | 1) => {
  const targetIndex = index + direction
  const services = serviceSection()
  if (!services || targetIndex < 0 || targetIndex >= services.items.length) return

  const [service] = services.items.splice(index, 1)
  const [draft] = serviceDrafts.value.splice(index, 1)
  if (service && draft) {
    services.items.splice(targetIndex, 0, service)
    serviceDrafts.value.splice(targetIndex, 0, draft)
    showNotice('Reihenfolge gespeichert')
  }
}

const endServiceDrag = () => {
  draggedServiceIndex.value = null
  dragTargetIndex.value = null
}

const selectServiceIcon = (item: ContentItem, icon: string) => {
  item.icon = icon
  openIconPicker.value = null
  iconSearch.value = ''
}

const closeServiceModal = () => {
  newService.value = null
  openIconPicker.value = null
  iconSearch.value = ''
}

const createService = () => {
  if (!newService.value) return
  const services = store.content.sections.find((section) => section.id === 'services')
  if (!services) return
  const service = cloneItem(newService.value)
  services.items.push(service)
  serviceDrafts.value.push(cloneItem(service))
  closeServiceModal()
  showNotice('Dienstleistung hinzugefügt')
}

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
  syncServiceDrafts()
  activeId.value = store.content.sections[0]?.id ?? ''
  showNotice('Content imported')
}

const resetContent = () => {
  if (!window.confirm('Alle Änderungen zurücksetzen?')) return
  store.reset()
  syncServiceDrafts()
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
                <textarea v-if="isLongText(String(key), value)" :value="String(value)" rows="3" @input="updateContentValue(activeSection.content, String(key), $event)"></textarea>
                <div v-else-if="inputType(String(key), value) === 'color'" class="admin-color-field">
                  <input v-model="activeSection.content[key]" type="color" />
                  <input v-model="activeSection.content[key]" type="text" />
                </div>
                <input v-else :value="String(value)" :type="inputType(String(key), value)" @input="updateContentValue(activeSection.content, String(key), $event)" />
              </label>
            </div>
          </section>

          <section v-if="activeSection.items.length || ['services', 'gallery', 'testimonials', 'faq'].includes(activeSection.id)" class="admin-card">
            <div class="admin-card-header compact">
              <div><p>Wiederholbare Inhalte</p><h2>Einträge</h2></div>
              <button type="button" class="admin-button soft" @click="addItem(activeSection)"><i class="fa-solid fa-plus"></i> Hinzufügen</button>
            </div>
            <div class="admin-items">
              <details
                v-for="(item, index) in activeSection.items"
                :key="index"
                :open="activeSection.id !== 'services' && index === 0"
                :class="{ 'admin-item-drag-target': activeSection.id === 'services' && dragTargetIndex === index && draggedServiceIndex !== index }"
                @dragover.prevent="activeSection.id === 'services' && (dragTargetIndex = index)"
                @drop.prevent="activeSection.id === 'services' && dropService(index)"
              >
                <summary>
                  <span
                    v-if="activeSection.id === 'services'"
                    class="admin-drag-handle"
                    draggable="true"
                    aria-label="Dienstleistung verschieben"
                    title="Ziehen, um Reihenfolge zu ändern"
                    @dragstart.stop="startServiceDrag(index, $event)"
                    @dragend="endServiceDrag"
                  >
                    <i class="fa-solid fa-grip-vertical"></i>
                  </span>
                  <span class="admin-item-index">{{ index + 1 }}</span>
                  <strong>{{ item.title || item.question || item.name || item.alt || `Eintrag ${index + 1}` }}</strong>
                  <i class="fa-solid fa-chevron-down"></i>
                </summary>
                <div class="admin-item-body">
                  <template v-for="(value, key) in editableItem(activeSection, item, index)" :key="key">
                    <div v-if="activeSection.id === 'services' && key === 'icon'" class="admin-icon-field wide">
                      <span>Icon auswählen</span>
                      <button
                        type="button"
                        class="admin-icon-select"
                        :aria-expanded="openIconPicker === index"
                        @click="openIconPicker = openIconPicker === index ? null : index; iconSearch = ''"
                      >
                        <i :class="String(editableItem(activeSection, item, index).icon)"></i>
                        <span>{{ serviceIcons.find(([icon]) => icon === editableItem(activeSection, item, index).icon)?.[1] || String(editableItem(activeSection, item, index).icon) }}</span>
                        <i class="fa-solid fa-chevron-down"></i>
                      </button>
                      <div v-if="openIconPicker === index" class="admin-icon-dropdown">
                        <input v-model="iconSearch" class="admin-icon-search" type="search" placeholder="Icons durchsuchen..." />
                        <div class="admin-icon-grid">
                          <button
                            v-for="[icon, label] in filteredServiceIcons"
                            :key="icon"
                            type="button"
                            :class="{ active: editableItem(activeSection, item, index).icon === icon }"
                            :title="label"
                            :aria-label="`${label} auswählen`"
                            @click="selectServiceIcon(editableItem(activeSection, item, index), icon)"
                          >
                            <i :class="icon"></i>
                            <small>{{ label }}</small>
                          </button>
                        </div>
                        <label class="admin-icon-custom">
                          <span>Eigene Font Awesome Klasse</span>
                          <input
                            :value="String(editableItem(activeSection, item, index).icon)"
                            type="text"
                            placeholder="z. B. fa-solid fa-broom"
                            @input="updateContentValue(editableItem(activeSection, item, index), 'icon', $event)"
                          />
                        </label>
                      </div>
                    </div>
                    <div v-else-if="activeSection.id === 'services' && key === 'grad'" class="admin-service-colors wide">
                      <span>Kartenfarben</span>
                      <div class="admin-gradient-preview" :style="{ background: `linear-gradient(90deg, ${String(editableItem(activeSection, item, index).grad)})` }"></div>
                      <label>
                        <span>Farbe 1</span>
                        <input :value="serviceColor(editableItem(activeSection, item, index), 0)" type="color" @input="updateServiceColor(editableItem(activeSection, item, index), 0, $event)" />
                      </label>
                      <label>
                        <span>Farbe 2</span>
                        <input :value="serviceColor(editableItem(activeSection, item, index), 1)" type="color" @input="updateServiceColor(editableItem(activeSection, item, index), 1, $event)" />
                      </label>
                    </div>
                    <label v-else :class="{ wide: isLongText(String(key), value) }">
                      <span>{{ labelFor(String(key)) }}</span>
                      <textarea v-if="isLongText(String(key), value)" :value="String(value)" rows="3" @input="updateContentValue(editableItem(activeSection, item, index), String(key), $event)"></textarea>
                      <input v-else-if="inputType(String(key), value) === 'checkbox'" v-model="editableItem(activeSection, item, index)[key]" type="checkbox" />
                      <input v-else :value="String(value)" :type="inputType(String(key), value)" @input="updateContentValue(editableItem(activeSection, item, index), String(key), $event)" />
                    </label>
                  </template>
                  <div v-if="activeSection.id === 'services'" class="admin-item-actions">
                    <div class="admin-mobile-sort">
                      <button type="button" :disabled="index === 0" aria-label="Dienstleistung nach oben verschieben" @click="moveService(index, -1)">
                        <i class="fa-solid fa-arrow-up"></i>
                      </button>
                      <button type="button" :disabled="index === activeSection.items.length - 1" aria-label="Dienstleistung nach unten verschieben" @click="moveService(index, 1)">
                        <i class="fa-solid fa-arrow-down"></i>
                      </button>
                    </div>
                    <button type="button" class="admin-button ghost" @click="cancelServiceEdit(index)">Abbrechen</button>
                    <button type="button" class="admin-button primary" @click="saveService(index)"><i class="fa-solid fa-check"></i> Speichern</button>
                    <button type="button" class="admin-delete" @click="removeItem(activeSection, index)"><i class="fa-solid fa-trash"></i> Eintrag löschen</button>
                  </div>
                  <button v-else type="button" class="admin-delete" @click="removeItem(activeSection, index)"><i class="fa-solid fa-trash"></i> Eintrag löschen</button>
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
                <div v-for="(item, index) in activeSection.items.slice(0, 3)" :key="index"><b>{{ item.title || item.question || item.name || item.alt }}</b><small>{{ item.desc || item.description || item.answer || item.text || '' }}</small></div>
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
    <div v-if="newService" class="admin-modal-backdrop" @click.self="closeServiceModal">
      <form class="admin-modal" @submit.prevent="createService">
        <header class="admin-modal-header">
          <div>
            <p>Neue Dienstleistung</p>
            <h2>Vollständigen Eintrag erstellen</h2>
          </div>
          <button type="button" aria-label="Modal schließen" @click="closeServiceModal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="admin-modal-body">
          <label>
            <span>Titel</span>
            <input
              required
              :value="String(newService.title)"
              type="text"
              placeholder="Name der Dienstleistung"
              @input="updateContentValue(newService, 'title', $event)"
            />
          </label>

          <div class="admin-icon-field wide">
            <span>Icon auswählen</span>
            <button
              type="button"
              class="admin-icon-select"
              :aria-expanded="openIconPicker === -1"
              @click="openIconPicker = openIconPicker === -1 ? null : -1; iconSearch = ''"
            >
              <i :class="String(newService.icon)"></i>
              <span>{{ serviceIcons.find(([icon]) => icon === newService?.icon)?.[1] || String(newService.icon) }}</span>
              <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div v-if="openIconPicker === -1" class="admin-icon-dropdown">
              <input v-model="iconSearch" class="admin-icon-search" type="search" placeholder="Icons durchsuchen..." />
              <div class="admin-icon-grid">
                <button
                  v-for="[icon, label] in filteredServiceIcons"
                  :key="icon"
                  type="button"
                  :class="{ active: newService.icon === icon }"
                  :aria-label="`${label} auswählen`"
                  @click="selectServiceIcon(newService, icon)"
                >
                  <i :class="icon"></i>
                  <small>{{ label }}</small>
                </button>
              </div>
              <label class="admin-icon-custom">
                <span>Eigene Font Awesome Klasse</span>
                <input
                  :value="String(newService.icon)"
                  type="text"
                  placeholder="z. B. fa-solid fa-broom"
                  @input="updateContentValue(newService, 'icon', $event)"
                />
              </label>
            </div>
          </div>

          <label class="wide">
            <span>Beschreibung</span>
            <textarea
              required
              :value="String(newService.desc)"
              rows="4"
              placeholder="Kurze Beschreibung der Dienstleistung"
              @input="updateContentValue(newService, 'desc', $event)"
            ></textarea>
          </label>

          <label class="wide">
            <span>Details, ein Punkt pro Zeile</span>
            <textarea
              :value="String(newService.details)"
              rows="4"
              placeholder="Erster Leistungspunkt&#10;Zweiter Leistungspunkt"
              @input="updateContentValue(newService, 'details', $event)"
            ></textarea>
          </label>

          <div class="admin-service-colors">
            <span>Kartenfarben</span>
            <div class="admin-gradient-preview" :style="{ background: `linear-gradient(90deg, ${String(newService.grad)})` }"></div>
            <label>
              <span>Farbe 1</span>
              <input :value="serviceColor(newService, 0)" type="color" @input="updateServiceColor(newService, 0, $event)" />
            </label>
            <label>
              <span>Farbe 2</span>
              <input :value="serviceColor(newService, 1)" type="color" @input="updateServiceColor(newService, 1, $event)" />
            </label>
          </div>

          <label class="admin-modal-featured">
            <input v-model="newService.featured" type="checkbox" />
            <span><strong>Beliebtester Dienst</strong>Auf der Karte hervorheben</span>
          </label>
        </div>

        <footer class="admin-modal-actions">
          <button type="button" class="admin-button ghost" @click="closeServiceModal">Abbrechen</button>
          <button type="submit" class="admin-button primary">
            <i class="fa-solid fa-plus"></i> Dienstleistung hinzufügen
          </button>
        </footer>
      </form>
    </div>
    <div v-if="notice" class="admin-toast"><i class="fa-solid fa-circle-check"></i>{{ notice }}</div>
  </div>
</template>
