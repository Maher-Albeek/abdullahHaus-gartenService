import { defineComponent } from 'vue'

const row1 = [
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=250&fit=crop&auto=format',
]

const row2 = [
  'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1599598425947-5202edd56bdb?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=250&fit=crop&auto=format',
]

const row3 = [
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1534710961216-75c88202f43e?w=400&h=250&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&h=250&fit=crop&auto=format',
]

function ImageRow({ images, animClass }: { images: string[]; animClass: string }) {
  const doubled = [...images, ...images]
  return (
    <div class="flex-1 overflow-hidden">
      <div class={`flex h-full ${animClass}`}>
        {doubled.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            aria-hidden="true"
            class="h-full object-cover flex-none"
            style={{ width: '320px', marginRight: '8px' }}
          />
        ))}
      </div>
    </div>
  )
}

export default defineComponent({
  name: 'Hero',
  setup() {
    return () => (
      <section class="relative bg-brand-dark text-white overflow-hidden min-h-175 flex flex-col">
        {/* Background image rows */}
        <div class="absolute inset-0 flex flex-col" aria-hidden="true">
          <ImageRow images={row1} animClass="animate-marquee-right" />
          <ImageRow images={row2} animClass="animate-marquee-left" />
          <ImageRow images={row3} animClass="animate-marquee-right" />
        </div>

        {/* Dark overlay */}
        <div class="absolute inset-0 bg-linear-to-br from-brand-dark/90 via-brand-red/75 to-brand-dark/85"></div>

        {/* Content */}
        <div class="relative z-10 flex-1 max-w-6xl mx-auto px-4 py-24 md:py-36 flex flex-col items-center text-center gap-6">
          {/* Badge */}
          <span class="inline-block bg-brand-green text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full">
            Ihr Profi für Haus &amp; Garten
          </span>

          {/* Headline */}
          <h1 class="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">
            Gepflegter Garten &amp; sauberes Zuhause –{' '}
            <span class="text-brand-green-light">das ganze Jahr</span>
          </h1>

          {/* Subheadline */}
          <p class="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            Wir kümmern uns um Rasenpflege, Heckenschnitt, Gartengestaltung und
            Hausmeisterservice – zuverlässig, professionell und zu fairen Preisen.
          </p>

          {/* CTA Buttons */}
          <div class="flex flex-col sm:flex-row gap-4 mt-4">
            <a
              href="#contact"
              class="bg-brand-red hover:bg-brand-red-light text-white font-bold px-8 py-3 rounded-lg transition-colors shadow-lg"
            >
              Jetzt Angebot anfragen
            </a>
            <a
              href="#leistungen"
              class="border border-brand-green hover:bg-brand-green/20 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Unsere Leistungen
            </a>
          </div>

          {/* Feature chips */}
          <div class="flex flex-wrap justify-center gap-3 mt-8 text-sm text-white/80">
            {['Rasenpflege', 'Heckenschnitt', 'Gartengestaltung', 'Hausmeisterservice', 'Laubentsorgung'].map((item) => (
              <span key={item} class="flex items-center gap-1.5 bg-brand-dark/70 backdrop-blur-sm px-3 py-1 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-green inline-block"></span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
