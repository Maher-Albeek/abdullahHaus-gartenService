import { computed, defineComponent } from 'vue'
import { useWebsiteContentStore } from '../stores/websiteContent'

export default defineComponent({
  name: 'FaqSection',
  setup() {
    const store = useWebsiteContentStore()
    const section = computed(() => store.content.sections.find((entry) => entry.id === 'faq'))

    return () => {
      const faq = section.value
      if (!faq?.enabled) return null

      return (
        <section id="faq" class="faq-section py-20 px-4 bg-gray-50">
          <div class="max-w-4xl mx-auto">
            <div class="text-center mb-10">
              <p class="section-kicker">{String(faq.content.kicker ?? '')}</p>
              <h2 class="content-heading">{String(faq.content.title ?? '')}</h2>
              <p class="content-intro mx-auto">{String(faq.content.intro ?? '')}</p>
            </div>
            <div class="faq-list">
              {faq.items.map((item, index) => (
                <details class="faq-item" key={`${String(item.question)}-${index}`} open={index === 0}>
                  <summary><span>{String(item.question ?? '')}</span><i class="fa-solid fa-plus" aria-hidden="true"></i></summary>
                  <p>{String(item.answer ?? '')}</p>
                </details>
              ))}
            </div>
            <div class="faq-contact">
              <span>Noch eine Frage offen?</span>
              <a href="#contact">Direkt Kontakt aufnehmen</a>
            </div>
          </div>
        </section>
      )
    }
  },
})
