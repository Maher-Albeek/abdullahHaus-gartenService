import { defineComponent } from 'vue'
import Stack from '../component/Stack'
import gallery from '../data/gallery.json'

export default defineComponent({
  name: 'GallerySection',
  setup() {
    const images = gallery.items.filter((item) => item.enabled).sort((a, b) => a.order - b.order)
    return () =>
      gallery.enabled && (
        <section id={gallery.id} class="py-20 px-4 bg-gray-50">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-14">
              <p class="section-kicker">{gallery.kicker}</p>
              <h2 class="content-heading">{gallery.heading}</h2>
              <p class="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">{gallery.intro}</p>
            </div>
            <div class="block sm:hidden">
              <div class="relative mx-auto" style="width: 280px; height: 360px">
                <Stack images={images.slice(0, gallery.mobileStackLimit)} sensitivity={210} autoplay={false} autoplayDelay={2500} sendToBackOnClick={true} randomRotation={false} />
              </div>
              <p class="text-center text-sm text-gray-400 mt-8">{gallery.mobileHint}</p>
            </div>
            <div class="hidden sm:block">
              <div class="columns-1 sm:columns-2 lg:columns-3 gap-4">
                {images.map((image) => (
                  <div key={image.id} class="mb-4 break-inside-avoid rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <img src={image.src} alt={image.alt} loading="lazy" class="w-full h-auto block hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )
  },
})
