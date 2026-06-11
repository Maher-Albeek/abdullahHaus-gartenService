import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ContactSection, { type ContactFormData } from '../includs/contact'

const mountContact = (submitContact?: (data: ContactFormData) => Promise<void>) =>
  mount(ContactSection, {
    props: submitContact ? { submitContact } : undefined,
    global: { plugins: [createPinia()] },
  })

const fillAndSubmit = async (wrapper: VueWrapper) => {
  await wrapper.get<HTMLInputElement>('#contact-name').setValue('Max Mustermann')
  await wrapper.get<HTMLInputElement>('#contact-email').setValue('max@example.com')
  await wrapper.get<HTMLSelectElement>('#contact-service').setValue('Gartenpflege')
  await wrapper.get<HTMLTextAreaElement>('#contact-message').setValue('Bitte um Rückruf.')
  await wrapper.get<HTMLInputElement>('#contact-privacy').setValue(true)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('ContactSection', () => {
  it('shows the configured section kicker and title', () => {
    const wrapper = mountContact()

    expect(wrapper.get('.section-kicker').text()).toBe('Kontakt')
    expect(wrapper.get('.content-heading').text()).toBe('Wie können wir Ihnen helfen?')
  })

  it('requires privacy confirmation and links to the privacy policy', () => {
    const wrapper = mountContact()
    const privacyCheckbox = wrapper.get<HTMLInputElement>('#contact-privacy')

    expect(privacyCheckbox.attributes('required')).toBeDefined()
    expect(wrapper.get('.contact-privacy-link').attributes('href')).toBe('/datenschutz')
  })

  it('shows a success state and clears the form after submission', async () => {
    const submitContact = vi.fn<(data: ContactFormData) => Promise<void>>().mockResolvedValue()
    const wrapper = mountContact(submitContact)

    await fillAndSubmit(wrapper)

    expect(submitContact).toHaveBeenCalledWith({
      name: 'Max Mustermann',
      email: 'max@example.com',
      service: 'Gartenpflege',
      message: 'Bitte um Rückruf.',
    })
    expect(wrapper.get('[role="status"]').text()).toContain('erfolgreich gesendet')
    expect(wrapper.get<HTMLInputElement>('#contact-name').element.value).toBe('')
    expect(wrapper.get<HTMLInputElement>('#contact-privacy').element.checked).toBe(false)
  })

  it('shows an error state and preserves the form after a failed submission', async () => {
    const submitContact = vi
      .fn<(data: ContactFormData) => Promise<void>>()
      .mockRejectedValue(new Error())
    const wrapper = mountContact(submitContact)

    await fillAndSubmit(wrapper)

    expect(wrapper.get('[role="alert"]').text()).toContain('nicht gesendet')
    expect(wrapper.get<HTMLInputElement>('#contact-name').element.value).toBe('Max Mustermann')
  })
})
