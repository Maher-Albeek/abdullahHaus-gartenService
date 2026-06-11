<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import CookieConsent from './component/CookieConsent'
import { useWebsiteContentStore } from './stores/websiteContent'

const instance = getCurrentInstance()
const isAdmin = computed(() => ['admin', 'login', 'reset-password'].includes(String(instance?.proxy?.$route?.name)))
const contentStore = useWebsiteContentStore()
</script>

<template>
  <RouterView />
  <nav v-if="!isAdmin" class="mobile-contact-bar" aria-label="Schnellkontakt">
    <a class="mobile-contact-action mobile-contact-action--call" :href="`tel:+${contentStore.content.contact.whatsapp}`">
      <i class="fa-solid fa-phone" aria-hidden="true"></i>
      <span>Anrufen</span>
    </a>
    <a
      class="mobile-contact-action mobile-contact-action--whatsapp"
      :href="`https://wa.me/${contentStore.content.contact.whatsapp}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
      <span>WhatsApp</span>
    </a>
  </nav>
  <CookieConsent v-if="!isAdmin" />
</template>
