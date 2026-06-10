<script setup lang="ts">
import CookieConsent from './component/CookieConsent'
</script>

<template>
  <RouterView />
  <nav class="mobile-contact-bar" aria-label="Schnellkontakt">
    <a class="mobile-contact-action mobile-contact-action--call" href="tel:+4917632093451">
      <i class="fa-solid fa-phone" aria-hidden="true"></i>
      <span>Anrufen</span>
    </a>
    <a
      class="mobile-contact-action mobile-contact-action--whatsapp"
      href="https://wa.me/4917632093451"
      target="_blank"
      rel="noopener noreferrer"
    >
      <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
      <span>WhatsApp</span>
    </a>
  </nav>
  <CookieConsent />
</template>
