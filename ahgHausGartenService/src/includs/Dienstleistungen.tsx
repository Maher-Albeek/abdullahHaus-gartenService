import { computed, defineComponent } from 'vue'
import { useWebsiteContentStore, type ContentItem } from '../stores/websiteContent'

const valueAsString = (item: ContentItem, key: string, fallback = '') =>
  String(item[key] ?? fallback)

const serviceDetails = (item: ContentItem) =>
  valueAsString(item, 'details')
    .split(/\r?\n|\|/)
    .map((detail) => detail.trim())
    .filter(Boolean)

const serviceIcon = (item: ContentItem) => {
  const icon = valueAsString(item, 'icon', 'fa-broom')
  return icon.includes('fa-solid') ? icon : `fa-solid ${icon}`
}

export default defineComponent({
  name: 'DienstleistungenSection',
  setup() {
    const store = useWebsiteContentStore()
    const section = computed(() =>
      store.content.sections.find((candidate) => candidate.id === 'services'),
    )

    return () => {
      const servicesSection = section.value
      if (!servicesSection?.enabled) return null

      const content = servicesSection.content

      return (
        <section id="leistungen" class="bg-gray-50 py-20 px-4 overflow-hidden">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-14">
              <p class="section-kicker">{String(content.kicker ?? '')}</p>
              <h2 class="content-heading">{String(content.title ?? '')}</h2>
              <p class="content-intro mx-auto">{String(content.intro ?? '')}</p>
            </div>

            <div class="services-grid">
              {servicesSection.items.map((service, index) => {
                const title = valueAsString(service, 'title', `Dienstleistung ${index + 1}`)
                const gradient = valueAsString(service, 'grad', '#4D8B23, #62af2d')
                const featured = service.featured === true || Number(service.featured ?? 0) === 1
                const details = serviceDetails(service)

                return (
                  <div
                    key={`${title}-${index}`}
                    class={`service-card${featured ? ' service-card--featured' : ''}`}
                    style={`--grad: ${gradient}`}
                  >
                    {featured && <div class="card-badge">★ Beliebtester Dienst</div>}
                    <div class="card-title">{title}</div>
                    <div class="card-icon">
                      <i class={serviceIcon(service)}></i>
                    </div>
                    <div class="card-content">
                      <p>{valueAsString(service, 'desc')}</p>
                      {details.length > 0 && (
                        <ul class="service-detail-list">
                          {details.map((detail) => (
                            <li key={detail}>
                              <i class="fa-solid fa-check" aria-hidden="true"></i>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <a
                      href="#contact"
                      class="card-cta"
                      aria-label={`Angebot für ${title} anfragen`}
                    >
                      Angebot anfragen
                      <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </a>
                  </div>
                )
              })}
            </div>

          </div>
        </section>
      )
    }
  },
})
