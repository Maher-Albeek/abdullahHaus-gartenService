import { defineComponent } from 'vue'

const faqs = [
  {
    question: 'Wie erhalte ich ein Angebot?',
    answer: 'Senden Sie uns Ihre Anfrage über das Kontaktformular oder rufen Sie uns an. Nach einer kurzen Abstimmung zu Objekt, Leistung und gewünschtem Termin erhalten Sie ein individuelles Angebot.',
  },
  {
    question: 'Sind auch regelmäßige Termine möglich?',
    answer: 'Ja. Viele Leistungen bieten wir einmalig oder in einem passenden regelmäßigen Rhythmus an, zum Beispiel wöchentlich, zweiwöchentlich oder saisonal.',
  },
  {
    question: 'Welche Informationen benötigen Sie für eine Anfrage?',
    answer: 'Hilfreich sind die gewünschte Leistung, die ungefähre Größe oder Anzahl der Flächen, der Standort und Ihr Wunschtermin. Fotos können die erste Einschätzung zusätzlich erleichtern.',
  },
  {
    question: 'Kann der Leistungsumfang später angepasst werden?',
    answer: 'Ja. Wenn sich Ihr Bedarf ändert, stimmen wir zusätzliche oder reduzierte Aufgaben vor dem nächsten Einsatz mit Ihnen ab.',
  },
  {
    question: 'Für wen bieten Sie Ihre Leistungen an?',
    answer: 'Wir unterstützen Privathaushalte, Vermieter, Büros und kleinere Gewerbebetriebe bei Arbeiten rund um Haus, Reinigung und Garten.',
  },
]

export default defineComponent({
  name: 'FaqSection',
  setup() {
    return () => (
      <section id="faq" class="faq-section py-20 px-4 bg-gray-50">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-10">
            <p class="section-kicker">FAQ</p>
            <h2 class="content-heading">Häufig gestellte Fragen</h2>
            <p class="content-intro mx-auto">Hier finden Sie schnelle Antworten zum Ablauf und zu unseren Leistungen.</p>
          </div>
          <div class="faq-list">
            {faqs.map((faq, index) => (
              <details class="faq-item" key={faq.question} open={index === 0}>
                <summary><span>{faq.question}</span><i class="fa-solid fa-plus" aria-hidden="true"></i></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
          <div class="faq-contact">
            <span>Noch eine Frage offen?</span>
            <a href="#contact">Direkt Kontakt aufnehmen</a>
          </div>
        </div>
      </section>
    )
  },
})
