import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AdminPage from '../pages/AdminPage.vue'
import { useWebsiteContentStore } from '../stores/websiteContent'

describe('AdminPage service modal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds a service only after submitting the complete modal form', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWebsiteContentStore()
    const services = store.content.sections.find((section) => section.id === 'services')!
    const originalCount = services.items.length
    const wrapper = mount(AdminPage, { global: { plugins: [pinia] } })

    const servicesNav = wrapper
      .findAll('.admin-section-nav button')
      .find((button) => button.text().includes('Leistungen'))!
    await servicesNav.trigger('click')
    await wrapper.get('.admin-card-header.compact .admin-button.soft').trigger('click')

    expect(wrapper.find('.admin-modal').exists()).toBe(true)
    expect(services.items).toHaveLength(originalCount)

    await wrapper.get('.admin-modal input[placeholder="Name der Dienstleistung"]').setValue('Testservice')
    await wrapper.get('.admin-modal textarea[placeholder="Kurze Beschreibung der Dienstleistung"]').setValue('Beschreibung')
    await wrapper.get('.admin-modal').trigger('submit')

    expect(wrapper.find('.admin-modal').exists()).toBe(false)
    expect(services.items).toHaveLength(originalCount + 1)
    expect(services.items[services.items.length - 1]?.title).toBe('Testservice')
  })

  it('applies existing service edits only after saving and restores them on cancel', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWebsiteContentStore()
    const services = store.content.sections.find((section) => section.id === 'services')!
    const originalTitle = services.items[0]?.title
    const wrapper = mount(AdminPage, { global: { plugins: [pinia] } })

    const servicesNav = wrapper
      .findAll('.admin-section-nav button')
      .find((button) => button.text().includes('Leistungen'))!
    await servicesNav.trigger('click')

    const firstCard = wrapper.get('.admin-items details:first-child')
    const titleInput = firstCard.get<HTMLInputElement>('.admin-item-body input[type="text"]')
    await titleInput.setValue('Noch nicht gespeichert')

    expect(services.items[0]?.title).toBe(originalTitle)

    await firstCard.get('.admin-item-actions .admin-button.ghost').trigger('click')
    expect(firstCard.get<HTMLInputElement>('.admin-item-body input[type="text"]').element.value).toBe(originalTitle)
    expect(services.items[0]?.title).toBe(originalTitle)

    await firstCard.get<HTMLInputElement>('.admin-item-body input[type="text"]').setValue('Gespeicherter Titel')
    await firstCard.get('.admin-item-actions .admin-button.primary').trigger('click')

    expect(services.items[0]?.title).toBe('Gespeicherter Titel')
  })

  it('sorts service cards by dragging their handles', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWebsiteContentStore()
    const services = store.content.sections.find((section) => section.id === 'services')!
    const firstTitle = services.items[0]?.title
    const secondTitle = services.items[1]?.title
    const wrapper = mount(AdminPage, { global: { plugins: [pinia] } })

    const servicesNav = wrapper
      .findAll('.admin-section-nav button')
      .find((button) => button.text().includes('Leistungen'))!
    await servicesNav.trigger('click')

    const cards = wrapper.findAll('.admin-items details')
    await cards[0]!.get('.admin-drag-handle').trigger('dragstart')
    await cards[1]!.trigger('drop')

    expect(services.items[0]?.title).toBe(secondTitle)
    expect(services.items[1]?.title).toBe(firstTitle)
  })

  it('sorts service cards with the mobile reorder buttons', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWebsiteContentStore()
    const services = store.content.sections.find((section) => section.id === 'services')!
    const firstTitle = services.items[0]?.title
    const secondTitle = services.items[1]?.title
    const wrapper = mount(AdminPage, { global: { plugins: [pinia] } })

    const servicesNav = wrapper
      .findAll('.admin-section-nav button')
      .find((button) => button.text().includes('Leistungen'))!
    await servicesNav.trigger('click')

    const secondCard = wrapper.findAll('.admin-items details')[1]!
    await secondCard.get('[aria-label="Dienstleistung nach oben verschieben"]').trigger('click')

    expect(services.items[0]?.title).toBe(secondTitle)
    expect(services.items[1]?.title).toBe(firstTitle)
  })

  it('adds benefits and concerns from the benefits admin section', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWebsiteContentStore()
    const benefits = store.content.sections.find((section) => section.id === 'benefits')!
    const wrapper = mount(AdminPage, { global: { plugins: [pinia] } })

    const benefitsNav = wrapper
      .findAll('.admin-section-nav button')
      .find((button) => button.text().includes('Vorteile'))!
    await benefitsNav.trigger('click')

    const benefitGroup = wrapper.get('[data-content-group="benefit"]')
    const concernGroup = wrapper.get('[data-content-group="concern"]')
    expect(benefitGroup.get('.admin-card-header h2').text()).toBe('Vorteile')
    expect(concernGroup.get('.admin-card-header h2').text()).toBe('Anliegen')
    expect(benefitGroup.findAll('.admin-group-content label')).toHaveLength(3)
    expect(concernGroup.findAll('.admin-group-content label')).toHaveLength(4)

    await benefitGroup.get('.admin-card-header .admin-button.soft').trigger('click')
    await concernGroup.get('.admin-card-header .admin-button.soft').trigger('click')

    expect(benefits.items[benefits.items.length - 2]?.kind).toBe('benefit')
    expect(benefits.items[benefits.items.length - 1]?.kind).toBe('concern')
  })

  it('keeps benefit type fixed while saving icon edits and restoring drafts on cancel', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWebsiteContentStore()
    const benefits = store.content.sections.find((section) => section.id === 'benefits')!
    const originalTitle = benefits.items[0]?.title
    const originalIcon = benefits.items[0]?.icon
    const wrapper = mount(AdminPage, { global: { plugins: [pinia] } })

    const benefitsNav = wrapper
      .findAll('.admin-section-nav button')
      .find((button) => button.text().includes('Vorteile'))!
    await benefitsNav.trigger('click')

    const firstCard = wrapper.get('[data-content-group="benefit"] .admin-items details:first-child')
    expect(firstCard.find('select').exists()).toBe(false)
    expect(firstCard.text()).not.toContain('Art')

    await firstCard.get<HTMLInputElement>('.admin-item-body input[type="text"]').setValue('Entwurf')
    await firstCard.get('.admin-icon-select').trigger('click')
    await firstCard.get('[aria-label="Planung auswählen"]').trigger('click')

    expect(benefits.items[0]?.title).toBe(originalTitle)
    expect(benefits.items[0]?.icon).toBe(originalIcon)

    await firstCard.get('.admin-item-actions .admin-button.ghost').trigger('click')
    expect(firstCard.get<HTMLInputElement>('.admin-item-body input[type="text"]').element.value).toBe(originalTitle)

    const firstDraft = (wrapper.vm as unknown as { benefitDrafts: Array<Record<string, unknown>> }).benefitDrafts[0]!
    firstDraft.kind = 'concern'
    await firstCard.get('.admin-item-actions .admin-button.primary').trigger('click')

    expect(benefits.items[0]?.kind).toBe('benefit')
  })

  it('sorts benefits by dragging without moving them into the concerns group', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWebsiteContentStore()
    const section = store.content.sections.find((entry) => entry.id === 'benefits')!
    const originalBenefits = section.items.filter((item) => item.kind === 'benefit').map((item) => item.title)
    const originalConcerns = section.items.filter((item) => item.kind === 'concern').map((item) => item.question)
    const wrapper = mount(AdminPage, { global: { plugins: [pinia] } })

    const benefitsNav = wrapper
      .findAll('.admin-section-nav button')
      .find((button) => button.text().includes('Vorteile'))!
    await benefitsNav.trigger('click')

    const benefitCards = wrapper.findAll('[data-content-group="benefit"] .admin-items details')
    await benefitCards[0]!.get('[aria-label="Vorteil verschieben"]').trigger('dragstart')
    await benefitCards[1]!.trigger('drop')

    expect(section.items.filter((item) => item.kind === 'benefit').map((item) => item.title)).toEqual([
      originalBenefits[1],
      originalBenefits[0],
      ...originalBenefits.slice(2),
    ])
    expect(section.items.filter((item) => item.kind === 'concern').map((item) => item.question)).toEqual(originalConcerns)
  })

  it('uses a native file label to open the gallery image picker', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(AdminPage, { global: { plugins: [pinia] } })

    const galleryNav = wrapper
      .findAll('.admin-section-nav button')
      .find((button) => button.text().includes('Galerie'))!
    await galleryNav.trigger('click')

    const picker = wrapper.get('label.admin-gallery-picker')
    const input = picker.get<HTMLInputElement>('input[type="file"]')
    expect(picker.text()).toContain('Bilder auswählen')
    expect(input.attributes('hidden')).toBeUndefined()
    expect(input.attributes('accept')).toBe('image/*')
    expect(input.attributes('multiple')).toBeDefined()
  })

  it('shows a two-image AVIF drop zone and thumbnail for the about section', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(AdminPage, { global: { plugins: [pinia] } })

    const aboutNav = wrapper
      .findAll('.admin-section-nav button')
      .find((button) => button.text().includes('ber uns'))!
    await aboutNav.trigger('click')

    const upload = wrapper.get('.admin-about-image')
    const input = upload.get<HTMLInputElement>('input[type="file"]')
    expect(upload.text()).toContain('AVIF')
    expect(input.attributes('accept')).toBe('image/*')
    expect(input.attributes('multiple')).toBeDefined()
    expect(upload.text()).toContain('Maximal zwei Bilder')
    expect(upload.get('.admin-about-thumbnail').attributes('src')).toBe('/about.jpg')
  })
})
