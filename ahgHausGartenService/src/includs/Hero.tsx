import { defineComponent, onMounted, ref } from 'vue'

function useCounter(target: number, duration = 1800) {
  const count = ref(0)
  onMounted(() => {
    const steps = 60
    const increment = target / steps
    const interval = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        count.value = target
        clearInterval(timer)
      } else {
        count.value = Math.floor(current)
      }
    }, interval)
  })
  return count
}

export default defineComponent({
  name: 'HeroSection',
  setup() {
    const teamCount = useCounter(8)
    const yearsCount = useCounter(12)
    const projectsCount = useCounter(350)

    return () => (
      <section class="ahg-hero">
        <div class="video-wrap">
          <video autoplay playsinline loop muted id="video-bg">
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div class="gradient-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-title blend">
            Abdullah für
            <br />
            Haus &amp; Garten
          </h1>

          <div class="hero-stats">
            <div class="hero-stat">
              <span class="hero-stat-number blend">{teamCount.value}+</span>
              <span class="hero-stat-label blend">Teammitglieder</span>
            </div>
            <div class="hero-stat-divider" />
            <div class="hero-stat">
              <span class="hero-stat-number blend">{yearsCount.value}+</span>
              <span class="hero-stat-label blend">Jahre Erfahrung</span>
            </div>
            <div class="hero-stat-divider" />
            <div class="hero-stat">
              <span class="hero-stat-number blend">{projectsCount.value}+</span>
              <span class="hero-stat-label blend">Projekte</span>
            </div>
          </div>
          <p class="hero-subtitle blend">
            Ihr zuverlässiger Partner für professionelle Pflege und Instandhaltung von Haus und
            Garten.
          </p>
        </div>
      </section>
    )
  },
})
