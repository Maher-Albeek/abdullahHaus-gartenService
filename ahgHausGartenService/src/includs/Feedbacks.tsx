import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import feedbackData from '../data/feedbacks.json'

function StarRating({ count }: { count: number }) {
  return <div class="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, i) => <i key={i} class={`fa-star text-sm ${i < count ? 'fa-solid text-yellow-400' : 'fa-regular text-gray-300'}`} />)}</div>
}

export default defineComponent({
  name: 'FeedbacksSection',
  setup() {
    const feedbacks = feedbackData.reviews.filter((item) => item.enabled).sort((a, b) => a.order - b.order)
    const activeIndex = ref(0)
    const perView = ref(3)
    const updatePerView = () => { perView.value = window.innerWidth < 768 ? 1 : 3 }
    onMounted(() => { updatePerView(); window.addEventListener('resize', updatePerView) })
    onUnmounted(() => window.removeEventListener('resize', updatePerView))
    const maxIndex = computed(() => Math.max(0, feedbacks.length - perView.value))
    const prev = () => { activeIndex.value = activeIndex.value <= 0 ? maxIndex.value : activeIndex.value - 1 }
    const next = () => { activeIndex.value = activeIndex.value >= maxIndex.value ? 0 : activeIndex.value + 1 }
    const touchStartX = ref(0)
    const onTouchStart = (event: TouchEvent) => { touchStartX.value = event.changedTouches[0]?.clientX ?? 0 }
    const onTouchEnd = (event: TouchEvent) => {
      const delta = touchStartX.value - (event.changedTouches[0]?.clientX ?? 0)
      if (Math.abs(delta) > 50) delta > 0 ? next() : prev()
    }

    return () =>
      feedbackData.enabled && (
        <section id={feedbackData.id} class="py-20 px-4 bg-white overflow-hidden">
          <div class="max-w-6xl mx-auto px-6">
            <div class="text-center mb-14">
              <p class="section-kicker">{feedbackData.kicker}</p>
              <h2 class="content-heading">{feedbackData.heading}</h2>
              <p class="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">{feedbackData.intro}</p>
            </div>
            <div class="relative">
              <div class="overflow-hidden" onTouchstart={onTouchStart} onTouchend={onTouchEnd}>
                <div class="flex w-full transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${activeIndex.value * (100 / perView.value)}%)` }}>
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} class="shrink-0 px-2" style={{ width: `${100 / perView.value}%` }}>
                      <div class="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3 h-full hover:shadow-md transition-shadow duration-300">
                        <StarRating count={feedback.rating} />
                        <p class="text-gray-700 leading-relaxed italic flex-1">"{feedback.text}"</p>
                        <div class="mt-auto pt-4 border-t border-gray-200 flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-sm shrink-0">{feedback.name.charAt(0)}</div>
                          <div><p class="font-semibold text-gray-800 text-sm">{feedback.name}</p><p class="text-xs text-gray-400">{feedback.service}</p></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={prev} class="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:bg-brand-green hover:text-white hover:border-brand-green transition-colors duration-200" aria-label="Vorherige Bewertung"><i class="fa-solid fa-chevron-left text-sm" /></button>
              <button onClick={next} class="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:bg-brand-green hover:text-white hover:border-brand-green transition-colors duration-200" aria-label="Nächste Bewertung"><i class="fa-solid fa-chevron-right text-sm" /></button>
            </div>
            <div class="flex justify-center gap-2 mt-6">
              {Array.from({ length: maxIndex.value + 1 }).map((_, i) => <button key={i} onClick={() => { activeIndex.value = i }} class={`rounded-full transition-all duration-300 ${i === activeIndex.value ? 'w-5 h-2 bg-brand-green' : 'w-2 h-2 bg-gray-300'}`} aria-label={`Gruppe ${i + 1}`} />)}
            </div>
          </div>
        </section>
      )
  },
})
