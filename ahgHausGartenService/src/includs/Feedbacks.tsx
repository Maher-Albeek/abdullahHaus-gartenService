import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { useWebsiteContentStore } from '../stores/websiteContent'

const defaultFeedbacks = [
  {
    name: 'Maria S.',
    rating: 5,
    text: 'Absolut professioneller Service! Der Garten sieht nach jedem Besuch traumhaft aus. Ich kann AHG Haus-Gartenservice nur wärmstens empfehlen.',
    service: 'Gartenpflege',
  },
  {
    name: 'Thomas K.',
    rating: 5,
    text: 'Sehr zuverlässig und pünktlich. Der Winterdienst hat uns in dieser Saison wirklich geholfen. Wir fühlen uns bei jedem Wetter sicher.',
    service: 'Winterdienst',
  },
  {
    name: 'Sandra B.',
    rating: 5,
    text: 'Die Fensterreinigung war makellos – innen und außen blitzsauber. Das Team ist freundlich, diskret und arbeitet sehr gründlich.',
    service: 'Fensterreinigung',
  },
  {
    name: 'Klaus M.',
    rating: 5,
    text: 'Seit zwei Jahren nutze ich den Service für mein Büro. Die Qualität ist konstant hoch und der Preis ist fair. Sehr empfehlenswert!',
    service: 'Büroreinigung',
  },
  {
    name: 'Petra H.',
    rating: 5,
    text: 'Beim Auszug half uns das Team mit einer blitzschnellen Umzugsreinigung. Die Wohnung war in einem perfekten Zustand – wir bekamen die volle Kaution zurück.',
    service: 'Umzugsreinigung',
  },
  {
    name: 'Ahmed R.',
    rating: 5,
    text: 'Hervorragende Arbeit bei der Heckenpflege und Rasenmahd. Freundliches Team, faire Preise und immer termingerecht. Danke!',
    service: 'Gartenpflege',
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div class="flex gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          class={`fa-star text-sm ${i < count ? 'fa-solid text-yellow-400' : 'fa-regular text-gray-300'}`}
        />
      ))}
    </div>
  )
}

export default defineComponent({
  name: 'FeedbacksSection',
  setup() {
    const store = useWebsiteContentStore()
    const section = computed(() => store.content.sections.find((entry) => entry.id === 'testimonials'))
    const feedbacks = computed(() => section.value?.items ?? defaultFeedbacks)
    const activeIndex = ref(0)
    const perView = ref(3)

    const updatePerView = () => {
      perView.value = window.innerWidth < 768 ? 1 : 3
    }

    onMounted(() => {
      updatePerView()
      window.addEventListener('resize', updatePerView)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', updatePerView)
    })

    const maxIndex = computed(() => Math.max(0, feedbacks.value.length - perView.value))

    const prev = () => {
      activeIndex.value = activeIndex.value <= 0 ? maxIndex.value : activeIndex.value - 1
    }
    const next = () => {
      activeIndex.value = activeIndex.value >= maxIndex.value ? 0 : activeIndex.value + 1
    }

    const touchStartX = ref(0)
    const touchEndX = ref(0)
    const SWIPE_THRESHOLD = 50

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.value = e.changedTouches[0]?.clientX ?? 0
    }
    const onTouchEnd = (e: TouchEvent) => {
      touchEndX.value = e.changedTouches[0]?.clientX ?? 0
      const delta = touchStartX.value - touchEndX.value
      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        if (delta > 0) next()
        else prev()
      }
    }

    return () => (
      <section id="feedbacks" class="py-20 px-4 bg-white overflow-hidden">
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center mb-14">
            <p class="section-kicker">{String(section.value?.content.kicker ?? '')}</p>
            <h2 class="content-heading">{String(section.value?.content.title ?? '')}</h2>
          </div>

          <div class="relative">
            {/* Slider viewport */}
            <div class="overflow-hidden" onTouchstart={onTouchStart} onTouchend={onTouchEnd}>
              <div
                class="flex w-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeIndex.value * (100 / perView.value)}%)` }}
              >
                {feedbacks.value.map((fb, i) => (
                  <div key={i} class="shrink-0 px-2" style={{ width: `${100 / perView.value}%` }}>
                    <div class="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3 h-full hover:shadow-md transition-shadow duration-300">
                      <StarRating count={Number(fb.rating)} />
                      <p class="text-gray-700 leading-relaxed italic flex-1">"{String(fb.text)}"</p>
                      <div class="mt-auto pt-4 border-t border-gray-200 flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {String(fb.name).charAt(0)}
                        </div>
                        <div>
                          <p class="font-semibold text-gray-800 text-sm">{String(fb.name)}</p>
                          <p class="text-xs text-gray-400">{String(fb.service)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Left arrow */}
            <button
              onClick={prev}
              class="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:bg-brand-green hover:text-white hover:border-brand-green transition-colors duration-200"
              aria-label="Vorherige Bewertung"
            >
              <i class="fa-solid fa-chevron-left text-sm" />
            </button>

            {/* Right arrow */}
            <button
              onClick={next}
              class="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:bg-brand-green hover:text-white hover:border-brand-green transition-colors duration-200"
              aria-label="Nächste Bewertung"
            >
              <i class="fa-solid fa-chevron-right text-sm" />
            </button>
          </div>

          {/* Dots */}
          <div class="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex.value + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  activeIndex.value = i
                }}
                class={`rounded-full transition-all duration-300 ${i === activeIndex.value ? 'w-5 h-2 bg-brand-green' : 'w-2 h-2 bg-gray-300'}`}
                aria-label={`Gruppe ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    )
  },
})
