import { computed, defineComponent } from 'vue'
import { useWebsiteContentStore } from '../stores/websiteContent'

export default defineComponent({
  name: 'ServiceInfoSection',
  setup() {
    const store = useWebsiteContentStore()
    const section = computed(() => store.content.sections.find((entry) => entry.id === 'benefits'))
    const benefits = computed(() => section.value?.items.filter((item) => item.kind === 'benefit') ?? [])
    const concerns = computed(() => section.value?.items.filter((item) => item.kind === 'concern') ?? [])

    return () =>
      section.value?.enabled !== false && (
        <section id="vorteile" class="service-info-section py-20 px-4">
          <div class="max-w-6xl mx-auto">
            <div class="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
              <div>
                <p class="section-kicker">{String(section.value?.content.kicker ?? '')}</p>
                <h2 class="content-heading">{String(section.value?.content.title ?? '')}</h2>
                <p class="content-intro">{String(section.value?.content.intro ?? '')}</p>
                <div class="benefit-grid">
                  {benefits.value.map((benefit, index) => (
                    <article class="benefit-card" key={`${benefit.title}-${index}`}>
                      <span class="benefit-icon">
                        <i class={String(benefit.icon)} aria-hidden="true"></i>
                      </span>
                      <h3>{String(benefit.title ?? '')}</h3>
                      <p>{String(benefit.text ?? '')}</p>
                    </article>
                  ))}
                </div>
              </div>
              <aside class="concerns-panel" aria-labelledby="concerns-title">
                <p class="section-kicker section-kicker--light">
                  {String(section.value?.content.concernsKicker ?? '')}
                </p>
                <h2 id="concerns-title">{String(section.value?.content.concernsTitle ?? '')}</h2>
                <p class="concerns-intro">{String(section.value?.content.concernsIntro ?? '')}</p>
                <div class="concern-list">
                  {concerns.value.map((concern, index) => (
                    <div class="concern-item" key={`${concern.question}-${index}`}>
                      <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                      <div>
                        <h3>{String(concern.question ?? '')}</h3>
                        <p>{String(concern.answer ?? '')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="#contact" class="concerns-cta">
                  {String(section.value?.content.buttonLabel ?? '')}{' '}
                  <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </a>
              </aside>
            </div>
          </div>
        </section>
      )
  },
})
