import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HeroSection',
  setup() {
    return () => (
      <section class="ahg-hero">
        <div class="video-wrap">
          <video autoplay playsinline loop muted id="video-bg">
            <source src="https://assets.codepen.io/319606/tactus-waves-hero-sm.mp4" type="video/mp4" />
          </video>
        </div>
        <div class="gradient-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-title blend">
            Abdullah für
            <br />
            Haus &amp; Garten
          </h1>
        </div>
      </section>
    )
  },
})

