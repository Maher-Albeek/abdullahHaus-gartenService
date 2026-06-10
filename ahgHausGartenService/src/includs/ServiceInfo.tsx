import { defineComponent } from 'vue'

const benefits = [
  {
    icon: 'fa-solid fa-file-signature',
    title: 'Transparentes Angebot',
    text: 'Sie erhalten vor Beginn eine klare Leistungsübersicht und einen nachvollziehbaren Preis.',
  },
  {
    icon: 'fa-solid fa-calendar-check',
    title: 'Verlässliche Termine',
    text: 'Wir stimmen den Einsatz verbindlich mit Ihnen ab und informieren Sie bei Änderungen frühzeitig.',
  },
  {
    icon: 'fa-solid fa-list-check',
    title: 'Passend zu Ihrem Bedarf',
    text: 'Einmaliger Auftrag oder regelmäßige Pflege: Umfang und Rhythmus richten sich nach Ihrem Objekt.',
  },
  {
    icon: 'fa-solid fa-comments',
    title: 'Direkter Kontakt',
    text: 'Ihre Fragen und Wünsche klären Sie direkt mit einem persönlichen Ansprechpartner.',
  },
]

const concerns = [
  {
    question: 'Bleiben die Kosten überschaubar?',
    answer: 'Ja. Wir besprechen den gewünschten Umfang vorab und erstellen darauf basierend Ihr Angebot.',
  },
  {
    question: 'Kann ich einzelne Leistungen kombinieren?',
    answer: 'Ja. Reinigung, Gartenpflege und kleinere Reparaturen können passend zusammengefasst werden.',
  },
  {
    question: 'Muss ich während des Termins vor Ort sein?',
    answer: 'Nicht zwingend. Zugang, Aufgaben und Abnahme können individuell mit Ihnen vereinbart werden.',
  },
]

export default defineComponent({
  name: 'ServiceInfoSection',
  setup() {
    return () => (
      <section id="vorteile" class="service-info-section py-20 px-4">
        <div class="max-w-6xl mx-auto">
          <div class="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
            <div>
              <p class="section-kicker">Ihre Vorteile</p>
              <h2 class="content-heading">Ein Service, auf den Sie sich verlassen können</h2>
              <p class="content-intro">
                Von der ersten Anfrage bis zur erledigten Arbeit sorgen wir für klare Absprachen,
                saubere Ergebnisse und einen unkomplizierten Ablauf.
              </p>
              <div class="benefit-grid">
                {benefits.map((benefit) => (
                  <article class="benefit-card" key={benefit.title}>
                    <span class="benefit-icon"><i class={benefit.icon} aria-hidden="true"></i></span>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.text}</p>
                  </article>
                ))}
              </div>
            </div>
            <aside class="concerns-panel" aria-labelledby="concerns-title">
              <p class="section-kicker section-kicker--light">Gut zu wissen</p>
              <h2 id="concerns-title">Häufige Anliegen, klar beantwortet</h2>
              <p class="concerns-intro">
                Gute Zusammenarbeit beginnt mit offenen Antworten. Diese Punkte klären wir bereits
                vor dem ersten Termin.
              </p>
              <div class="concern-list">
                {concerns.map((concern) => (
                  <div class="concern-item" key={concern.question}>
                    <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                    <div><h3>{concern.question}</h3><p>{concern.answer}</p></div>
                  </div>
                ))}
              </div>
              <a href="#contact" class="concerns-cta">
                Persönlich beraten lassen <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </a>
            </aside>
          </div>
        </div>
      </section>
    )
  },
})
