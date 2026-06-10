import { defineComponent } from 'vue'
import Header from '../includs/header'
import Footer from '../includs/footer'
import legal from '../data/legal.json'

export default defineComponent({
  name: 'DatenschutzPage',
  setup() {
    const privacy = legal.privacy
    const sections = privacy.sections.sort((a, b) => a.order - b.order)
    return () => (
      <>
        <Header />
        <main class="min-h-screen bg-white pt-24 pb-20 px-4">
          <div class="max-w-3xl mx-auto">
            <h1 class="text-3xl font-bold text-brand-dark mb-8">{privacy.title}</h1>
            {sections.map((section) => (
              <section class="mb-8" key={section.id}>
                <h2 class="text-xl font-semibold text-brand-dark mb-3">{section.heading}</h2>
                {section.content.map((content, index) => (
                  <div key={`${section.id}-${index}`}>
                    {content.heading && <h3 class="text-base font-semibold text-gray-800 mb-2">{content.heading}</h3>}
                    <p class="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">{content.text}</p>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </main>
        <Footer />
      </>
    )
  },
})
