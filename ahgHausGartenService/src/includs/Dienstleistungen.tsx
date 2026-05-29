import { defineComponent } from 'vue'

const services = [
  {
    icon: '🚚',
    title: 'Umzugsreinigung',
    desc: 'Professionelle Reinigung beim Ein- oder Auszug – besenrein bis makellos sauber.',
  },
  {
    icon: '🏢',
    title: 'Büro- & Arbeitsplatzreinigung',
    desc: 'Regelmäßige Reinigung von Büros und gewerblichen Arbeitsflächen.',
  },
  {
    icon: '🧹',
    title: 'Standardreinigung',
    desc: 'Gründliche Reinigung aller Räume – zuverlässig und termingerecht.',
  },
  {
    icon: '🏠',
    title: 'Hauswirtschaft',
    desc: 'Hauswirtschaftliche Dienstleistungen für ein gepflegtes Zuhause.',
  },
  {
    icon: '🪟',
    title: 'Fensterreinigung innen & außen',
    desc: 'Streifenfreie Fenster – innen wie außen, auch in großen Höhen.',
  },
  {
    icon: '🌿',
    title: 'Gartenpflege',
    desc: 'Rasenmähen, Heckenschnitt, Bepflanzung und saisonale Gartenpflege.',
  },
  {
    icon: '❄️',
    title: 'Winterdienst',
    desc: 'Schneeräumung und Streudienst – damit Sie sicher unterwegs sind.',
  },
  {
    icon: '✨',
    title: 'Glasreinigung',
    desc: 'Kristallklare Glasflächen – für Schaufenster, Fassaden und Trennwände.',
  },
  {
    icon: '🔧',
    title: 'Kleine Schönheitsreparaturen',
    desc: 'Streichen, Spachteln und kleine Ausbesserungsarbeiten für ein frisches Erscheinungsbild.',
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div
                key={s.title}
                class="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-red/30 transition-all duration-200"
              >
                <div class="text-4xl mb-4">{s.icon}</div>
                <h3 class="text-lg font-bold text-brand-dark mb-2 group-hover:text-brand-red transition-colors">
                  {s.title}
                </h3>
                <p class="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
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
