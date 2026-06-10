import { defineComponent } from 'vue'
import services from '../data/services.json'

export default defineComponent({
  name: 'DienstleistungenSection',
  setup() {
    const items = services.items.filter((item) => item.enabled).sort((a, b) => a.order - b.order)
    return () =>
      services.enabled && (
        <section id={services.id} class="bg-gray-50 py-20 px-4 overflow-hidden">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-14">
              <p class="section-kicker">{services.kicker}</p>
              <h2 class="content-heading">{services.heading}</h2>
              <p class="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">{services.intro}</p>
            </div>
            <div class="services-grid">
              {items.map((service) => (
                <div key={service.id} class={`service-card${service.featured ? ' service-card--featured' : ''}`} style={`--grad: ${service.gradient.join(', ')}`}>
                  {service.featured && <div class="card-badge">{services.featuredBadge}</div>}
                  <div class="card-title">{service.title}</div>
                  <div class="card-icon"><i class={service.icon}></i></div>
                  <div class="card-content">
                    <p>{service.description}</p>
                    <ul class="service-detail-list">
                      {service.details.map((detail) => <li key={detail}><i class="fa-solid fa-check" aria-hidden="true"></i>{detail}</li>)}
                    </ul>
                  </div>
                  <a href={services.cta.href} class="card-cta" aria-label={`${services.cta.label}: ${service.title}`}>
                    {services.cta.label}<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
  },
})
