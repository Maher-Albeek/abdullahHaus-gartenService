import { defineComponent } from 'vue'

const images = [
  { src: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop&auto=format', alt: 'Garten 1' },
  { src: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=500&fit=crop&auto=format', alt: 'Garten 2' },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=350&fit=crop&auto=format', alt: 'Reinigung 1' },
  { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=450&fit=crop&auto=format', alt: 'Natur 1' },
  { src: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&h=400&fit=crop&auto=format', alt: 'Haus 1' },
  { src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=500&fit=crop&auto=format', alt: 'Natur 2' },
  { src: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=600&h=350&fit=crop&auto=format', alt: 'Fenster 1' },
  { src: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&h=450&fit=crop&auto=format', alt: 'Garten 3' },
  { src: 'https://images.unsplash.com/photo-1599598425947-5202edd56bdb?w=600&h=400&fit=crop&auto=format', alt: 'Reinigung 2' },
  { src: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=500&fit=crop&auto=format', alt: 'Wald 1' },
  { src: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600&h=350&fit=crop&auto=format', alt: 'Haus 2' },
  { src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=450&fit=crop&auto=format', alt: 'Natur 3' },
  { src: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop&auto=format', alt: 'Küche 1' },
  { src: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=500&fit=crop&auto=format', alt: 'Wohnzimmer 1' },
  { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=350&fit=crop&auto=format', alt: 'Haus 3' },
  { src: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&h=450&fit=crop&auto=format', alt: 'Haus 4' },
  { src: 'https://images.unsplash.com/photo-1534710961216-75c88202f43e?w=600&h=400&fit=crop&auto=format', alt: 'Garten 4' },
  { src: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=600&h=500&fit=crop&auto=format', alt: 'See 1' },
]

export default defineComponent({
  name: 'GallerySection',
  setup() {
    return () => (
      <section id="galerie" class="py-20 px-4 bg-gray-50">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-14">

            <p class="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
              Einblicke in unsere abgeschlossenen Projekte rund um Haus und Garten.
            </p>
          </div>

          <div class="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {images.map((img, i) => (
              <div key={i} class="mb-4 break-inside-avoid rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
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
      </section>
    )
  },
})
