import { defineComponent } from 'vue'
import Header from '../includs/header'
import Footer from '../includs/footer'

export default defineComponent({
  name: 'ImpressumPage',
  setup() {
    return () => (
      <>
        <Header />
        <main class="min-h-screen bg-white pt-24 pb-20 px-4">
          <div class="max-w-3xl mx-auto">
            <h1 class="text-3xl font-bold text-brand-dark mb-8">Impressum</h1>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">Angaben gemäß § 5 TMG</h2>
              <p class="text-gray-700 leading-relaxed">
                AHG Haus-Gartenservice
                <br />
                Musterstraße 1<br />
                12345 Musterstadt
                <br />
                Deutschland
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">Kontakt</h2>
              <p class="text-gray-700 leading-relaxed">
                Telefon: +49 (0) 123 456789
                <br />
                E-Mail: info@ahg-hausgartenservice.de
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">
                Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
              </h2>
              <p class="text-gray-700 leading-relaxed">
                Abdullah Mustermann
                <br />
                Musterstraße 1<br />
                12345 Musterstadt
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">Haftungsausschluss</h2>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Haftung für Inhalte</h3>
              <p class="text-gray-700 leading-relaxed mb-4">
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen
                Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir
                als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
                rechtswidrige Tätigkeit hinweisen.
              </p>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Haftung für Links</h3>
              <p class="text-gray-700 leading-relaxed mb-4">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
                keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
                Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
                Anbieter oder Betreiber der Seiten verantwortlich.
              </p>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Urheberrecht</h3>
              <p class="text-gray-700 leading-relaxed">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
                Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
                bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </section>
          </div>
        </main>
        <Footer />
      </>
    )
  },
})
