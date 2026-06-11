import { computed, defineComponent } from 'vue'
import Stack from '../component/Stack'
import { useWebsiteContentStore } from '../stores/websiteContent'

export default defineComponent({
  name: 'GallerySection',
  setup() {
    const store = useWebsiteContentStore()
    const section = computed(() => store.content.sections.find((entry) => entry.id === 'gallery'))
    const images = computed(() =>
      (section.value?.items ?? []).map((item) => ({
        src: String(item.imageUrl ?? item.src ?? ''),
        alt: String(item.alt ?? ''),
      })),
    )

    return () => (
      <section id="galerie" class="py-20 px-4 bg-gray-50">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-14">
            <p class="section-kicker">{String(section.value?.content.kicker ?? '')}</p>
            <h2 class="content-heading">{String(section.value?.content.title ?? '')}</h2>
            <p class="content-intro mx-auto">{String(section.value?.content.intro ?? '')}</p>
          </div>

          <div class="block sm:hidden">
            <div class="relative mx-auto" style="width: 280px; height: 360px">
              <Stack
                images={images.value.slice(0, 6)}
                sensitivity={210}
                autoplay={false}
                autoplayDelay={2500}
                sendToBackOnClick={true}
                randomRotation={false}
              />
            </div>
            <p class="text-center text-sm text-gray-400 mt-8">Tippen, um mehr zu sehen</p>
          </div>

          <div class="hidden sm:block">
            <div class="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {images.value.map((img, index) => (
                <div
                  key={index}
                  class="mb-4 break-inside-avoid rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    class="w-full h-auto block hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
