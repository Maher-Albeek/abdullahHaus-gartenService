import { defineComponent } from 'vue'
import Header from '../includs/header'
import Footer from '../includs/footer'

export default defineComponent({
  name: 'DatenschutzPage',
  setup() {
    return () => (
      <>
        <Header />
        <main class="min-h-screen bg-white pt-24 pb-20 px-4">
          <div class="max-w-3xl mx-auto">
            <h1 class="text-3xl font-bold text-brand-dark mb-8">Datenschutzerklärung</h1>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">
                1. Datenschutz auf einen Blick
              </h2>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Allgemeine Hinweise</h3>
              <p class="text-gray-700 leading-relaxed mb-4">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
                personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
                Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
              </p>
              <h3 class="text-base font-semibold text-gray-800 mb-2">
                Datenerfassung auf dieser Website
              </h3>
              <p class="text-gray-700 leading-relaxed">
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
                Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle" in
                dieser Datenschutzerklärung entnehmen.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">2. Verantwortliche Stelle</h2>
              <p class="text-gray-700 leading-relaxed">
                AHG Haus-Gartenservice
                <br />
                Musterstraße 1<br />
                12345 Musterstadt
                <br />
                <br />
                Telefon: +49 (0) 123 456789
                <br />
                E-Mail: info@ahg-hausgartenservice.de
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">
                3. Datenerfassung auf dieser Website
              </h2>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Cookies</h3>
              <p class="text-gray-700 leading-relaxed mb-4">
                Diese Website verwendet keine Cookies.
              </p>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Server-Log-Dateien</h3>
              <p class="text-gray-700 leading-relaxed mb-4">
                Der Provider der Seiten erhebt und speichert automatisch Informationen in so
                genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies
                sind: Browsertyp und Browserversion, verwendetes Betriebssystem, Referrer URL,
                Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage und IP-Adresse. Diese
                Daten werden nicht mit anderen Datenquellen zusammengeführt.
              </p>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Kontaktformular</h3>
              <p class="text-gray-700 leading-relaxed">
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus
                dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks
                Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
                Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung dieser
                Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit
                der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher
                Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf
                unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten
                Anfragen (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">4. Ihre Rechte</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und
                Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem
                ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine
                Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung
                jederzeit für die Zukunft widerrufen.
              </p>
              <p class="text-gray-700 leading-relaxed">
                Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung der
                Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen
                ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu. Hierzu sowie zu
                weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-brand-dark mb-3">
                5. Analyse-Tools und Werbung
              </h2>
              <p class="text-gray-700 leading-relaxed">
                Diese Website verwendet keine Analyse-Tools oder Tracking-Dienste von Drittanbietern
                (z. B. Google Analytics).
              </p>
            </section>
          </div>
        </main>
        <Footer />
      </>
    )
  },
})
