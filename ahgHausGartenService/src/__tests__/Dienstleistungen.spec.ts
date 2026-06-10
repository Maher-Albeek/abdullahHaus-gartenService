import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Dienstleistungen from '../includs/Dienstleistungen'
import { useWebsiteContentStore } from '../stores/websiteContent'

describe('DienstleistungenSection', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders services managed by the website content store', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWebsiteContentStore()
    const services = store.content.sections.find((section) => section.id === 'services')!
    services.items = [
      {
        title: 'Testleistung',
        desc: 'Aus dem Adminbereich',
        icon: 'fa-solid fa-wrench',
        details: 'Erster Punkt\nZweiter Punkt',
        grad: '#111111, #222222',
        featured: true,
      },
    ]

    const wrapper = mount(Dienstleistungen, { global: { plugins: [pinia] } })

    expect(wrapper.get('.card-title').text()).toBe('Testleistung')
    expect(wrapper.get('.card-content p').text()).toBe('Aus dem Adminbereich')
    expect(wrapper.findAll('.service-detail-list li')).toHaveLength(2)
    expect(wrapper.find('.card-badge').exists()).toBe(true)
  })

  it('does not render when the services section is disabled', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWebsiteContentStore()
    const services = store.content.sections.find((section) => section.id === 'services')!
    services.enabled = false

    const wrapper = mount(Dienstleistungen, { global: { plugins: [pinia] } })

    expect(wrapper.html()).toBe('')
  })
})
