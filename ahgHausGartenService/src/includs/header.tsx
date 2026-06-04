import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'HeaderSection',
  setup() {
    const navOpen = ref(false)
    const router = useRouter()

    const toggleNav = () => {
      navOpen.value = !navOpen.value
    }

    const navigateTo = (path: string, hash?: string) => {
      router.push(hash ? { path, hash } : path)
      navOpen.value = false
    }

    // Custom cursor
    let cursorEl: HTMLElement | null = null
    let cursorVisible = false

    const onMouseMove = (e: MouseEvent) => {
      if (!cursorEl) return
      cursorEl.style.left = e.clientX + 'px'
      cursorEl.style.top = e.clientY + 'px'
      if (!cursorVisible) {
        cursorEl.style.opacity = '1'
        cursorVisible = true
      }
    }

    const onMouseOut = () => {
      if (!cursorEl) return
      cursorEl.style.opacity = '0'
      cursorVisible = false
    }

    const onLinkOver = () => cursorEl?.classList.add('custom-cursor--link')
    const onLinkOut = () => cursorEl?.classList.remove('custom-cursor--link')

    onMounted(() => {
      if (window.matchMedia('(pointer: coarse)').matches) return
      cursorEl = document.querySelector('.custom-cursor')
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseout', onMouseOut)
      document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
        el.addEventListener('mouseover', onLinkOver)
        el.addEventListener('mouseout', onLinkOut)
      })
    })

    onUnmounted(() => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseout', onMouseOut)
    })

    return () => (
      <>
        <header>
          {/* Sticky Navigation */}
          <div class="ahg-sticky-nav">
            <a
              class="ahg-nav-logo"
              href="/"
              aria-label="Zur Startseite"
              onClick={(e: MouseEvent) => {
                e.preventDefault()
                navigateTo('/')
              }}
            >
              <img src="/AHG.webp" alt="AHG Haus-Gartenservice" />
            </a>
            <div
              class={`ahg-nav-btn${navOpen.value ? ' open' : ''}`}
              onClick={toggleNav}
              role="button"
              tabindex={0}
              aria-label={navOpen.value ? 'Menü schließen' : 'Menü öffnen'}
              onKeydown={(e: KeyboardEvent) => e.key === 'Enter' && toggleNav()}
            >
              <svg class="icon" viewBox="20 30 60 40">
                <path id="top-line-1" d={navOpen.value ? 'M35,35 L65,65 Z' : 'M30,37 L70,37 Z'} />
                <path
                  id="middle-line-1"
                  d="M30,50 L70,50 Z"
                  style={{ opacity: navOpen.value ? '0' : '1', transition: 'opacity 0.25s ease' }}
                />
                <path
                  id="bottom-line-1"
                  d={navOpen.value ? 'M35,65 L65,35 Z' : 'M30,63 L70,63 Z'}
                />
              </svg>
            </div>
          </div>

          {/* Takeover Navigation */}
          <div id="takeover-nav" class={navOpen.value ? 'shown' : ''}>
            <div class="takeover-inner">
              {/* Contact Column */}
              <div class="nav-col nav-contact-col">
                <div class="nav-bg-topo"></div>
                <div class="nav-contact-inner">
                  <h2 class="ahg-nav-heading">
                    Ihr zuverlässiger Partner für Haus &amp; Garten
                    <span class="dot-green">.</span>
                  </h2>
                  <ul class="ahg-contact-list">
                    <li>
                      <a href="tel:+4912345678">+49 123 456 78</a>
                    </li>
                    <li>
                      <a href="mailto:info@ahg-service.de">info@ahg-service.de</a>
                    </li>
                    <li>
                      <span>Musterstadt, Deutschland</span>
                    </li>
                  </ul>
                  <div class="ahg-social">
                    <a href="#">Instagram</a>
                    <span class="sep">|</span>
                    <a href="#">Facebook</a>
                  </div>
                </div>
              </div>

              {/* Menu Column */}
              <div class="nav-col nav-menu-col">
                <ul class="ahg-nav-links">
                  <li>
                    <a
                      href="/"
                      onClick={(e: MouseEvent) => {
                        e.preventDefault()
                        navigateTo('/')
                      }}
                    >
                      Start
                    </a>
                  </li>
                  <li>
                    <a
                      href="/#leistungen"
                      onClick={(e: MouseEvent) => {
                        e.preventDefault()
                        navigateTo('/', '#leistungen')
                      }}
                    >
                      Leistungen
                    </a>
                  </li>
                  <li>
                    <a
                      href="/#galerie"
                      onClick={(e: MouseEvent) => {
                        e.preventDefault()
                        navigateTo('/', '#galerie')
                      }}
                    >
                      Galerie
                    </a>
                  </li>
                  <li>
                    <a
                      href="/#about"
                      onClick={(e: MouseEvent) => {
                        e.preventDefault()
                        navigateTo('/', '#about')
                      }}
                    >
                      Über uns
                    </a>
                  </li>
                  <li>
                    <a
                      href="/#contact"
                      onClick={(e: MouseEvent) => {
                        e.preventDefault()
                        navigateTo('/', '#contact')
                      }}
                    >
                      Kontakt
                    </a>
                  </li>
                  <li class="nav-divider"></li>
                  <li>
                    <a
                      href="/impressum"
                      onClick={(e: MouseEvent) => {
                        e.preventDefault()
                        navigateTo('/impressum')
                      }}
                    >
                      Impressum
                    </a>
                  </li>
                  <li>
                    <a
                      href="/datenschutz"
                      onClick={(e: MouseEvent) => {
                        e.preventDefault()
                        navigateTo('/datenschutz')
                      }}
                    >
                      Datenschutz
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* Custom cursor */}
        <div class="custom-cursor" aria-hidden="true"></div>
      </>
    )
  },
})
