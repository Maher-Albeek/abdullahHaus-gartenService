import { defineComponent } from 'vue'
export default defineComponent({
  name: 'Contact',
  setup() {
    return () => (
        <section id="contact" class="py-20 px-4 bg-white"> 
            <div class="max-w-6xl mx-auto">
                <p class="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto mb-6 text-center">
                    Haben Sie Fragen oder möchten Sie ein individuelles Angebot? Wir freuen uns auf Ihre Nachricht!
                </p>
                <form class="max-w-2xl mx-auto bg-gray-50 p-8 rounded-lg shadow-md">
                    <div class="mb-4">
                        <label for="name" class="block text-gray-700 font-bold mb-2">Name</label>
                        <input type="text" id="name" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" placeholder="Ihr Name" />
                    </div>
                    <div class="mb-4">
                        <label for="email" class="block text-gray-700 font-bold mb-2">E-Mail</label>
                        <input type="email" id="email" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" placeholder="Ihre E-Mail" />
                    </div>
                    <div class="mb-4">
                        <label for="leistung" class="block text-gray-700 font-bold mb-2">Gewünschte Leistung</label>
                        <select id="leistung" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white text-gray-700">
                            <option value="">– Bitte wählen –</option>
                            <option value="Umzugsreinigung">🚚 Umzugsreinigung</option>
                            <option value="Büro- & Arbeitsplatzreinigung">🏢 Büro- & Arbeitsplatzreinigung</option>
                            <option value="Standardreinigung">🧹 Standardreinigung</option>
                            <option value="Hauswirtschaft">🏠 Hauswirtschaft</option>
                            <option value="Fensterreinigung innen & außen">🪟 Fensterreinigung innen & außen</option>
                            <option value="Gartenpflege">🌿 Gartenpflege</option>
                            <option value="Winterdienst">❄️ Winterdienst</option>
                            <option value="Glasreinigung">✨ Glasreinigung</option>
                            <option value="Kleine Schönheitsreparaturen">🔧 Kleine Schönheitsreparaturen</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label for="message" class="block text-gray-700 font-bold mb-2">Nachricht</label>
                        <textarea id="message" rows="5" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" placeholder="Ihre Nachricht"></textarea>
                    </div>
                    <div class="text-center">
                        <button type="submit" class="bg-brand-red hover:bg-brand-red-light text-white font-bold px-8 py-3 rounded-lg transition-colors shadow-lg">
                            Nachricht senden
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
  }
})
