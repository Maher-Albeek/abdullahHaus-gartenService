import { computed, defineComponent } from 'vue'
import { useWebsiteContentStore } from '../stores/websiteContent'

export default defineComponent({
  name: 'AboutSection',
  setup() {
    const store = useWebsiteContentStore()
    const section = computed(() => store.content.sections.find((entry) => entry.id === 'about'))

    return () => {
      const about = section.value
      if (!about?.enabled) return null
      const images = [about.content.imageUrl, about.content.imageUrl2]
        .map((url) => String(url ?? ''))
        .filter(Boolean)

      return (
        <section id="about" class="py-20 px-4 bg-white">
          <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
            <div class={`w-full md:w-1/2 grid gap-4 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {images.map((imageUrl, index) => (
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt={`Unser Team bei der Arbeit ${index + 1}`}
                  class="w-full h-full min-h-[260px] max-h-[600px] object-cover rounded-lg shadow-md"
                />
              ))}
            </div>
            <div class="w-full md:w-1/2">
              <p class="section-kicker">{String(about.content.kicker ?? '')}</p>
              <h2 class="content-heading">{String(about.content.title ?? '')}</h2>
              <p class="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-6">
                {String(about.content.text ?? '')}
              </p>
            </div>
          </div>
        </section>
      )
    }
  },
})
