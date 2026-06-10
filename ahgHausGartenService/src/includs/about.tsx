import { defineComponent } from 'vue'
import about from '../data/about.json'

export default defineComponent({
  name: 'AboutSection',
  setup() {
    return () =>
      about.enabled && (
        <section id={about.id} class="py-20 px-4 bg-white">
          <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
            <div class="w-full md:w-1/2">
              <img src={about.image.src} alt={about.image.alt} class="w-full h-auto max-h-[600px] object-cover rounded-lg shadow-md" />
            </div>
            <div class="w-full md:w-1/2">
              <p class="section-kicker">{about.kicker}</p>
              <h2 class="content-heading mb-6">{about.heading}</h2>
              {about.paragraphs.map((paragraph, index) => (
                <p key={paragraph} class={`text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto${index < about.paragraphs.length - 1 ? ' mb-6' : ''}`}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      )
  },
})
