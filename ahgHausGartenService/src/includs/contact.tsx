import { computed, defineComponent, ref, type PropType } from 'vue'
import { useWebsiteContentStore } from '../stores/websiteContent'

export type ContactFormData = {
  name: string
  email: string
  service: string
  message: string
}

export default defineComponent({
  name: 'ContactSection',
  props: {
    submitContact: {
      type: Function as PropType<(data: ContactFormData) => Promise<void>>,
      default: async () => undefined,
    },
  },
  setup(props) {
    const store = useWebsiteContentStore()
    const section = computed(() => store.content.sections.find((entry) => entry.id === 'contact'))
    const services = computed(() => store.content.sections.find((entry) => entry.id === 'services')?.items ?? [])
    const selectedService = ref('')
    const submissionState = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')

    const handleSubmit = async (event: Event) => {
      const form = event.currentTarget as HTMLFormElement
      const formData = new FormData(form)

      submissionState.value = 'submitting'

      try {
        await props.submitContact({
          name: String(formData.get('name') ?? ''),
          email: String(formData.get('email') ?? ''),
          service: String(formData.get('service') ?? ''),
          message: String(formData.get('message') ?? ''),
        })
        submissionState.value = 'success'
        form.reset()
        selectedService.value = ''
      } catch {
        submissionState.value = 'error'
      }
    }

    return () => (
      <section id="contact" class="py-20 px-4 bg-gray-50">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-10">
            <p class="section-kicker">{String(section.value?.content.kicker ?? '')}</p>
            <h2 class="content-heading">{String(section.value?.content.title ?? '')}</h2>
            <p class="content-intro mx-auto">{String(section.value?.content.intro ?? '')}</p>
          </div>
          <div class="contact-wrapper">
            {/* ── LEFT: form ── */}
            <div class="contact-content">
              <div class="contact-title">Kontakt</div>
              <form
                action="#"
                aria-busy={submissionState.value === 'submitting'}
                onSubmit={(event: Event) => {
                  event.preventDefault()
                  void handleSubmit(event)
                }}
              >
                {/* Name */}
                <div class="contact-field" style={{ marginTop: '0' }}>
                  <input
                    required
                    type="text"
                    id="contact-name"
                    name="name"
                    class="contact-input"
                    disabled={submissionState.value === 'submitting'}
                  />
                  <span class="contact-span">
                    <svg
                      viewBox="0 0 512 512"
                      width="50"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#595959"
                        d="M256 0c-74.439 0-135 60.561-135 135s60.561 135 135 135 135-60.561 135-135S330.439 0 256 0zM423.966 358.195C387.006 320.667 338.009 300 286 300h-60c-52.008 0-101.006 20.667-137.966 58.195C51.255 395.539 31 444.833 31 497c0 8.284 6.716 15 15 15h420c8.284 0 15-6.716 15-15 0-52.167-20.255-101.461-57.034-138.805z"
                      />
                    </svg>
                  </span>
                  <label for="contact-name" class="contact-label">
                    Ihr Name
                  </label>
                </div>

                {/* Email */}
                <div class="contact-field">
                  <input
                    required
                    type="email"
                    id="contact-email"
                    name="email"
                    class="contact-input"
                    disabled={submissionState.value === 'submitting'}
                  />
                  <span class="contact-span">
                    <svg
                      viewBox="0 0 512 512"
                      width="50"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#595959"
                        d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"
                      />
                    </svg>
                  </span>
                  <label for="contact-email" class="contact-label">
                    E-Mail
                  </label>
                </div>

                {/* Service */}
                <div class="contact-field">
                  <label for="contact-service" class="sr-only">
                    Dienstleistung auswählen
                  </label>
                  <select
                    id="contact-service"
                    name="service"
                    aria-label="Dienstleistung auswählen"
                    class="contact-select"
                    value={selectedService.value}
                    disabled={submissionState.value === 'submitting'}
                    onChange={(e: Event) => {
                      selectedService.value = (e.target as HTMLSelectElement).value
                    }}
                  >
                    <option value="">– Bitte wählen –</option>
                    {services.value.map((service) => {
                      const title = String(service.title ?? '')
                      return <option value={title}>{title}</option>
                    })}
                  </select>
                  <span class="contact-span">
                    <svg
                      viewBox="0 0 512 512"
                      width="50"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#595959"
                        d="M80 368H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm0-320H16A16 16 0 0 0 0 64v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16zm0 160H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm416 176H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"
                      />
                    </svg>
                  </span>
                </div>

                {/* Message */}
                <div class="contact-field-textarea">
                  <textarea
                    required
                    id="contact-message"
                    name="message"
                    class="contact-textarea"
                    rows={5}
                    disabled={submissionState.value === 'submitting'}
                  ></textarea>
                  <span class="contact-span">
                    <svg
                      viewBox="0 0 512 512"
                      width="50"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#595959"
                        d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32z"
                      />
                    </svg>
                  </span>
                  <label for="contact-message" class="contact-label">
                    Ihre Nachricht
                  </label>
                </div>

                {/* Privacy confirmation */}
                <label class="contact-privacy" for="contact-privacy">
                  <input
                    required
                    type="checkbox"
                    id="contact-privacy"
                    name="privacy"
                    class="contact-privacy-checkbox"
                    disabled={submissionState.value === 'submitting'}
                  />
                  <span>
                    Ich habe die{' '}
                    <a href="/datenschutz" class="contact-privacy-link">
                      Datenschutzerklärung
                    </a>{' '}
                    gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung meiner
                    Anfrage zu.
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  class="contact-button"
                  disabled={submissionState.value === 'submitting'}
                >
                  {submissionState.value === 'submitting' ? 'Wird gesendet ...' : String(section.value?.content.buttonLabel ?? 'Nachricht senden')}
                </button>

                {submissionState.value === 'success' && (
                  <p class="contact-status contact-status--success" role="status">
                    Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.
                  </p>
                )}
                {submissionState.value === 'error' && (
                  <p class="contact-status contact-status--error" role="alert">
                    Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.
                  </p>
                )}
              </form>
            </div>

            {/* ── RIGHT: info + map ── */}
            <div class="contact-info-panel">
              <div class="contact-info-card">
                <h3 class="contact-info-heading">Kontaktdaten</h3>

                <div class="contact-info-item">
                  <span class="contact-info-icon">
                    <svg
                      viewBox="0 0 512 512"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#4d8b23"
                        d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"
                      />
                    </svg>
                  </span>
                  <a href={`mailto:${store.content.contact.email}`} class="contact-info-link">
                    {store.content.contact.email}
                  </a>
                </div>

                <div class="contact-info-item">
                  <span class="contact-info-icon">
                    <svg
                      viewBox="0 0 512 512"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#4d8b23"
                        d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"
                      />
                    </svg>
                  </span>
                  <a href={`tel:+${store.content.contact.whatsapp}`} class="contact-info-link">
                    {store.content.contact.phone}
                  </a>
                </div>

                <div class="contact-info-item">
                  <span class="contact-info-icon">
                    <svg
                      viewBox="0 0 384 512"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#4d8b23"
                        d="M172.3 501.7C27 291 0 269.4 0 192 0 86 86 0 192 0s192 86 192 192c0 77.4-27 99-172.3 309.7-9.5 13.8-29.9 13.8-39.4 0zM192 272c44.2 0 80-35.8 80-80s-35.8-80-80-80-80 35.8-80 80 35.8 80 80 80z"
                      />
                    </svg>
                  </span>
                  <span class="contact-info-text">{store.content.contact.address}</span>
                </div>
              </div>

              <div class="contact-map">
                <iframe
                  title="Standort"
                  src="https://maps.google.com/maps?q=Ludwigsburger+Str.+49,+71332+Waiblingen&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowfullscreen
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
          {/* end contact-wrapper */}
        </div>
      </section>
    )
  },
})
