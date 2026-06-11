<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useWebsiteContentStore, type ContentItem, type WebsiteSection } from '../stores/websiteContent'
import { imgToAvif } from '../utils/imgToAvif'
import { createMessagesPdfBlob } from '../utils/messagesToPdf'

type ContactMessage = {
  id: string
  name: string
  email: string
  service: string
  message: string
  createdAt: string
  read?: boolean
}

const store = useWebsiteContentStore()
const storedActiveId = window.localStorage.getItem('ahg-admin-active-panel')
const validActiveIds = ['general', 'messages', ...store.content.sections.map((section) => section.id)]
const activeId = ref(storedActiveId && validActiveIds.includes(storedActiveId) ? storedActiveId : 'general')
const search = ref('')
const notice = ref('')
const importInput = ref<HTMLInputElement | null>(null)
const iconSearch = ref('')
const openIconPicker = ref<number | null>(null)
const newService = ref<ContentItem | null>(null)
const draggedItemIndex = ref<number | null>(null)
const dragTargetIndex = ref<number | null>(null)
const draggedGroupId = ref<string | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)
const galleryDragActive = ref(false)
const galleryUploading = ref(false)
const galleryError = ref('')
const aboutInput = ref<HTMLInputElement | null>(null)
const aboutDragActive = ref(false)
const aboutUploading = ref(false)
const aboutError = ref('')
const messages = ref<ContactMessage[]>([])
const messagesLoading = ref(false)
const messagesError = ref('')
const openMessageIds = ref<string[]>([])
const selectedMessageIds = ref<string[]>([])
const unreadMessageCount = computed(() => messages.value.filter((message) => message.read !== true).length)
const readMessageCount = computed(() => messages.value.filter((message) => message.read === true).length)
const selectedMessages = computed(() => messages.value.filter((message) => selectedMessageIds.value.includes(message.id)))
const allMessagesSelected = computed(() => messages.value.length > 0 && selectedMessageIds.value.length === messages.value.length)
let messagePollTimer: number | undefined
const cloneItem = (item: ContentItem) => JSON.parse(JSON.stringify(item)) as ContentItem
const serviceSection = () => store.content.sections.find((section) => section.id === 'services')
const benefitsSection = () => store.content.sections.find((section) => section.id === 'benefits')
const serviceDrafts = ref<ContentItem[]>(serviceSection()?.items.map(cloneItem) ?? [])
const benefitDrafts = ref<ContentItem[]>(benefitsSection()?.items.map(cloneItem) ?? [])

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
const isGeneral = computed(() => activeId.value === 'general')
const isMessages = computed(() => activeId.value === 'messages')
const filteredSections = computed(() => {
  const query = search.value.trim().toLowerCase()
  return query
    ? store.content.sections.filter((section) => section.label.toLowerCase().includes(query))
    : store.content.sections
})
const visibleCount = computed(() => store.content.sections.filter((section) => section.enabled).length)
const itemGroups = computed(() => {
  const entries = activeSection.value.items.map((item, index) => ({ item, index }))
  if (activeSection.value.id !== 'benefits') {
    return [{ id: 'items', title: 'Einträge', description: 'Wiederholbare Inhalte', entries }]
  }

  return [
    {
      id: 'benefit',
      title: 'Vorteile',
      description: 'Titel, Beschreibung und Vorteile',
      entries: entries.filter(({ item }) => item.kind === 'benefit'),
    },
    {
      id: 'concern',
      title: 'Anliegen',
      description: 'Titel, Beschreibung und Antworten',
      entries: entries.filter(({ item }) => item.kind === 'concern'),
    },
  ]
})
const benefitGroupFields = (groupId: string): Array<[string, string]> =>
  groupId === 'benefit'
      ? [
        ['kicker', 'Kicker'],
        ['title', 'Titel'],
        ['intro', 'Beschreibung'],
      ]
    : [
        ['concernsKicker', 'Kicker'],
        ['concernsTitle', 'Titel'],
        ['concernsIntro', 'Beschreibung'],
        ['buttonLabel', 'Button'],
      ]
const sortLabel = (groupId: string) =>
  groupId === 'items' ? 'Dienstleistung' : groupId === 'benefit' ? 'Vorteil' : 'Anliegen'
