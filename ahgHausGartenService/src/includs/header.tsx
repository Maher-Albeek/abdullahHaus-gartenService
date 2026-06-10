import { defineComponent, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import header from '../data/header.json'
import site from '../data/site.json'

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default defineComponent({
  name: 'HeaderSection',
  setup() {
    const navOpen = ref(false)
    const navButton = ref<HTMLElement | null>(null)
    const takeoverNav = ref<HTMLElement | null>(null)
    const router = useRouter()
    const navigation = header.navigation.filter((item) => item.enabled).sort((a, b) => a.order - b.order)
    const legalNavigation = header.legalNavigation.filter((item) => item.enabled).sort((a, b) => a.order - b.order)
    const socialLinks = site.socialLinks.filter((item) => item.enabled)

    const closeNav = (restoreFocus = true) => {
      navOpen.value = false
      if (restoreFocus) void nextTick(() => navButton.value?.focus())
    }
    const openNav = () => {
      navOpen.value = true
      void nextTick(() => takeoverNav.value?.querySelector<HTMLElement>(focusableSelector)?.focus())
    }
    const toggleNav = () => navOpen.value ? closeNav() : openNav()
    const navigateTo = (target: string) => {
      const [path, hash] = target.split('#')
      void router.push(hash ? { path: path || '/', hash: `#${hash}` } : target)
      closeNav(false)
    }
    const onNavKeydown = (event: KeyboardEvent) => {
      if (!navOpen.value) return
      if (event.key === 'Escape') { event.preventDefault(); closeNav(); return }
      if (event.key !== 'Tab' || !takeoverNav.value || !navButton.value) return
      const elements = [navButton.value, ...takeoverNav.value.querySelectorAll<HTMLElement>(focusableSelector)]
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }

    let cursor: HTMLElement | null = null
    const onMouseMove = (event: MouseEvent) => {
      if (!cursor) return
      cursor.style.left = `${event.clientX}px`; cursor.style.top = `${event.clientY}px`; cursor.style.opacity = '1'
    }
    const onMouseOut = () => { if (cursor) cursor.style.opacity = '0' }
    onMounted(() => {
      document.addEventListener('keydown', onNavKeydown)
      if (window.matchMedia('(pointer: coarse)').matches) return
      cursor = document.querySelector('.custom-cursor')
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseout', onMouseOut)
    })
    onUnmounted(() => {
      document.removeEventListener('keydown', onNavKeydown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseout', onMouseOut)
    })

    const navLink = (item: { id: string; label: string; path: string }) => (
      <li key={item.id}><a href={item.path} onClick={(event: MouseEvent) => { event.preventDefault(); navigateTo(item.path) }}>{item.label}</a></li>
    )
    return () =>
      header.enabled && (
        <>
          <header id={header.id}>
            <div class="ahg-sticky-nav">
              <a class="ahg-nav-logo" href={header.logoLink} aria-label={header.logoAriaLabel} onClick={(event: MouseEvent) => { event.preventDefault(); navigateTo(header.logoLink) }}>
                <img src={site.logo.src} alt={site.logo.alt} />
              </a>
              <div ref={navButton} class={`ahg-nav-btn${navOpen.value ? ' open' : ''}`} onClick={toggleNav} role="button" tabindex={0} aria-expanded={navOpen.value} aria-controls="takeover-nav" aria-label={navOpen.value ? header.menuCloseLabel : header.menuOpenLabel} onKeydown={(event: KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleNav() } }}>
                <svg class="icon" viewBox="20 30 60 40"><path d={navOpen.value ? 'M35,35 L65,65 Z' : 'M30,37 L70,37 Z'} /><path d="M30,50 L70,50 Z" style={{ opacity: navOpen.value ? '0' : '1' }} /><path d={navOpen.value ? 'M35,65 L65,35 Z' : 'M30,63 L70,63 Z'} /></svg>
              </div>
            </div>
            <div ref={takeoverNav} id="takeover-nav" class={navOpen.value ? 'shown' : ''} aria-hidden={!navOpen.value} inert={!navOpen.value}>
              <div class="takeover-inner">
                <div class="nav-col nav-contact-col">
                  <div class="nav-bg-topo"></div>
                  <div class="nav-contact-inner">
                    <h2 class="ahg-nav-heading">{header.contactHeading}</h2>
                    <ul class="ahg-contact-list"><li><a href={header.contact.phoneHref}>{header.contact.phoneDisplay}</a></li><li><a href={`mailto:${header.contact.email}`}>{header.contact.email}</a></li><li><span>{header.contact.location}</span></li></ul>
                    <div class="ahg-social">{socialLinks.map((item, index) => <><a key={item.id} href={item.url}>{item.label}</a>{index < socialLinks.length - 1 && <span class="sep">|</span>}</>)}</div>
                  </div>
                </div>
                <div class="nav-col nav-menu-col"><ul class="ahg-nav-links">{navigation.map(navLink)}<li class="nav-divider"></li>{legalNavigation.map(navLink)}</ul></div>
              </div>
            </div>
          </header>
          <div class="custom-cursor" aria-hidden="true"></div>
        </>
      )
  },
})
