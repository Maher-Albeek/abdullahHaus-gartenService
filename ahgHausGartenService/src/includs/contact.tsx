import { defineComponent, ref, type PropType } from 'vue'
import contact from '../data/contact.json'

export type ContactFormData = { name: string; email: string; service: string; message: string }

export default defineComponent({
  name: 'ContactSection',
  props: {
    submitContact: {
      type: Function as PropType<(data: ContactFormData) => Promise<void>>,
      default: async () => undefined,
    },
  },
  setup(props) {
    const selectedService = ref('')
    const submissionState = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
    const serviceOptions = contact.form.serviceOptions.filter((item) => item.enabled).sort((a, b) => a.order - b.order)

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

    const icon = (name: string) => <span class="contact-span"><i class={`fa-solid ${name}`} aria-hidden="true"></i></span>
    return () =>
      contact.enabled && (
        <section id={contact.id} class="py-20 px-4 bg-white">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-10"><p class="section-kicker">{contact.kicker}</p><h2 class="content-heading">{contact.heading}</h2></div>
            <p class="text-center mb-10 max-w-2xl mx-auto" style={{ color: '#444447', fontSize: '1.1rem' }}>{contact.intro}</p>
            <div class="contact-wrapper">
              <div class="contact-content">
                <div class="contact-title">{contact.form.title}</div>
                <form action={contact.form.action} aria-busy={submissionState.value === 'submitting'} onSubmit={(event: Event) => { event.preventDefault(); void handleSubmit(event) }}>
                  <div class="contact-field" style={{ marginTop: '0' }}>
                    <input required type="text" id="contact-name" name="name" class="contact-input" disabled={submissionState.value === 'submitting'} />
                    {icon('fa-user')}<label for="contact-name" class="contact-label">{contact.form.fields.nameLabel}</label>
                  </div>
                  <div class="contact-field">
                    <input required type="email" id="contact-email" name="email" class="contact-input" disabled={submissionState.value === 'submitting'} />
                    {icon('fa-envelope')}<label for="contact-email" class="contact-label">{contact.form.fields.emailLabel}</label>
                  </div>
                  <div class="contact-field">
                    <label for="contact-service" class="sr-only">{contact.form.fields.serviceLabel}</label>
                    <select id="contact-service" name="service" aria-label={contact.form.fields.serviceLabel} class="contact-select" value={selectedService.value} disabled={submissionState.value === 'submitting'} onChange={(event: Event) => { selectedService.value = (event.target as HTMLSelectElement).value }}>
                      <option value="">{contact.form.fields.servicePlaceholder}</option>
                      {serviceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    {icon('fa-list')}
                  </div>
                  <div class="contact-field-textarea">
                    <textarea required id="contact-message" name="message" class="contact-textarea" rows={5} disabled={submissionState.value === 'submitting'}></textarea>
                    {icon('fa-comment')}<label for="contact-message" class="contact-label">{contact.form.fields.messageLabel}</label>
                  </div>
                  <label class="contact-privacy" for="contact-privacy">
                    <input required type="checkbox" id="contact-privacy" name="privacy" class="contact-privacy-checkbox" disabled={submissionState.value === 'submitting'} />
                    <span>{contact.form.privacyText} <a href={contact.form.privacyLink} class="contact-privacy-link">Datenschutzerklärung</a></span>
                  </label>
                  <button type="submit" class="contact-button" disabled={submissionState.value === 'submitting'}>{submissionState.value === 'submitting' ? contact.form.submittingLabel : contact.form.submitLabel}</button>
                  {submissionState.value === 'success' && <p class="contact-status contact-status--success" role="status">{contact.form.successMessage}</p>}
                  {submissionState.value === 'error' && <p class="contact-status contact-status--error" role="alert">{contact.form.errorMessage}</p>}
                </form>
              </div>
              <div class="contact-info-panel">
                <div class="contact-info-card">
                  <h3 class="contact-info-heading">{contact.contactCard.heading}</h3>
                  <div class="contact-info-item"><span class="contact-info-icon"><i class="fa-solid fa-envelope"></i></span><a href={`mailto:${contact.contactCard.email}`} class="contact-info-link">{contact.contactCard.email}</a></div>
                  <div class="contact-info-item"><span class="contact-info-icon"><i class="fa-solid fa-phone"></i></span><a href={contact.contactCard.phoneHref} class="contact-info-link">{contact.contactCard.phoneDisplay}</a></div>
                  <div class="contact-info-item"><span class="contact-info-icon"><i class="fa-solid fa-location-dot"></i></span><span class="contact-info-text">{contact.contactCard.address}</span></div>
                </div>
                <div class="contact-map"><iframe title={contact.map.title} src={contact.map.embedUrl} width="100%" height="100%" style={{ border: 0 }} allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" /></div>
              </div>
            </div>
          </div>
        </section>
      )
  },
})
