<script setup lang="ts">
import { computed } from 'vue'
import Header from '../includs/header'
import Hero from '../includs/Hero'
import Dienstleistungen from '../includs/Dienstleistungen'
import ServiceInfo from '../includs/ServiceInfo'
import Gallery from '../includs/gallery'
import About from '../includs/about'
import Feedbacks from '../includs/Feedbacks'
import Faq from '../includs/Faq'
import Contact from '../includs/contact'
import Footer from '../includs/footer'
import CustomSection from '../includs/CustomSection'
import { useWebsiteContentStore } from '../stores/websiteContent'

const store = useWebsiteContentStore()
const components = { hero: Hero, services: Dienstleistungen, benefits: ServiceInfo, gallery: Gallery, about: About, testimonials: Feedbacks, faq: Faq, contact: Contact }
const orderedSections = computed(() => store.content.sections.filter((section) => section.enabled))
</script>

<template>
  <Header />
  <template v-for="section in orderedSections" :key="section.id">
    <component :is="components[section.id as keyof typeof components]" v-if="components[section.id as keyof typeof components]" />
    <CustomSection v-else :section="section" />
  </template>
  <Footer />
</template>
