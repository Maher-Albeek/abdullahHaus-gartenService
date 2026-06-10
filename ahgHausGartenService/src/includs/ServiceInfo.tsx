import { defineComponent } from 'vue'
import serviceInfo from '../data/service-info.json'

export default defineComponent({
  name: 'ServiceInfoSection',
  setup() {
    const benefits = serviceInfo.benefits.filter((item) => item.enabled).sort((a, b) => a.order - b.order)
    const concerns = serviceInfo.concerns.filter((item) => item.enabled).sort((a, b) => a.order - b.order)
    return () =>
      serviceInfo.enabled && (
        <section id={serviceInfo.id} class="service-info-section py-20 px-4">
          <div class="max-w-6xl mx-auto">
            <div class="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
              <div>
                <p class="section-kicker">{serviceInfo.benefitsContent.kicker}</p>
                <h2 class="content-heading">{serviceInfo.benefitsContent.heading}</h2>
                <p class="content-intro">{serviceInfo.benefitsContent.intro}</p>
                <div class="benefit-grid">
                  {benefits.map((benefit) => (
                    <article class="benefit-card" key={benefit.id}>
                      <span class="benefit-icon"><i class={benefit.icon} aria-hidden="true"></i></span>
                      <h3>{benefit.title}</h3><p>{benefit.text}</p>
                    </article>
                  ))}
                </div>
              </div>
              <aside class="concerns-panel" aria-labelledby="concerns-title">
                <p class="section-kicker section-kicker--light">{serviceInfo.concernsContent.kicker}</p>
                <h2 id="concerns-title">{serviceInfo.concernsContent.heading}</h2>
                <p class="concerns-intro">{serviceInfo.concernsContent.intro}</p>
                <div class="concern-list">
                  {concerns.map((concern) => (
                    <div class="concern-item" key={concern.id}><i class="fa-solid fa-circle-check" aria-hidden="true"></i><div><h3>{concern.question}</h3><p>{concern.answer}</p></div></div>
                  ))}
                </div>
                <a href={serviceInfo.concernsContent.ctaHref} class="concerns-cta">{serviceInfo.concernsContent.ctaLabel}<i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
              </aside>
            </div>
          </div>
        </section>
      )
  },
})
