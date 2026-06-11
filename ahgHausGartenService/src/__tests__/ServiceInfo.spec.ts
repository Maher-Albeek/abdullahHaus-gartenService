import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ServiceInfo from '../includs/ServiceInfo'
import { useWebsiteContentStore } from '../stores/websiteContent'

describe('ServiceInfo', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders benefit and concern content from the website content store', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWebsiteContentStore()
    const section = store.content.sections.find((entry) => entry.id === 'benefits')!
    const wrapper = mount(ServiceInfo, { global: { plugins: [pinia] } })

    section.items[0]!.title = 'Bearbeiteter Vorteil'
    section.items.find((item) => item.kind === 'concern')!.question = 'Bearbeitetes Anliegen?'
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Bearbeiteter Vorteil')
    expect(wrapper.text()).toContain('Bearbeitetes Anliegen?')
  })

  it('hides the section when it is disabled in the admin content', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWebsiteContentStore()
    const section = store.content.sections.find((entry) => entry.id === 'benefits')!
    const wrapper = mount(ServiceInfo, { global: { plugins: [pinia] } })

    section.enabled = false
    await wrapper.vm.$nextTick()

    expect(wrapper.find('#vorteile').exists()).toBe(false)
  })
})
