import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'

export default defineComponent({
  name: 'FooterSection',
  setup() {
    return () => (
      <footer class="bg-brand-dark text-white pt-12 pb-6">
        <div class="max-w-6xl mx-auto px-4">
          {/* Three-column grid */}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Column 1 – Brand */}
            <div>
              <img src="/AHG.webp" alt="AHG Haus-Gartenservice" class="h-12 mb-4" />
              <p class="text-sm opacity-75 leading-relaxed">
                Ihr zuverlässiger Partner für professionelle Pflege und Instandhaltung von Haus und
                Garten.
              </p>
            </div>

            {/* Column 2 – Contact */}
            <div>
              <h3 class="text-base font-semibold mb-4 tracking-wide uppercase opacity-90">
                Kontakt
              </h3>
              <ul class="space-y-2 text-sm opacity-75">
                <li>
                  <a href="tel:+4912345678" class="hover:opacity-100 transition-opacity">
                    +49 123 456 78
                  </a>
                </li>
                <li>
                  <a href="mailto:info@ahg-service.de" class="hover:opacity-100 transition-opacity">
                    info@ahg-service.de
                  </a>
                </li>
                <li>Musterstraße 1, 12345 Musterstadt</li>
              </ul>
            </div>

            {/* Column 3 – Links */}
            <div>
              <h3 class="text-base font-semibold mb-4 tracking-wide uppercase opacity-90">
                Navigation
              </h3>
              <ul class="space-y-2 text-sm opacity-75">
                <li>
                  <RouterLink to="/" class="hover:opacity-100 transition-opacity">
                    Startseite
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/#leistungen" class="hover:opacity-100 transition-opacity">
                    Leistungen
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/#galerie" class="hover:opacity-100 transition-opacity">
                    Galerie
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/#about" class="hover:opacity-100 transition-opacity">
                    Über uns
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/#contact" class="hover:opacity-100 transition-opacity">
                    Kontakt
                  </RouterLink>
                </li>
              </ul>
            </div>
          </div>

          {/* Bank info */}
          <div class="border-t border-white/20 pt-6 mb-6">
            <h3 class="text-base font-semibold mb-3 tracking-wide uppercase opacity-90">
              Bankverbindung
            </h3>
            <ul class="text-sm opacity-75 space-y-1">
              <li>
                Bank: <span class="font-medium">Sparkasse</span>
              </li>
              <li>
                IBAN: <span class="font-medium">DE00 0000 0000 0000 0000 00</span>
              </li>
              <li>
                BIC: <span class="font-medium">XXXXXXXX</span>
              </li>
              <li>
                Kontoinhaber: <span class="font-medium">AHG Haus-Gartenservice</span>
              </li>
            </ul>
          </div>

          {/* Bottom bar */}
          <div class="border-t border-white/20 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs opacity-60">
            <span>
              &copy; {new Date().getFullYear()} AHG Haus-Gartenservice. Alle Rechte vorbehalten.
            </span>
            <div class="flex gap-5">
              <RouterLink to="/impressum" class="hover:opacity-100 transition-opacity">
                Impressum
              </RouterLink>
              <RouterLink to="/datenschutz" class="hover:opacity-100 transition-opacity">
                Datenschutz
              </RouterLink>
            </div>
          </div>

          {/* Credit */}
          <div class="mt-4 text-center text-xs opacity-40">Created by Maher Albeek</div>
        </div>
      </footer>
    )
  },
})
