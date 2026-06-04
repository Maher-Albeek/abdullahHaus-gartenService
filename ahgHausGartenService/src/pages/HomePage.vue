<script setup lang="ts">
import Header from '../includs/header'
import Title from '../component/title'
import Hero from '../includs/Hero'
import Dienstleistungen from '../includs/Dienstleistungen'
import Gallery from '../includs/gallery'
import About from '../includs/about'
import Feedbacks from '../includs/Feedbacks'
import Contact from '../includs/contact'
import Footer from '../includs/footer'
</script>

<template>
  <Header />
  <Hero />
  <Title title="Unsere Dienstleistungen" desc="Was wir anbieten" />
  <Dienstleistungen />
  <Title title="Galerie" desc="Einblicke in unsere abgeschlossenen Projekte" border />
  <Gallery />
  <Title title="Über uns" desc="Erfahren Sie mehr über unser Unternehmen" border />
  <About />
  <Title title="Kundenbewertungen" desc="Was unsere Kunden über uns sagen" border />
  <Feedbacks />
  <Title title="Kontakt" desc="Nehmen Sie Kontakt mit uns auf" border />
  <Contact />
  <Footer />
</template>
