import { defineComponent, Transition } from 'vue'
import { RouterLink } from 'vue-router'
import { useCookieConsentStore } from '../stores/cookieConsent'

/* ------------------------------------------------------------------ */
/*  Cookie category metadata                                            */
/* ------------------------------------------------------------------ */
const categories = [
  {
    key: 'necessary' as const,
    label: 'Notwendige Cookies',
    alwaysOn: true,
    description:
      'Diese Cookies sind für den technischen Betrieb der Website unbedingt erforderlich. Sie ermöglichen grundlegende Funktionen wie Seitennavigation und Sicherheitsfeatures.',
    examples: 'Sitzungs-ID, CSRF-Schutz',
    duration: 'Sitzung / max. 1 Jahr',
    provider: 'AHG Haus-Gartenservice',
  },
  {
    key: 'functional' as const,
    label: 'Funktionale Cookies',
    alwaysOn: false,
    description:
      'Diese Cookies ermöglichen erweiterte Funktionalitäten und Personalisierung, wie gespeicherte Spracheinstellungen oder Formulardaten.',
    examples: 'Sprachpräferenz, Formular-Zwischenspeicher',
    duration: 'bis zu 1 Jahr',
    provider: 'AHG Haus-Gartenservice',
  },
  {
    key: 'statistics' as const,
    label: 'Statistik-Cookies',
    alwaysOn: false,
    description:
      'Diese Cookies helfen uns, die Nutzung der Website zu verstehen. Alle Daten werden anonymisiert erhoben und dienen ausschließlich der Verbesserung unseres Angebots.',
    examples: 'Seitenaufrufe, Verweildauer, Herkunft des Besuchs',
    duration: 'bis zu 2 Jahre',
    provider: 'Analyse-Dienst (anonymisiert)',
  },
  {
    key: 'marketing' as const,
    label: 'Marketing-Cookies',
    alwaysOn: false,
    description:
      'Diese Cookies werden genutzt, um Ihnen personalisierte Werbung anzuzeigen und die Effektivität von Werbekampagnen zu messen.',
    examples: 'Werbe-IDs, Retargeting-Pixel',
    duration: 'bis zu 2 Jahre',
    provider: 'Werbepartner',
  },
]

