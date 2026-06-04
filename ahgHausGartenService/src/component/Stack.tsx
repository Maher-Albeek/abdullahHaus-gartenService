import { defineComponent, ref, onMounted, onUnmounted, type PropType } from 'vue'

interface CardItem {
  id: number
  src: string
  alt: string
}

export default defineComponent({
  name: 'GalleryStack',
  props: {
    images: {
      type: Array as PropType<{ src: string; alt: string }[]>,
      default: () => [],
    },
    autoplay: {
      type: Boolean,
      default: true,
    },
    autoplayDelay: {
      type: Number,
      default: 3000,
    },
    randomRotation: {
      type: Boolean,
      default: false,
    },
    sendToBackOnClick: {
      type: Boolean,
      default: true,
    },
      sensitivity: {
      type: Number,
      default: 200,
    },
  },
  setup(props) {
    const stack = ref<CardItem[]>([])
    const rotations = ref<number[]>([])

    const initStack = () => {
      stack.value = props.images.map((img, index) => ({
        id: index + 1,
        src: img.src,
        alt: img.alt,
      }))
      rotations.value = props.images.map(() => (props.randomRotation ? Math.random() * 10 - 5 : 0))
    }

    const sendToBack = (id: number) => {
      const newStack = [...stack.value]
      const index = newStack.findIndex((card) => card.id === id)
      const removed = newStack.splice(index, 1)
      if (removed[0]) newStack.unshift(removed[0])
      stack.value = newStack
    }

    let interval: ReturnType<typeof setInterval> | null = null

    onMounted(() => {
      initStack()
      if (props.autoplay && props.images.length > 1) {
        interval = setInterval(() => {
          const top = stack.value[stack.value.length - 1]
          if (top) sendToBack(top.id)
        }, props.autoplayDelay)
      }
    })

    onUnmounted(() => {
      if (interval) clearInterval(interval)
    })

    return () => (
      <div class="relative w-full h-full" style="perspective: 600px">
        {stack.value.map((card, index) => {
          const stackLen = stack.value.length
          const rotateZ = (stackLen - index - 1) * 4 + (rotations.value[index] ?? 0)
          const scale = 1 + index * 0.06 - stackLen * 0.06
          return (
            <div
              key={card.id}
              class="absolute inset-0 rounded-2xl overflow-hidden shadow-md border border-gray-100"
              style={{
                transform: `rotateZ(${rotateZ}deg) scale(${scale})`,
                transformOrigin: '90% 90%',
                transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: props.sendToBackOnClick ? 'pointer' : 'default',
              }}
              onClick={() => props.sendToBackOnClick && sendToBack(card.id)}
            >
              <img
                src={card.src}
                alt={card.alt}
                class="w-full h-full object-cover pointer-events-none"
                loading="lazy"
              />
            </div>
          )
        })}
      </div>
    )
  },
})
