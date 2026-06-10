import { defineComponent } from 'vue'
import Header from '../includs/header'
import Footer from '../includs/footer'
import legal from '../data/legal.json'

export default defineComponent({
  name: 'ImpressumPage',
  setup() {
    const imprint = legal.imprint
    return () => (
      <>
        <Header />
        <main class="min-h-screen bg-white pt-24 pb-20 px-4">
          <div class="max-w-3xl mx-auto">
            <h1 class="text-3xl font-bold text-brand-dark mb-8">{imprint.title}</h1>
            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">{imprint.provider.heading}</h2>
              <p class="text-gray-700 leading-relaxed">{imprint.provider.company}<br />{imprint.provider.addressLines.map((line) => <>{line}<br /></>)}</p>
            </section>
            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">{imprint.contact.heading}</h2>
              <p class="text-gray-700 leading-relaxed">Telefon: {imprint.contact.phone}<br />E-Mail: {imprint.contact.email}</p>
            </section>
            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">{imprint.responsiblePerson.heading}</h2>
              <p class="text-gray-700 leading-relaxed">{imprint.responsiblePerson.name}<br />{imprint.responsiblePerson.addressLines.map((line) => <>{line}<br /></>)}</p>
            </section>
            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">Haftungsausschluss</h2>
              {imprint.disclaimerSections.map((section) => <div key={section.id}><h3 class="text-base font-semibold text-gray-800 mb-2">{section.heading}</h3><p class="text-gray-700 leading-relaxed mb-4">{section.text}</p></div>)}
            </section>
          </div>
        </main>
        <Footer />
      </>
    )
  },
})