/* ------------------------------------------------------------------ */
/*  Toggle switch                                                       */
/* ------------------------------------------------------------------ */
const Toggle = defineComponent({
  props: {
    modelValue: { type: Boolean, required: true },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => (
      <button
        type="button"
        role="switch"
        aria-checked={props.modelValue}
        disabled={props.disabled}
        onClick={() => !props.disabled && emit('update:modelValue', !props.modelValue)}
        class={[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2',
          props.disabled
            ? 'cursor-not-allowed bg-brand-green/60'
            : props.modelValue
              ? 'cursor-pointer bg-brand-green'
              : 'cursor-pointer bg-gray-300',
        ]}
      >
        <span
          class={[
            'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
            props.modelValue ? 'translate-x-6' : 'translate-x-1',
          ]}
        />
      </button>
    )
  },
})

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */
export default defineComponent({
  name: 'CookieConsent',
  setup() {
    const store = useCookieConsentStore()

    /* ---- Settings panel ------------------------------------------ */
    const SettingsPanel = () => (
      <div class="mt-4 space-y-3">
        {categories.map((cat) => (
          <div key={cat.key} class="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-semibold text-gray-900">{cat.label}</span>
                  {cat.alwaysOn && (
                    <span class="text-xs bg-brand-green/10 text-brand-green font-medium px-2 py-0.5 rounded-full">
                      Immer aktiv
                    </span>
                  )}
                </div>
                <p class="text-xs text-gray-600 leading-relaxed mb-2">{cat.description}</p>
                <dl class="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-gray-500">
                  <dt class="font-medium">Beispiele:</dt>
                  <dd>{cat.examples}</dd>
                  <dt class="font-medium">Speicherdauer:</dt>
                  <dd>{cat.duration}</dd>
                  <dt class="font-medium">Anbieter:</dt>
                  <dd>{cat.provider}</dd>
                </dl>
              </div>
              <div class="shrink-0 pt-0.5">
                <Toggle
                  modelValue={cat.alwaysOn || store.preferences[cat.key]}
                  disabled={cat.alwaysOn}
                  onUpdate:modelValue={(v: boolean) => {
                    if (!cat.alwaysOn) {
                      store.preferences[cat.key] = v as never
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Legal notice */}
        <p class="text-xs text-gray-500 leading-relaxed pt-1">
          Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO i. V. m. § 25 TTDSG. Ihre Einwilligung ist
          freiwillig und kann jederzeit widerrufen werden. Der Widerruf berührt nicht die
          Rechtmäßigkeit der bis dahin erfolgten Verarbeitung.
        </p>
      </div>
    )

    /* ---- Banner --------------------------------------------------- */
    return () => (
      <>
        {/* Fixed cookie FAB – always visible once consent was given */}
        <Transition
          enterActiveClass="transition duration-300 ease-out"
          enterFromClass="opacity-0 scale-75"
          enterToClass="opacity-100 scale-100"
          leaveActiveClass="transition duration-200 ease-in"
          leaveFromClass="opacity-100 scale-100"
          leaveToClass="opacity-0 scale-75"
        >
          {store.decided && !store.showBanner && (
            <button
              type="button"
              aria-label="Cookie-Einstellungen öffnen"
              onClick={store.openSettings}
              class="cookie-settings-fab fixed bottom-5 left-5 z-9998 flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark shadow-lg ring-1 ring-white/10 hover:bg-brand-dark/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green transition-colors group"
              title="Cookie-Einstellungen"
            >
              {/* Cookie SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                class="h-6 w-6 text-brand-green group-hover:scale-110 transition-transform"
                fill="currentColor"
                aria-hidden="true"
              >
                {/* Cookie circle */}
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-width="4" />
                {/* Bite */}
                <path d="M44 14 Q56 20 58 34 Q50 28 44 14Z" fill="currentColor" opacity="0.3" />
                {/* Chips */}
                <circle cx="22" cy="24" r="3" />
                <circle cx="34" cy="20" r="2.5" />
                <circle cx="20" cy="38" r="3" />
                <circle cx="33" cy="36" r="2" />
                <circle cx="28" cy="46" r="2.5" />
                <circle cx="42" cy="38" r="2.5" />
                <circle cx="40" cy="28" r="2" />
              </svg>
            </button>
          )}
        </Transition>

        {/* Banner */}
        <Transition
          enterActiveClass="transition duration-300 ease-out"
          enterFromClass="opacity-0 translate-y-4"
          enterToClass="opacity-100 translate-y-0"
          leaveActiveClass="transition duration-200 ease-in"
          leaveFromClass="opacity-100 translate-y-0"
          leaveToClass="opacity-0 translate-y-4"
        >
          {store.showBanner && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Cookie-Einstellungen"
              class="fixed bottom-0 left-0 right-0 z-9999 p-4 md:p-6"
            >
              <div class="mx-auto max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div class="bg-brand-dark px-6 py-4 flex items-center gap-3">
                  <svg
                    class="h-6 w-6 text-brand-green shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-1.849-.42-3.6-1.168-5.168"
                    />
                  </svg>
                  <h2 class="text-white font-semibold text-base flex-1">Cookie-Einstellungen</h2>
                  {store.decided && (
                    <button
                      type="button"
                      aria-label="Schließen"
                      onClick={() => {
                        store.showBanner = false
                        store.showSettings = false
                      }}
                      class="ml-auto flex items-center justify-center h-8 w-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green transition-colors"
                    >
                      <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Body */}
                <div class="px-6 py-5 max-h-[60vh] overflow-y-auto">
                  <p class="text-sm text-gray-700 leading-relaxed">
                    Wir verwenden Cookies und ähnliche Technologien gemäß <strong>DSGVO</strong> und{' '}
                    <strong>§ 25 TTDSG</strong>. Notwendige Cookies werden ohne Einwilligung gesetzt
                    (Art. 6 Abs. 1 lit. f DSGVO). Für alle weiteren Cookies benötigen wir Ihre
                    ausdrückliche Einwilligung. Sie können Ihre Auswahl jederzeit in unserer{' '}
                    <RouterLink
                      to="/datenschutz"
                      class="text-brand-green underline underline-offset-2 hover:no-underline"
                      onClick={() => {
                        store.showBanner = false
                      }}
                    >
                      Datenschutzerklärung
                    </RouterLink>{' '}
                    widerrufen.
                  </p>

                  {store.showSettings && <SettingsPanel />}
                </div>

                {/* Footer / Buttons */}
                <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
                  {/* Accept All – primary CTA */}
                  <button
                    type="button"
                    onClick={store.acceptAll}
                    class="flex-1 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-green/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 transition-colors"
                  >
                    Alle akzeptieren
                  </button>

                  {/* Reject All – equal prominence */}
                  <button
                    type="button"
                    onClick={store.rejectAll}
                    class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-colors"
                  >
                    Nur notwendige
                  </button>

                  {/* Settings / Save toggle */}
                  {!store.showSettings ? (
                    <button
                      type="button"
                      onClick={() => (store.showSettings = true)}
                      class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-colors"
                    >
                      Einstellungen
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={store.saveSelection}
                      class="flex-1 rounded-lg border border-brand-green bg-brand-green/10 px-4 py-2.5 text-sm font-semibold text-brand-green hover:bg-brand-green/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 transition-colors"
                    >
                      Auswahl speichern
                    </button>
                  )}
                </div>

                {/* Legal links */}
                <div class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
                  <RouterLink
                    to="/impressum"
                    class="hover:text-gray-600 transition-colors"
                    onClick={() => {
                      store.showBanner = false
                    }}
                  >
                    Impressum
                  </RouterLink>
                  <RouterLink
                    to="/datenschutz"
                    class="hover:text-gray-600 transition-colors"
                    onClick={() => {
                      store.showBanner = false
                    }}
                  >
                    Datenschutzerklärung
                  </RouterLink>
                </div>
              </div>
            </div>
          )}
        </Transition>
      </>
    )
  },
})
