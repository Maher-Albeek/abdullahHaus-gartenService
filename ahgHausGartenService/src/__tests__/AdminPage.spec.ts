import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import AdminPage from '../pages/AdminPage.vue'
import { useWebsiteContentStore } from '../stores/websiteContent'

describe('AdminPage service modal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('opens the general panel by default without a live preview', () => {
    const wrapper = mount(AdminPage, { global: { plugins: [createPinia()] } })

    expect(wrapper.text()).not.toContain('Live-Vorschau')
    expect(wrapper.find('.preview-window').exists()).toBe(false)
    expect(wrapper.get('.admin-topbar h1').text()).toBe('General')
    expect(wrapper.find('.admin-order').exists()).toBe(true)
  })

  it('shows the signed-in user in the sidebar and logs out from the avatar card', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options) => {
      if (url === '/api/auth/session') {
        return new Response(JSON.stringify({
          user: { id: 'boss-1', email: 'boss@example.com', displayName: 'Maria Muster', role: 'boss' },
        }))
      }
      if (url === '/api/auth/logout' && options?.method === 'POST') return new Response(null, { status: 204 })
      if (url === '/api/messages') return new Response(JSON.stringify([]))
      return new Response(null, { status: 204 })
    })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/admin', component: AdminPage },
        { path: '/login', component: { template: '<div>Login</div>' } },
      ],
    })
    await router.push('/admin')
    await router.isReady()

    const wrapper = mount(AdminPage, { global: { plugins: [createPinia(), router] } })
    await flushPromises()

    expect(wrapper.get('.admin-user-avatar').text()).toBe('MM')
    expect(wrapper.get('.admin-user-details').text()).toContain('Maria Muster')
    expect(wrapper.get('.admin-user-details').text()).toContain('Boss')
    await wrapper.get('.admin-user-logout').trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
    expect(router.currentRoute.value.path).toBe('/login')
    wrapper.unmount()
    fetchMock.mockRestore()
  })

  it('restricts editor imports, exports, and ordering controls', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options) => {
      if (url === '/api/auth/session') {
        return new Response(JSON.stringify({ user: { id: 'editor-1', email: 'editor@example.com', displayName: 'Editor', role: 'editor' } }))
      }
      if (url === '/api/content' && options?.method === 'PUT') {
        return new Response(JSON.stringify({ success: true }))
      }
      return new Response(null, { status: 204 })
    })
    const wrapper = mount(AdminPage, { global: { plugins: [createPinia()] } })
    await flushPromises()

    expect(wrapper.find('.admin-order').exists()).toBe(false)
    expect(wrapper.find('.admin-notification-button').exists()).toBe(false)
    expect(wrapper.findAll('.admin-actions button').some((button) => button.text().includes('Import'))).toBe(false)
    expect(wrapper.findAll('.admin-actions button').some((button) => button.text().includes('Export'))).toBe(false)
    expect(wrapper.text()).not.toContain('Benutzer hinzufügen')

    const servicesNav = wrapper.findAll('.admin-section-nav button').find((button) => button.text().includes('Leistungen'))!
    await servicesNav.trigger('click')
    expect(wrapper.find('.admin-drag-handle').exists()).toBe(false)
    expect(wrapper.find('.admin-mobile-sort').exists()).toBe(false)

    wrapper.unmount()
    fetchMock.mockRestore()
  })

  it('does not allow owners to see the import button', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (url === '/api/auth/session') {
        return new Response(JSON.stringify({ user: { id: 'owner-1', email: 'owner@example.com', displayName: 'Owner', role: 'owner' } }))
      }
      if (url === '/api/users') return new Response(JSON.stringify([]))
      return new Response(null, { status: 204 })
    })
    const wrapper = mount(AdminPage, { global: { plugins: [createPinia()] } })
    await flushPromises()

    expect(wrapper.findAll('.admin-actions button').some((button) => button.text().includes('Import'))).toBe(false)

    wrapper.unmount()
    fetchMock.mockRestore()
  })

  it('restores the active admin panel after a reload', async () => {
    const firstWrapper = mount(AdminPage, { global: { plugins: [createPinia()] } })
    const servicesNav = firstWrapper
      .findAll('.admin-section-nav button')
      .find((button) => button.text().includes('Leistungen'))!
    await servicesNav.trigger('click')
    expect(localStorage.getItem('ahg-admin-active-panel')).toBe('services')
    firstWrapper.unmount()

    const secondWrapper = mount(AdminPage, { global: { plugins: [createPinia()] } })
    expect(secondWrapper.get('.admin-topbar h1').text()).toBe('Inhalte & Bereiche')
    expect(secondWrapper.get('.admin-section-nav button.active').text()).toContain('Leistungen')
    secondWrapper.unmount()
  })

  it('loads and displays saved contact messages in the messages panel', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options) => {
      if (url === '/api/messages') {
        return new Response(JSON.stringify([{
          id: 'message-1',
          name: 'Max Mustermann',
          email: 'max@example.com',
          service: 'Gartenpflege',
          message: 'Bitte um Rückruf.',
          createdAt: '2026-06-11T10:00:00.000Z',
          read: options?.method === 'PATCH',
        }]), { status: 200 })
      }
      return new Response(null, { status: 204 })
    })
    const wrapper = mount(AdminPage, { global: { plugins: [createPinia()] } })
    await flushPromises()
    expect(wrapper.get('.admin-unread-badge').text()).toBe('1')

    const messagesNav = wrapper
      .findAll('.admin-section-nav button')
      .find((button) => button.text().includes('Nachrichten'))!

    await messagesNav.trigger('click')
    await flushPromises()
    expect(localStorage.getItem('ahg-admin-active-panel')).toBe('messages')

    expect(wrapper.get('.admin-message').text()).toContain('Max Mustermann')
    expect(wrapper.find('.admin-message-body').exists()).toBe(false)
    expect(wrapper.get('.admin-message-stats').text()).toContain('Ungelesen')
    expect(wrapper.get('.admin-message-selection').text()).toContain('Alle auswählen')
    expect(wrapper.get('.admin-message-selection').text()).toContain('0 von 1')
    expect(wrapper.get('.admin-message-checkbox').attributes('aria-label')).toBe('Max Mustermann auswählen')
    const selectionCheckbox = wrapper.get<HTMLInputElement>('.admin-message-checkbox input')
    await selectionCheckbox.setValue(true)
    expect(wrapper.get('.admin-message-selection').text()).toContain('1 von 1')
    expect(wrapper.get('.admin-message-actions .admin-button.ghost').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('.admin-message-actions .admin-button.danger').attributes('disabled')).toBeUndefined()
    await wrapper.get('.admin-message-summary').trigger('click')
    await flushPromises()
    expect(localStorage.getItem('ahg-admin-active-panel')).toBe('messages')
    expect(wrapper.get('.admin-message-body').text()).toContain('Bitte um')
    expect(wrapper.find('.admin-unread-badge').exists()).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith('/api/messages?id=message-1', { method: 'PATCH' })
    expect(wrapper.find('.admin-notification-button').exists()).toBe(true)
    wrapper.unmount()
    fetchMock.mockRestore()
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
