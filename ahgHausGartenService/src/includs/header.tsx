import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Header',
  setup() {
    const menuOpen = ref(false)

    return () => (
      <header class="bg-brand-dark text-white shadow-md fixed top-0 left-0 w-full z-30">
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
            <a href="#" class="hover:text-brand-green transition-colors">Home</a>
            <a href="#leistungen" class="hover:text-brand-green transition-colors">Leistungen</a>
            <a href="#galerie" class="hover:text-brand-green transition-colors">Galerie</a>
            <a href="#about" class="hover:text-brand-green transition-colors">Über uns</a>
            <a href="#contact" class="hover:text-brand-green transition-colors">Kontakt</a>
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

        {/* Mobile Nav - fullscreen glass overlay */}
        {menuOpen.value && (
          <nav class="md:hidden fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 text-lg font-semibold backdrop-blur-md bg-black/70">
            <button
              class="absolute top-4 right-4 p-2 text-white/70 hover:text-white text-2xl leading-none"
              onClick={() => (menuOpen.value = false)}
              aria-label="Menü schließen"
            >
              ✕
            </button>
            <a href="#" onClick={() => (menuOpen.value = false)} class="text-white hover:text-brand-green transition-colors text-center">Home</a>
            <a href="#leistungen" onClick={() => (menuOpen.value = false)} class="text-white hover:text-brand-green transition-colors text-center">Leistungen</a>
            <a href="#galerie" onClick={() => (menuOpen.value = false)} class="text-white hover:text-brand-green transition-colors text-center">Galerie</a>
            <a href="#about" onClick={() => (menuOpen.value = false)} class="text-white hover:text-brand-green transition-colors text-center">Über uns</a>
            <a href="#contact" onClick={() => (menuOpen.value = false)} class="text-white hover:text-brand-green transition-colors text-center">Kontakt</a>
          </nav>
        )}
      </header>
    )
  },
})
