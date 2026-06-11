import { defineComponent, ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWebsiteContentStore } from '../stores/websiteContent'

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default defineComponent({
  name: 'HeaderSection',
  setup() {
    const navOpen = ref(false)
    const navButton = ref<HTMLElement | null>(null)
    const takeoverNav = ref<HTMLElement | null>(null)
    const router = useRouter()
    const store = useWebsiteContentStore()

    const closeNav = (restoreFocus = true) => {
      navOpen.value = false
      if (restoreFocus) void nextTick(() => navButton.value?.focus())
    }

    const openNav = () => {
      navOpen.value = true
      void nextTick(() => {
        takeoverNav.value?.querySelector<HTMLElement>(focusableSelector)?.focus()
      })
    }

    const toggleNav = () => {
      if (navOpen.value) {
        closeNav()
      } else {
        openNav()
      }
    }

    const navigateTo = (path: string, hash?: string) => {
      router.push(hash ? { path, hash } : path)
      closeNav(false)
    }

    const onNavKeydown = (event: KeyboardEvent) => {
      if (!navOpen.value) return

      if (event.key === 'Escape') {
        event.preventDefault()
        closeNav()
        return
      }

      if (event.key !== 'Tab' || !takeoverNav.value || !navButton.value) return

      const focusableElements = [
        navButton.value,
        ...takeoverNav.value.querySelectorAll<HTMLElement>(focusableSelector),
      ]
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) return

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      } else if (!focusableElements.includes(document.activeElement as HTMLElement)) {
        event.preventDefault()
        ;(event.shiftKey ? lastElement : firstElement).focus()
      }
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
      document.addEventListener('keydown', onNavKeydown)
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
      document.removeEventListener('keydown', onNavKeydown)
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
              <img src={store.content.brand.logoUrl} alt={store.content.brand.businessName} />
            </a>
            <div
              ref={navButton}
              class={`ahg-nav-btn${navOpen.value ? ' open' : ''}`}
              onClick={toggleNav}
              role="button"
              tabindex={0}
              aria-expanded={navOpen.value}
              aria-controls="takeover-nav"
              aria-label={navOpen.value ? 'Menü schließen' : 'Menü öffnen'}
              onKeydown={(e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleNav()
                }
              }}
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
          <div
            ref={takeoverNav}
            id="takeover-nav"
            class={navOpen.value ? 'shown' : ''}
            aria-hidden={!navOpen.value}
            inert={!navOpen.value}
          >
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
                      <a href={`tel:+${store.content.contact.whatsapp}`}>{store.content.contact.phone}</a>
                    </li>
                    <li>
                      <a href={`mailto:${store.content.contact.email}`}>{store.content.contact.email}</a>
                    </li>
                    <li>
                      <span>{store.content.contact.address}</span>
                    </li>
                  </ul>
                  <div class="ahg-social">
                    <a href={store.content.contact.instagram || '#'}>Instagram</a>
                    <span class="sep">|</span>
                    <a href={store.content.contact.facebook || '#'}>Facebook</a>
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
                  <li>
                    <a
                      href="/#faq"
                      onClick={(e: MouseEvent) => {
                        e.preventDefault()
                        navigateTo('/', '#faq')
                      }}
                    >
                      FAQ
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