const filteredServiceIcons = computed(() => {
  const query = iconSearch.value.trim().toLowerCase()
  return query
    ? serviceIcons.filter(([icon, label]) => `${icon} ${label}`.toLowerCase().includes(query))
    : serviceIcons
})

const labelFor = (key: string) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())

const formatMessageDate = (value: string) =>
  new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const loadMessages = async (notify = false) => {
  messagesLoading.value = true
  messagesError.value = ''
  try {
    const previousUnreadCount = unreadMessageCount.value
    const response = await fetch('/api/messages')
    if (!response.ok) throw new Error('Nachrichten konnten nicht geladen werden.')
    messages.value = (await response.json()) as ContactMessage[]
    selectedMessageIds.value = selectedMessageIds.value.filter((id) => messages.value.some((message) => message.id === id))
    if (notify && unreadMessageCount.value > previousUnreadCount) {
      showNotice(`${unreadMessageCount.value - previousUnreadCount} neue Nachricht`)
    }
  } catch (error) {
    messagesError.value = error instanceof Error ? error.message : 'Nachrichten konnten nicht geladen werden.'
  } finally {
    messagesLoading.value = false
  }
}

const openMessages = () => {
  activeId.value = 'messages'
  void loadMessages()
}

const toggleMessage = async (entry: ContactMessage) => {
  if (openMessageIds.value.includes(entry.id)) {
    openMessageIds.value = openMessageIds.value.filter((id) => id !== entry.id)
    return
  }
  openMessageIds.value = [...openMessageIds.value, entry.id]
  if (entry.read === true) return
  const response = await fetch(`/api/messages?id=${encodeURIComponent(entry.id)}`, { method: 'PATCH' })
  if (!response.ok) {
    showNotice('Nachricht konnte nicht als gelesen markiert werden')
    return
  }
  entry.read = true
}

const deleteMessage = async (id: string) => {
  const response = await fetch(`/api/messages?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!response.ok) {
    showNotice('Nachricht konnte nicht gelöscht werden')
    return
  }
  messages.value = messages.value.filter((message) => message.id !== id)
  selectedMessageIds.value = selectedMessageIds.value.filter((selectedId) => selectedId !== id)
  showNotice('Nachricht gelöscht')
}

const toggleAllMessages = () => {
  selectedMessageIds.value = allMessagesSelected.value ? [] : messages.value.map((message) => message.id)
}

const deleteSelectedMessages = async () => {
  if (!selectedMessageIds.value.length) return
  const results = await Promise.all(selectedMessageIds.value.map(async (id) => {
    const response = await fetch(`/api/messages?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    return response.ok ? id : null
  }))
  const deletedIds = results.filter((id): id is string => id !== null)
  messages.value = messages.value.filter((message) => !deletedIds.includes(message.id))
  selectedMessageIds.value = selectedMessageIds.value.filter((id) => !deletedIds.includes(id))
  showNotice(`${deletedIds.length} Nachrichten gelöscht`)
}

