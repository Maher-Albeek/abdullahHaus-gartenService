import { computed, defineComponent } from 'vue'
import { useWebsiteContentStore } from '../stores/websiteContent'

export default defineComponent({
  name: 'HeroSection',
  setup() {
    const store = useWebsiteContentStore()
    const section = computed(() => store.content.sections.find((entry) => entry.id === 'hero'))

    return () => {
      const hero = section.value
      if (!hero?.enabled) return null
      const content = hero.content

      return (
        <section class="ahg-hero">
          <div class="video-wrap">
            <video autoplay playsinline loop muted id="video-bg">
              <source src={String(content.backgroundVideo ?? '/hero-bg.mp4')} type="video/mp4" />
            </video>
          </div>
          <div class="gradient-overlay"></div>
          <div class="hero-content">
            <h1 class="hero-title blend">{String(content.title ?? '')}</h1>
            <div class="hero-stats">
              <div class="hero-stat">
                <span class="hero-stat-number blend">{String(content.teamCount ?? 0)}+</span>
                <span class="hero-stat-label blend">Teammitglieder</span>
              </div>
              <div class="hero-stat-divider" />
              <div class="hero-stat">
                <span class="hero-stat-number blend">{String(content.yearsCount ?? 0)}+</span>
                <span class="hero-stat-label blend">Jahre Erfahrung</span>
              </div>
              <div class="hero-stat-divider" />
              <div class="hero-stat">
                <span class="hero-stat-number blend">{String(content.projectsCount ?? 0)}+</span>
                <span class="hero-stat-label blend">Projekte</span>
              </div>
            </div>
            <p class="hero-subtitle blend">{String(content.subtitle ?? '')}</p>
          </div>
        </section>
      )
    }
  },
})
