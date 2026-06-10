import { defineComponent } from 'vue'
import faq from '../data/faq.json'

export default defineComponent({
  name: 'FaqSection',
  setup() {
    const items = faq.items.filter((item) => item.enabled).sort((a, b) => a.order - b.order)
    return () =>
      faq.enabled && (
        <section id={faq.id} class="faq-section py-20 px-4 bg-gray-50">
          <div class="max-w-4xl mx-auto">
            <div class="text-center mb-10">
              <p class="section-kicker">{faq.kicker}</p>
              <h2 class="content-heading">{faq.heading}</h2>
              <p class="content-intro mx-auto">{faq.intro}</p>
            </div>
            <div class="faq-list">
              {items.map((item) => (
                <details class="faq-item" key={item.id} open={item.openByDefault}>
                  <summary><span>{item.question}</span><i class="fa-solid fa-plus" aria-hidden="true"></i></summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
            <div class="faq-contact">
              <span>{faq.contactPrompt}</span>
              <a href={faq.contactCta.href}>{faq.contactCta.label}</a>
            </div>
          </div>
        </section>
      )
  },
})