const exportMessagesPdf = () => {
  if (!selectedMessages.value.length) return
  const url = URL.createObjectURL(createMessagesPdfBlob(selectedMessages.value))
  const link = document.createElement('a')
  link.href = url
  link.download = `kontakt-nachrichten-${new Date().toISOString().slice(0, 10)}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  void loadMessages()
  messagePollTimer = window.setInterval(() => void loadMessages(true), 30000)
})

onUnmounted(() => {
  if (messagePollTimer) window.clearInterval(messagePollTimer)
})

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

const addItem = (section: WebsiteSection, kind?: 'benefit' | 'concern') => {
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

  if (section.id === 'benefits') {
    const item: ContentItem =
      kind === 'concern'
        ? { kind: 'concern', question: 'Neue Frage', answer: '' }
        : { kind: 'benefit', icon: 'fa-solid fa-circle-check', title: 'Neuer Vorteil', text: '' }
    section.items.push(item)
    benefitDrafts.value.push(cloneItem(item))
    return
  }

  const template = section.items[0]
  section.items.push(
    template
      ? Object.fromEntries(Object.entries(template).map(([key, value]) => [key, typeof value === 'number' ? 0 : '']))
      : { title: 'Neuer Eintrag', description: '' },
  )
}

const addGroupItem = (section: WebsiteSection, groupId: string) => {
  addItem(section, groupId === 'concern' ? 'concern' : 'benefit')
}

const isImageFile = (file: File) =>
  file.type.startsWith('image/') || /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i.test(file.name)

const responseMessage = async (response: Response) => {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message || `Upload fehlgeschlagen (${response.status}).`
  } catch {
    return `Upload-API nicht erreichbar (${response.status}). Bitte die Website mit "npm run dev" oder "npm run preview" starten.`
  }
}

const uploadGalleryFiles = async (files: FileList | File[]) => {
  const images = Array.from(files).filter(isImageFile)
  if (!images.length) {
    galleryError.value = 'Bitte mindestens eine Bilddatei auswählen.'
    return
  }

  galleryUploading.value = true
  galleryError.value = ''
  try {
    const apiCheck = await fetch('/api/gallery')
    if (!apiCheck.ok) throw new Error(await responseMessage(apiCheck))

    for (const image of images) {
      const [avif] = await imgToAvif(image, { quality: 75, maxDimension: 2400 })
      if (!avif) continue
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'image/avif',
          'X-File-Name': encodeURIComponent(avif.name),
          'X-Image-Alt': encodeURIComponent(image.name.replace(/\.[^.]+$/, '')),
        },
        body: avif,
      })
      if (!response.ok) throw new Error(await responseMessage(response))

      const record = (await response.json()) as ContentItem
      const gallery = store.content.sections.find((section) => section.id === 'gallery')
      if (gallery && !gallery.items.some((item) => item.imageUrl === record.imageUrl)) gallery.items.push(record)
    }
    showNotice(images.length === 1 ? 'Bild als AVIF gespeichert' : `${images.length} Bilder als AVIF gespeichert`)
  } catch (error) {
    galleryError.value = error instanceof Error ? error.message : 'Upload fehlgeschlagen.'
  } finally {
    galleryUploading.value = false
    if (galleryInput.value) galleryInput.value.value = ''
  }
}

const dropGalleryFiles = (event: DragEvent) => {
  galleryDragActive.value = false
  if (event.dataTransfer?.files) void uploadGalleryFiles(event.dataTransfer.files)
}

const aboutImageUrls = () =>
  [activeSection.value.content.imageUrl, activeSection.value.content.imageUrl2]
    .map((url) => String(url ?? ''))
    .filter(Boolean)

const deleteUploadedImage = async (imageUrl: string) => {
  if (!imageUrl.startsWith('/gallery/')) return
  const response = await fetch(`/api/gallery?path=${encodeURIComponent(imageUrl)}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await responseMessage(response))
}

const uploadAboutImage = async (files: FileList | File[]) => {
  const images = Array.from(files).filter(isImageFile)
  if (!images.length) {
    aboutError.value = 'Bitte eine Bilddatei auswählen.'
    return
  }
  if (images.length > 2) {
    aboutError.value = 'Bitte maximal zwei Bilder auswählen.'
    return
  }

  aboutUploading.value = true
  aboutError.value = ''
  const previousUrls = aboutImageUrls()
  const uploadedUrls: string[] = []
  try {
    for (const image of images) {
      const [avif] = await imgToAvif(image, { quality: 75, maxDimension: 2400 })
      if (!avif) throw new Error('Das Bild konnte nicht konvertiert werden.')

      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'image/avif',
          'X-File-Name': encodeURIComponent(`about-${avif.name}`),
          'X-Image-Alt': encodeURIComponent(image.name.replace(/\.[^.]+$/, '')),
          'X-Image-Usage': 'about',
        },
        body: avif,
      })
      if (!response.ok) throw new Error(await responseMessage(response))

      const record = (await response.json()) as ContentItem
      uploadedUrls.push(String(record.imageUrl))
    }

    activeSection.value.content.imageUrl = uploadedUrls[0] ?? ''
    activeSection.value.content.imageUrl2 = uploadedUrls[1] ?? ''
    await store.save()
    const cleanupResults = await Promise.allSettled(
      previousUrls.filter((url) => !uploadedUrls.includes(url)).map(deleteUploadedImage),
    )
    if (cleanupResults.some((result) => result.status === 'rejected')) {
      aboutError.value = 'Die neuen Bilder wurden gespeichert, aber mindestens ein altes Bild konnte nicht gelöscht werden.'
    }
    showNotice(images.length === 1 ? 'Über-uns-Bild ersetzt' : 'Zwei Über-uns-Bilder ersetzt')
  } catch (error) {
    activeSection.value.content.imageUrl = previousUrls[0] ?? ''
    activeSection.value.content.imageUrl2 = previousUrls[1] ?? ''
    await Promise.all(uploadedUrls.filter((url) => !previousUrls.includes(url)).map(deleteUploadedImage)).catch(() => undefined)
    aboutError.value = error instanceof Error ? error.message : 'Upload fehlgeschlagen.'
  } finally {
    aboutUploading.value = false
    if (aboutInput.value) aboutInput.value.value = ''
  }
}

