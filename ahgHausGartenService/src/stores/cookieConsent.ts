import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface CookiePreferences {
  necessary: true // always true, cannot be changed
  functional: boolean
  statistics: boolean
  marketing: boolean
}

const STORAGE_KEY = 'ahg_cookie_consent'

function loadFromStorage(): { preferences: CookiePreferences; decided: boolean } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveToStorage(preferences: CookiePreferences) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ preferences, decided: true, timestamp: new Date().toISOString() }),
  )
}

export const useCookieConsentStore = defineStore('cookieConsent', () => {
  const saved = loadFromStorage()

  const decided = ref<boolean>(saved?.decided ?? false)
  const showBanner = ref<boolean>(!saved?.decided)
  const showSettings = ref<boolean>(false)

  const preferences = ref<CookiePreferences>({
    necessary: true,
    functional: saved?.preferences?.functional ?? false,
    statistics: saved?.preferences?.statistics ?? false,
    marketing: saved?.preferences?.marketing ?? false,
  })

  const consentGiven = computed(() => decided.value)

  function acceptAll() {
    preferences.value = { necessary: true, functional: true, statistics: true, marketing: true }
    decided.value = true
    showBanner.value = false
    showSettings.value = false
    saveToStorage(preferences.value)
  }

  function rejectAll() {
    preferences.value = { necessary: true, functional: false, statistics: false, marketing: false }
    decided.value = true
    showBanner.value = false
    showSettings.value = false
    saveToStorage(preferences.value)
  }

  function saveSelection() {
    decided.value = true
    showBanner.value = false
    showSettings.value = false
    saveToStorage(preferences.value)
  }

  function openSettings() {
    showSettings.value = true
    showBanner.value = true
  }

  function revokeConsent() {
    decided.value = false
    showBanner.value = true
    showSettings.value = false
    preferences.value = { necessary: true, functional: false, statistics: false, marketing: false }
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    decided,
    showBanner,
    showSettings,
    preferences,
    consentGiven,
    acceptAll,
    rejectAll,
    saveSelection,
    openSettings,
    revokeConsent,
  }
})
