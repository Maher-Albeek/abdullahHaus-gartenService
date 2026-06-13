<script setup lang="ts">
import { ref } from 'vue'
import type { ContentItem, WebsiteSection } from '../stores/websiteContent'
import { imgToAvif } from '../utils/imgToAvif'

const props = defineProps<{ section: WebsiteSection }>()
const emit = defineEmits<{ notice: [message: string] }>()

const canvas = ref<HTMLElement | null>(null)
const dragging = ref<{ index: number; offsetX: number; offsetY: number } | null>(null)
const uploading = ref(false)
const uploadError = ref('')

const addBlock = (type: 'card' | 'button') => {
  props.section.items.push(type === 'card'
    ? {
        type,
        title: 'Neue Karte',
        description: 'Beschreibung der Karte',
        x: 8,
        y: 34,
        width: 30,
        backgroundColor: '#ffffff',
        textColor: '#20251e',
      }
    : {
        type,
        label: 'Mehr erfahren',
        url: '#contact',
        x: 42,
        y: 65,
        width: 18,
        backgroundColor: '#8b1a2b',
        textColor: '#ffffff',
      })
}

const blockStyle = (item: ContentItem) => ({
  left: `${Number(item.x ?? 5)}%`,
  top: `${Number(item.y ?? 30)}%`,
  width: `${Number(item.width ?? 28)}%`,
  backgroundColor: String(item.backgroundColor ?? '#ffffff'),
  color: String(item.textColor ?? '#20251e'),
})

const startDrag = (index: number, event: PointerEvent) => {
  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
  dragging.value = { index, offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top }
  window.addEventListener('pointermove', moveDrag)
  window.addEventListener('pointerup', endDrag, { once: true })
}

const moveDrag = (event: PointerEvent) => {
  if (!dragging.value || !canvas.value) return
  const bounds = canvas.value.getBoundingClientRect()
  const item = props.section.items[dragging.value.index]
  if (!item) return
  const width = Number(item.width ?? 28)
  item.x = Math.max(0, Math.min(100 - width, ((event.clientX - bounds.left - dragging.value.offsetX) / bounds.width) * 100))
  item.y = Math.max(0, Math.min(88, ((event.clientY - bounds.top - dragging.value.offsetY) / bounds.height) * 100))
}

const endDrag = () => {
  dragging.value = null
  window.removeEventListener('pointermove', moveDrag)
}

const isImage = (file: File) => file.type.startsWith('image/')
const setText = (target: ContentItem, key: string, event: Event) => {
  target[key] = (event.target as HTMLInputElement | HTMLTextAreaElement).value
}

const uploadImage = async (files: FileList | File[]) => {
  const file = Array.from(files).find(isImage)
  if (!file) {
    uploadError.value = 'Bitte eine Bilddatei auswählen.'
    return
  }
  uploading.value = true
  uploadError.value = ''
  try {
    const [avif] = await imgToAvif(file, { quality: 75, maxDimension: 2400 })
    if (!avif) throw new Error('Das Bild konnte nicht konvertiert werden.')
    const response = await fetch('/api/gallery', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/avif',
        'X-File-Name': encodeURIComponent(`section-${avif.name}`),
        'X-Image-Alt': encodeURIComponent(file.name.replace(/\.[^.]+$/, '')),
        'X-Image-Usage': 'custom-section',
      },
      body: avif,
    })
    if (!response.ok) throw new Error(`Upload fehlgeschlagen (${response.status}).`)
    const record = await response.json() as ContentItem
    props.section.content.imageUrl = String(record.imageUrl ?? '')
    emit('notice', 'Bereichsbild hochgeladen')
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : 'Upload fehlgeschlagen.'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="section-builder">
    <div class="section-builder-toolbar">
      <button type="button" class="admin-button soft" @click="addBlock('card')"><i class="fa-solid fa-square-plus"></i> Karte</button>
      <button type="button" class="admin-button soft" @click="addBlock('button')"><i class="fa-solid fa-link"></i> Button</button>
      <label class="admin-button ghost section-builder-upload">
        <i class="fa-solid fa-image"></i>{{ uploading ? 'Lädt...' : 'Bild ablegen oder wählen' }}
        <input type="file" accept="image/*" @change="uploadImage(($event.target as HTMLInputElement).files ?? [])" />
      </label>
    </div>
    <p v-if="uploadError" class="admin-gallery-error">{{ uploadError }}</p>

    <div class="section-builder-settings">
      <label><span>Kicker</span><input v-model="section.content.kicker" type="text" /></label>
      <label><span>Titel</span><input v-model="section.content.title" type="text" /></label>
      <label class="wide"><span>Beschreibung</span><textarea :value="String(section.content.description ?? '')" rows="3" @input="setText(section.content, 'description', $event)"></textarea></label>
      <label><span>Hintergrund</span><input v-model="section.content.backgroundColor" type="color" /></label>
      <label><span>Textfarbe</span><input v-model="section.content.textColor" type="color" /></label>
      <label><span>Mindesthöhe</span><input v-model.number="section.content.minHeight" type="number" min="360" max="1000" /></label>
    </div>

    <div
      ref="canvas"
      class="section-builder-canvas"
      :style="{
        backgroundColor: String(section.content.backgroundColor),
        color: String(section.content.textColor),
        minHeight: `${Number(section.content.minHeight ?? 560)}px`,
        backgroundImage: section.content.imageUrl ? `linear-gradient(#0003, #0003), url(${section.content.imageUrl})` : undefined,
      }"
      @dragover.prevent
      @drop.prevent="uploadImage($event.dataTransfer?.files ?? [])"
    >
      <div class="section-builder-heading">
        <small>{{ section.content.kicker }}</small>
        <h2>{{ section.content.title }}</h2>
        <p>{{ section.content.description }}</p>
      </div>
      <article
        v-for="(item, index) in section.items"
        :key="index"
        class="section-builder-block"
        :class="`section-builder-block--${item.type}`"
        :style="blockStyle(item)"
        @pointerdown="startDrag(index, $event)"
      >
        <template v-if="item.type === 'button'">{{ item.label }}</template>
        <template v-else><strong>{{ item.title }}</strong><span>{{ item.description }}</span></template>
      </article>
    </div>

    <div class="section-builder-block-editors">
      <details v-for="(item, index) in section.items" :key="index">
        <summary><i class="fa-solid fa-grip"></i><strong>{{ item.title || item.label }}</strong><span>{{ item.type }}</span></summary>
        <div>
          <label v-if="item.type === 'card'"><span>Titel</span><input v-model="item.title" type="text" /></label>
          <label v-if="item.type === 'card'" class="wide"><span>Beschreibung</span><textarea :value="String(item.description ?? '')" rows="2" @input="setText(item, 'description', $event)"></textarea></label>
          <label v-if="item.type === 'button'"><span>Button-Text</span><input v-model="item.label" type="text" /></label>
          <label v-if="item.type === 'button'"><span>Link</span><input v-model="item.url" type="text" /></label>
          <label><span>Breite %</span><input v-model.number="item.width" type="number" min="10" max="100" /></label>
          <label><span>Hintergrund</span><input v-model="item.backgroundColor" type="color" /></label>
          <label><span>Textfarbe</span><input v-model="item.textColor" type="color" /></label>
          <button type="button" class="admin-delete" @click="section.items.splice(index, 1)"><i class="fa-solid fa-trash"></i> Element löschen</button>
        </div>
      </details>
    </div>
  </div>
</template>