const dropAboutImage = (event: DragEvent) => {
  aboutDragActive.value = false
  if (event.dataTransfer?.files) void uploadAboutImage(event.dataTransfer.files)
}

const removeGalleryItem = async (section: WebsiteSection, index: number) => {
  const imageUrl = String(section.items[index]?.imageUrl ?? '')
  if (imageUrl.startsWith('/gallery/')) {
    const response = await fetch(`/api/gallery?path=${encodeURIComponent(imageUrl)}`, { method: 'DELETE' })
    if (!response.ok) {
      galleryError.value = await responseMessage(response)
      return
    }
  }
  removeItem(section, index)
  showNotice('Galeriebild gelöscht')
}

const editableItem = (section: WebsiteSection, item: ContentItem, index: number) =>
  section.id === 'services'
    ? (serviceDrafts.value[index] ?? item)
    : section.id === 'benefits'
      ? (benefitDrafts.value[index] ?? item)
      : item

const saveService = (index: number) => {
  const services = serviceSection()
  const draft = serviceDrafts.value[index]
  if (!services || !draft) return
  services.items[index] = cloneItem(draft)
  showNotice('Dienstleistung gespeichert')
}

const saveBenefit = (index: number) => {
  const benefits = benefitsSection()
  const draft = benefitDrafts.value[index]
  const saved = benefits?.items[index]
  if (!benefits || !draft || !saved) return
  const item = cloneItem(draft)
  item.kind = String(saved.kind)
  benefits.items[index] = item
  showNotice('Eintrag gespeichert')
}

const cancelServiceEdit = (index: number) => {
  const saved = serviceSection()?.items[index]
  if (!saved) return
  serviceDrafts.value[index] = cloneItem(saved)
  openIconPicker.value = null
  showNotice('Änderungen verworfen')
}

const cancelBenefitEdit = (index: number) => {
  const saved = benefitsSection()?.items[index]
  if (!saved) return
  benefitDrafts.value[index] = cloneItem(saved)
  openIconPicker.value = null
  showNotice('Änderungen verworfen')
}

const syncServiceDrafts = () => {
  serviceDrafts.value = serviceSection()?.items.map(cloneItem) ?? []
  benefitDrafts.value = benefitsSection()?.items.map(cloneItem) ?? []
}

watch(() => store.content, syncServiceDrafts)
watch(activeId, (value) => window.localStorage.setItem('ahg-admin-active-panel', value), { immediate: true })

const removeItem = (section: WebsiteSection, index: number) => {
  section.items.splice(index, 1)
  if (section.id === 'services') serviceDrafts.value.splice(index, 1)
  if (section.id === 'benefits') benefitDrafts.value.splice(index, 1)
}

