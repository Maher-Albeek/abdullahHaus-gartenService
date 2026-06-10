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
})
