import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Header',
  setup() {
    const menuOpen = ref(false)

    return () => (
      <header class="bg-brand-dark text-white shadow-md">
        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo / Brand */}
          <a href="/" class="flex items-center gap-3">
            <img src="/AHG.webp" alt="AHG Logo" class="h-12 w-auto" />
            <span class="text-lg font-bold tracking-wide hidden sm:block leading-tight">
              <span class="text-brand-red">AHG</span>{' '}
              <span class="text-white/90">Haus-Gartenservice</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav class="hidden md:flex gap-6 text-sm font-medium">
            <a href="/" class="hover:text-brand-green transition-colors">Home</a>
            <a href="/Leistungen" class="hover:text-brand-green transition-colors">Leistungen</a>
            <a href="/gallery" class="hover:text-brand-green transition-colors">Galerie</a>
            <a href="/Über-uns" class="hover:text-brand-green transition-colors">Über uns</a>
            <a href="/Kontakt" class="hover:text-brand-green transition-colors">Kontakt</a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            class="md:hidden p-2 rounded hover:bg-white/10 transition-colors"
            onClick={() => (menuOpen.value = !menuOpen.value)}
            aria-label="Menü öffnen"
          >
            <span class="block w-5 h-0.5 bg-white mb-1"></span>
            <span class="block w-5 h-0.5 bg-white mb-1"></span>
            <span class="block w-5 h-0.5 bg-white"></span>
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen.value && (
          <nav class="md:hidden bg-brand-red px-4 pb-4 flex flex-col gap-3 text-sm font-medium">
            <a href="/" class="hover:text-brand-green-light transition-colors">Home</a>
            <a href="/Leistungen" class="hover:text-brand-green-light transition-colors">Leistungen</a>
            <a href="/gallery" class="hover:text-brand-green-light transition-colors">Galerie</a>
            <a href="/Über-uns" class="hover:text-brand-green-light transition-colors">Über uns</a>
            <a href="/Kontakt" class="hover:text-brand-green-light transition-colors">Kontakt</a>
          </nav>
        )}
      </header>
    )
  },
})
