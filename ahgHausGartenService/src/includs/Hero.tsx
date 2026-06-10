import { defineComponent, onMounted, ref } from 'vue'
import hero from '../data/hero.json'

function useCounter(target: number, duration: number) {
  const count = ref(0)
  onMounted(() => {
    const steps = 60
    const increment = target / steps
    const timer = setInterval(() => {
      count.value = Math.min(target, Math.floor(count.value + increment))
      if (count.value >= target) clearInterval(timer)
    }, duration / steps)
  })
  return count
}

export default defineComponent({
  name: 'HeroSection',
  setup() {
    const counters = hero.stats.map((stat) => useCounter(stat.value, hero.counterDurationMs))
    const titleParts = hero.title.split(hero.titleLineBreakAfter)

    return () =>
      hero.enabled && (
        <section id={hero.id} class="ahg-hero">
          <div class="video-wrap">
            <video autoplay={hero.backgroundVideo.autoplay} playsinline loop={hero.backgroundVideo.loop} muted={hero.backgroundVideo.muted} poster={hero.backgroundVideo.poster || undefined} id="video-bg">
              <source src={hero.backgroundVideo.src} type={hero.backgroundVideo.type} />
            </video>
          </div>
          <div class="gradient-overlay"></div>
          <div class="hero-content">
            <h1 class="hero-title blend">{titleParts[0]}{hero.titleLineBreakAfter}<br />{titleParts[1]}</h1>
            <div class="hero-stats">
              {hero.stats.sort((a, b) => a.order - b.order).map((stat, index) => (
                <>
                  {index > 0 && <div class="hero-stat-divider" />}
                  <div class="hero-stat" key={stat.id}>
                    <span class="hero-stat-number blend">{counters[index]?.value}{stat.suffix}</span>
                    <span class="hero-stat-label blend">{stat.label}</span>
                  </div>
                </>
              ))}
            </div>
            <p class="hero-subtitle blend">{hero.subtitle}</p>
          </div>
        </section>
      )
  },
})
