import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import footer from '../data/footer.json'
import site from '../data/site.json'
import { useCookieConsentStore } from '../stores/cookieConsent'

export default defineComponent({
  name: 'FooterSection',
  setup() {
    const cookieStore = useCookieConsentStore()
    const navigation = footer.navigation.filter((item) => item.enabled).sort((a, b) => a.order - b.order)
    const legalLinks = footer.legalLinks.filter((item) => item.enabled).sort((a, b) => a.order - b.order)
    return () =>
      footer.enabled && (
        <footer id={footer.id} class="bg-brand-dark text-white pt-12 pb-6">
          <div class="max-w-6xl mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div><img src={site.logo.src} alt={site.logo.alt} class="h-12 mb-4" /><p class="text-sm opacity-75 leading-relaxed">{footer.brandText}</p></div>
              <div>
                <h3 class="text-base font-semibold mb-4 tracking-wide uppercase opacity-90">{footer.contactHeading}</h3>
                <ul class="space-y-2 text-sm opacity-75">
                  <li><a href={footer.contact.phoneHref} class="hover:opacity-100 transition-opacity">{footer.contact.phoneDisplay}</a></li>
                  <li><a href={`mailto:${footer.contact.email}`} class="hover:opacity-100 transition-opacity">{footer.contact.email}</a></li>
                  <li>{footer.contact.address}</li>
                </ul>
              </div>
              <div>
                <h3 class="text-base font-semibold mb-4 tracking-wide uppercase opacity-90">{footer.navigationHeading}</h3>
                <ul class="space-y-2 text-sm opacity-75">{navigation.map((item) => <li key={item.id}><RouterLink to={item.path} class="hover:opacity-100 transition-opacity">{item.label}</RouterLink></li>)}</ul>
              </div>
            </div>
            <div class="border-t border-white/20 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs opacity-60">
              <span>&copy; {new Date().getFullYear()} {footer.copyrightOwner}. {footer.copyrightText}</span>
              <div class="mt-4 text-center text-xs opacity-40">{footer.creatorCredit}</div>
              <div class="flex gap-5">
                {legalLinks.map((item) => item.action === 'openCookieSettings'
                  ? <button key={item.id} type="button" onClick={cookieStore.openSettings} class="hover:opacity-100 transition-opacity cursor-pointer">{item.label}</button>
                  : <RouterLink key={item.id} to={item.path ?? '/'} class="hover:opacity-100 transition-opacity">{item.label}</RouterLink>)}
              </div>
            </div>
          </div>
        </footer>
      )
  },
})