const startItemDrag = (index: number, groupId: string, event: DragEvent) => {
  draggedItemIndex.value = index
  dragTargetIndex.value = index
  draggedGroupId.value = groupId
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

const reorderItem = (section: WebsiteSection, sourceIndex: number, targetIndex: number) => {
  if (sourceIndex === targetIndex) return
  const drafts = section.id === 'services' ? serviceDrafts.value : benefitDrafts.value
  const [item] = section.items.splice(sourceIndex, 1)
  const [draft] = drafts.splice(sourceIndex, 1)
  if (!item || !draft) return
  section.items.splice(targetIndex, 0, item)
  drafts.splice(targetIndex, 0, draft)
  showNotice('Reihenfolge gespeichert')
}

const dropItem = (targetIndex: number, groupId: string) => {
  const sourceIndex = draggedItemIndex.value
  if (sourceIndex === null || draggedGroupId.value !== groupId) {
    endItemDrag()
    return
  }

  reorderItem(activeSection.value, sourceIndex, targetIndex)
  endItemDrag()
}

const moveItem = (sourceIndex: number, targetIndex: number | undefined) => {
  if (targetIndex === undefined) return
  reorderItem(activeSection.value, sourceIndex, targetIndex)
}

const endItemDrag = () => {
  draggedItemIndex.value = null
  dragTargetIndex.value = null
  draggedGroupId.value = null
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
  showNotice('Content imported')
}

const saveContent = async () => {
  try {
    await store.save()
    showNotice('Inhalte in Datenbank gespeichert')
  } catch {
    showNotice(store.error || 'Speichern fehlgeschlagen')
  }
}

const resetContent = async () => {
  if (!window.confirm('Alle Änderungen zurücksetzen?')) return
  try {
    await store.reset()
    syncServiceDrafts()
    showNotice('Standardinhalte in Datenbank gespeichert')
  } catch {
    showNotice(store.error || 'Zurücksetzen fehlgeschlagen')
  }
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
        <span>Verwaltung</span>
      </div>
      <nav class="admin-section-nav admin-general-nav">
        <button type="button" :class="{ active: isGeneral }" @click="activeId = 'general'">
          <i class="fa-solid fa-sliders"></i>
          <span>General</span>
          <i class="fa-solid fa-chevron-right"></i>
        </button>
        <button type="button" :class="{ active: isMessages }" @click="openMessages">
          <i class="fa-solid fa-inbox"></i>
          <span>Nachrichten <b v-if="unreadMessageCount" class="admin-unread-badge">{{ unreadMessageCount }}</b></span>
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </nav>

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
          <h1>{{ isGeneral ? 'General' : isMessages ? 'Nachrichten' : 'Inhalte & Bereiche' }}</h1>
        </div>
        <div class="admin-actions">
          <button type="button" class="admin-notification-button" aria-label="Nachrichten öffnen" @click="openMessages">
            <i class="fa-solid fa-bell"></i>
            <b v-if="unreadMessageCount">{{ unreadMessageCount }}</b>
          </button>
          <button type="button" class="admin-button ghost" @click="importInput?.click()">
            <i class="fa-solid fa-file-import"></i> Import
          </button>
          <input ref="importInput" hidden type="file" accept="application/json" @change="importContent" />
          <button type="button" class="admin-button ghost" @click="exportContent">
            <i class="fa-solid fa-download"></i> Export
          </button>
          <button type="button" class="admin-button primary" :disabled="store.saving" @click="saveContent">
            <i :class="`fa-solid fa-${store.saving ? 'spinner fa-spin' : 'database'}`"></i>
            {{ store.saving ? 'Speichert...' : 'In Datenbank speichern' }}
          </button>
        </div>
      </header>

      <div class="admin-workspace" :class="{ 'admin-workspace-single': !isGeneral || isMessages }">
        <div class="admin-editor">
          <section v-if="!isGeneral && !isMessages" class="admin-card">
            <div class="admin-card-header">
              <div><p>Aktiver Bereich</p><h2>{{ activeSection.label }}</h2><span>{{ activeSection.description }}</span></div>
              <label class="admin-switch"><input v-model="activeSection.enabled" type="checkbox" /><span></span>{{ activeSection.enabled ? 'Sichtbar' : 'Ausgeblendet' }}</label>
            </div>

            <div v-if="activeSection.id !== 'benefits'" class="admin-form-grid">
              <label
                v-for="(value, key) in activeSection.content"
                v-show="activeSection.id !== 'about' || !['imageUrl', 'imageUrl2'].includes(String(key))"
                :key="key"
                :class="{ wide: isLongText(String(key), value) }"
              >
                <span>{{ labelFor(String(key)) }}</span>
                <textarea v-if="isLongText(String(key), value)" :value="String(value)" rows="3" @input="updateContentValue(activeSection.content, String(key), $event)"></textarea>
                <div v-else-if="inputType(String(key), value) === 'color'" class="admin-color-field">
                  <input v-model="activeSection.content[key]" type="color" />
                  <input v-model="activeSection.content[key]" type="text" />
                </div>
                <input v-else :value="String(value)" :type="inputType(String(key), value)" @input="updateContentValue(activeSection.content, String(key), $event)" />
              </label>
            </div>
            <div
              v-if="activeSection.id === 'about'"
              class="admin-about-image"
              :class="{ active: aboutDragActive, busy: aboutUploading }"
              @dragenter.prevent="aboutDragActive = true"
              @dragover.prevent="aboutDragActive = true"
              @dragleave.prevent="aboutDragActive = false"
              @drop.prevent="dropAboutImage"
            >
              <div v-if="aboutImageUrls().length" class="admin-about-thumbnails">
                <img
                  v-for="(imageUrl, index) in aboutImageUrls()"
                  :key="imageUrl"
                  class="admin-about-thumbnail"
                  :src="imageUrl"
                  :alt="`Aktuelles Über-uns-Bild ${index + 1}`"
                />
              </div>
              <div>
                <i :class="`fa-solid fa-${aboutUploading ? 'spinner fa-spin' : 'cloud-arrow-up'}`"></i>
                <strong>{{ aboutUploading ? 'Bild wird in AVIF konvertiert und gespeichert...' : 'Über-uns-Bild hier ablegen' }}</strong>
                <span>Maximal zwei Bilder. Neue Bilder ersetzen die alten und werden automatisch in AVIF konvertiert.</span>
                <label class="admin-button soft admin-gallery-picker" :class="{ disabled: aboutUploading }">
                  <input
                    ref="aboutInput"
                    class="admin-gallery-file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    :disabled="aboutUploading"
                    @change="uploadAboutImage(($event.target as HTMLInputElement).files ?? [])"
                  />
                  <i class="fa-solid fa-image"></i>
                  Bild auswählen
                </label>
                <small v-if="aboutError" class="admin-gallery-error">{{ aboutError }}</small>
              </div>
            </div>
          </section>

          <section
            v-for="group in itemGroups"
            v-show="!isGeneral && !isMessages && (group.entries.length || ['services', 'gallery', 'testimonials', 'faq', 'benefits'].includes(activeSection.id))"
            :key="group.id"
            class="admin-card"
            :data-content-group="group.id"
          >
            <div class="admin-card-header compact">
              <div><p>{{ group.description }}</p><h2>{{ group.title }}</h2></div>
              <button
                v-if="activeSection.id !== 'gallery'"
                type="button"
                class="admin-button soft"
                @click="activeSection.id === 'benefits' ? addGroupItem(activeSection, group.id) : addItem(activeSection)"
              >
                <i class="fa-solid fa-plus"></i> Hinzufügen
              </button>
            </div>
            <div
              v-if="activeSection.id === 'gallery'"
              class="admin-gallery-upload"
              :class="{ active: galleryDragActive, busy: galleryUploading }"
              @dragenter.prevent="galleryDragActive = true"
              @dragover.prevent="galleryDragActive = true"
              @dragleave.prevent="galleryDragActive = false"
              @drop.prevent="dropGalleryFiles"
            >
              <i :class="`fa-solid fa-${galleryUploading ? 'spinner fa-spin' : 'cloud-arrow-up'}`"></i>
              <strong>{{ galleryUploading ? 'Bilder werden in AVIF konvertiert und gespeichert...' : 'Bilder hier ablegen' }}</strong>
              <span>Bilddateien werden automatisch in AVIF konvertiert.</span>
              <label class="admin-button soft admin-gallery-picker" :class="{ disabled: galleryUploading }">
                <input
                  ref="galleryInput"
                  class="admin-gallery-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  :disabled="galleryUploading"
                  @change="uploadGalleryFiles(($event.target as HTMLInputElement).files ?? [])"
                />
                <i class="fa-solid fa-images"></i>
                Bilder auswählen
              </label>
              <small v-if="galleryError" class="admin-gallery-error">{{ galleryError }}</small>
            </div>
            <div v-if="activeSection.id === 'benefits'" class="admin-form-grid admin-group-content">
              <label
                v-for="[key, label] in benefitGroupFields(group.id)"
                :key="key"
                :class="{ wide: isLongText(key, activeSection.content[key]) }"
              >
                <span>{{ label }}</span>
                <textarea
                  v-if="isLongText(key, activeSection.content[key])"
                  :value="String(activeSection.content[key] ?? '')"
                  rows="3"
                  @input="updateContentValue(activeSection.content, key, $event)"
                ></textarea>
                <input
                  v-else
                  :value="String(activeSection.content[key] ?? '')"
                  type="text"
                  @input="updateContentValue(activeSection.content, key, $event)"
                />
              </label>
            </div>
            <div class="admin-items">
              <details
                v-for="({ item, index }, groupIndex) in group.entries"
                :key="index"
                :open="activeSection.id !== 'services' && groupIndex === 0"
                :class="{ 'admin-item-drag-target': dragTargetIndex === index && draggedItemIndex !== index && draggedGroupId === group.id }"
                @dragover.prevent="draggedGroupId === group.id && (dragTargetIndex = index)"
                @drop.prevent="dropItem(index, group.id)"
              >
                <summary>
                  <span
                    v-if="['services', 'benefits'].includes(activeSection.id)"
                    class="admin-drag-handle"
                    draggable="true"
                    :aria-label="`${sortLabel(group.id)} verschieben`"
                    title="Ziehen, um Reihenfolge zu ändern"
                    @dragstart.stop="startItemDrag(index, group.id, $event)"
                    @dragend="endItemDrag"
                  >
                    <i class="fa-solid fa-grip-vertical"></i>
                  </span>
                  <span class="admin-item-index">{{ groupIndex + 1 }}</span>
                  <strong>{{ item.title || item.question || item.name || item.alt || `Eintrag ${index + 1}` }}</strong>
                  <small v-if="activeSection.id === 'benefits'">{{ item.kind === 'concern' ? 'Anliegen' : 'Vorteil' }}</small>
                  <i class="fa-solid fa-chevron-down"></i>
                </summary>
                <div class="admin-item-body">
                  <img
                    v-if="activeSection.id === 'gallery'"
                    class="admin-gallery-thumbnail"
                    :src="String(item.imageUrl)"
                    :alt="String(item.alt ?? '')"
                  />
                  <template v-for="(value, key) in editableItem(activeSection, item, index)" :key="key">
                    <template v-if="activeSection.id === 'benefits' && key === 'kind'"></template>
                    <div v-else-if="['services', 'benefits'].includes(activeSection.id) && key === 'icon'" class="admin-icon-field wide">
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
                  <div v-if="['services', 'benefits'].includes(activeSection.id)" class="admin-item-actions">
                    <div class="admin-mobile-sort">
                      <button
                        type="button"
                        :disabled="groupIndex === 0"
                        :aria-label="`${sortLabel(group.id)} nach oben verschieben`"
                        @click="moveItem(index, group.entries[groupIndex - 1]?.index)"
                      >
                        <i class="fa-solid fa-arrow-up"></i>
                      </button>
                      <button
                        type="button"
                        :disabled="groupIndex === group.entries.length - 1"
                        :aria-label="`${sortLabel(group.id)} nach unten verschieben`"
                        @click="moveItem(index, group.entries[groupIndex + 1]?.index)"
                      >
                        <i class="fa-solid fa-arrow-down"></i>
                      </button>
                    </div>
                    <button v-if="activeSection.id === 'services'" type="button" class="admin-button ghost" @click="cancelServiceEdit(index)">Abbrechen</button>
                    <button v-else type="button" class="admin-button ghost" @click="cancelBenefitEdit(index)">Abbrechen</button>
                    <button v-if="activeSection.id === 'services'" type="button" class="admin-button primary" @click="saveService(index)"><i class="fa-solid fa-check"></i> Speichern</button>
                    <button v-else type="button" class="admin-button primary" @click="saveBenefit(index)"><i class="fa-solid fa-check"></i> Speichern</button>
                    <button type="button" class="admin-delete" @click="removeItem(activeSection, index)"><i class="fa-solid fa-trash"></i> Eintrag löschen</button>
                  </div>
                  <button v-else type="button" class="admin-delete" @click="activeSection.id === 'gallery' ? removeGalleryItem(activeSection, index) : removeItem(activeSection, index)"><i class="fa-solid fa-trash"></i> Eintrag löschen</button>
                </div>
              </details>
            </div>
          </section>

          <section v-if="isMessages" class="admin-card">
            <div class="admin-card-header">
              <div><p>Kontaktformular</p><h2>Eingegangene Nachrichten</h2><span>{{ messages.length }} Nachrichten gespeichert</span></div>
              <div class="admin-message-actions">
                <button type="button" class="admin-button ghost" :disabled="!selectedMessageIds.length" @click="exportMessagesPdf">
                  <i class="fa-solid fa-file-pdf"></i> Auswahl als PDF
                </button>
                <button type="button" class="admin-button danger" :disabled="!selectedMessageIds.length" @click="deleteSelectedMessages">
                  <i class="fa-solid fa-trash"></i> Auswahl löschen
                </button>
                <button type="button" class="admin-button soft" :disabled="messagesLoading" @click="loadMessages()">
                  <i :class="`fa-solid fa-${messagesLoading ? 'spinner fa-spin' : 'rotate'}`"></i> Aktualisieren
                </button>
              </div>
            </div>
            <div class="admin-message-stats">
              <article><i class="fa-solid fa-envelope"></i><div><strong>{{ messages.length }}</strong><span>Gesamt</span></div></article>
              <article><i class="fa-solid fa-envelope-open"></i><div><strong>{{ readMessageCount }}</strong><span>Gelesen</span></div></article>
              <article class="unread"><i class="fa-solid fa-bell"></i><div><strong>{{ unreadMessageCount }}</strong><span>Ungelesen</span></div></article>
            </div>
            <p v-if="messagesError" class="admin-messages-state admin-messages-error">{{ messagesError }}</p>
            <p v-else-if="messagesLoading" class="admin-messages-state">Nachrichten werden geladen...</p>
            <p v-else-if="!messages.length" class="admin-messages-state">Noch keine Nachrichten vorhanden.</p>
            <div v-else class="admin-messages">
              <div class="admin-message-selection">
                <label><input type="checkbox" :checked="allMessagesSelected" @change="toggleAllMessages" /> Alle auswählen</label>
                <span>{{ selectedMessageIds.length }} von {{ messages.length }} ausgewählt</span>
              </div>
              <article v-for="entry in messages" :key="entry.id" class="admin-message" :class="{ unread: entry.read !== true, open: openMessageIds.includes(entry.id), selected: selectedMessageIds.includes(entry.id) }">
                <label class="admin-message-checkbox" :aria-label="`${entry.name} auswählen`">
                  <input v-model="selectedMessageIds" type="checkbox" :value="entry.id" @click.stop />
                </label>
                <button type="button" class="admin-message-summary" @click.prevent.stop="toggleMessage(entry)">
                  <div>
                    <span class="admin-message-status">{{ entry.read === true ? 'Gelesen' : 'Neu' }}</span>
                    <strong>{{ entry.name }}</strong>
                    <small>{{ entry.email }}<template v-if="entry.service"> · {{ entry.service }}</template></small>
                  </div>
                  <span><time :datetime="entry.createdAt">{{ formatMessageDate(entry.createdAt) }}</time><i class="fa-solid fa-chevron-down"></i></span>
                </button>
                <div v-if="openMessageIds.includes(entry.id)" class="admin-message-body">
                  <a :href="`mailto:${entry.email}`"><i class="fa-solid fa-reply"></i> {{ entry.email }}</a>
                  <span v-if="entry.service" class="admin-message-service">{{ entry.service }}</span>
                  <p>{{ entry.message }}</p>
                <button type="button" class="admin-delete" @click="deleteMessage(entry.id)"><i class="fa-solid fa-trash"></i> Nachricht löschen</button>
                </div>
              </article>
            </div>
          </section>

          <section v-if="isGeneral" class="admin-stats">
            <article><i class="fa-solid fa-layer-group"></i><div><strong>{{ store.content.sections.length }}</strong><span>Bereiche</span></div></article>
            <article><i class="fa-solid fa-eye"></i><div><strong>{{ visibleCount }}</strong><span>Aktiv</span></div></article>
            <article><i class="fa-solid fa-pen-ruler"></i><div><strong>2</strong><span>Markenfarben</span></div></article>
            <article><i class="fa-solid fa-database"></i><div><strong>{{ store.saving ? '...' : 'DB' }}</strong><span>Datenbank</span></div></article>
          </section>

          <section v-if="isGeneral" class="admin-card">
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

          <button v-if="isGeneral" type="button" class="admin-reset" @click="resetContent"><i class="fa-solid fa-arrow-rotate-left"></i> Auf Standardinhalte zurücksetzen</button>
        </div>

        <aside v-if="isGeneral" class="admin-order-sidebar">
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
