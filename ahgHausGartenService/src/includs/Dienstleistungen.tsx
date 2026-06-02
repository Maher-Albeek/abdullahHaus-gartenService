import { defineComponent } from 'vue'

const services = [
  
  {
    icon: 'fa-solid fa-snowflake',
    title: 'Winterdienst',
    desc: 'Schneeräumung und Streudienst – damit Sie sicher unterwegs sind.',
    grad: '#1a6b8b, #85c1e9',
  },
  {
    icon: 'fa-solid fa-window-maximize',
    title: 'Fensterreinigung innen & außen',
    desc: 'Streifenfreie Fenster – innen wie außen, auch in großen Höhen.',
    grad: '#8B1A2B, #c0392b',
    featured: true,
  }, 
  {
    icon: 'fa-solid fa-building',
    title: 'Büro- & Arbeitsplatzreinigung',
    desc: 'Regelmäßige Reinigung von Büros und gewerblichen Arbeitsflächen.',
     grad: '#4D8B23, #62af2d',
  },
  {
    icon: 'fa-solid fa-broom',
    title: 'Standardreinigung',
    desc: 'Gründliche Reinigung aller Räume – zuverlässig und termingerecht.',
    grad: '#8B1A2B, #c0392b',
  },
  {
    icon: 'fa-solid fa-house',
    title: 'Hauswirtschaft',
    desc: 'Hauswirtschaftliche Dienstleistungen für ein gepflegtes Zuhause.',
    grad: '#4D8B23, #2ecc71',
  },
  {
    icon: 'fa-solid fa-glass-water',
    title: 'Glasreinigung',
    desc: 'Kristallklare Glasflächen – für Schaufenster, Fassaden und Trennwände.',
    grad: '#1a6b8b, #5dade2',
  },
  {
    icon: 'fa-solid fa-leaf',
    title: 'Gartenpflege',
    desc: 'Rasenmähen, Heckenschnitt, Bepflanzung und saisonale Gartenpflege.',
    grad: '#4D8B23, #a8e063',
  }, 
  {
    icon: 'fa-solid fa-truck-moving',
    title: 'Umzugsreinigung',
    desc: 'Professionelle Reinigung beim Ein- oder Auszug – besenrein bis makellos sauber.',
    grad: '#1a6b8b, #3498db',

  },
  {
    icon: 'fa-solid fa-wrench',
    title: 'Kleine Schönheitsreparaturen',
    desc: 'Streichen, Spachteln und kleine Ausbesserungsarbeiten für ein frisches Erscheinungsbild.',
    grad: '#8B1A2B, #f39c12',
  },
]

export default defineComponent({
  name: 'Dienstleistungen',
  setup() {
    return () => (
      <section id="leistungen" class="bg-gray-50 py-20 px-4">
        <div class="max-w-6xl mx-auto">
          {/* Section header */}
          <div class="text-center mb-14">
            <p class="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
              Von der Grundreinigung bis zum Winterdienst – wir sind Ihr zuverlässiger Partner
              rund um Haus und Garten.
            </p>
          </div>

          {/* Cards grid */}
          <div class="services-grid">
            {services.map((s) => (
              <div
                key={s.title}
                class={`service-card${'featured' in s && s.featured ? ' service-card--featured' : ''}`}
                style={`--grad: ${s.grad}`}
              >
                {'featured' in s && s.featured && (
                  <div class="card-badge">★ Beliebtester Dienst</div>
                )}
                <div class="card-title">{s.title}</div>
                <div class="card-icon ">
                  <i class={s.icon}></i>
                </div>
                <div class="card-content">
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div class="mt-14 text-center">
            <a
              href="/contact"
              class="inline-block bg-brand-red hover:bg-brand-red-light text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-colors text-base"
            >
              Jetzt Angebot anfragen
            </a>
          </div>
        </div>
      </section>
    )
  },
})
