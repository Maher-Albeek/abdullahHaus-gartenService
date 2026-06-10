import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '../App.vue'

describe('App', () => {
  it('renders the mobile call and WhatsApp actions', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
        stubs: ['RouterView', 'RouterLink'],
      },
    })

    expect(wrapper.get('a[href="tel:+4917632093451"]').text()).toContain('Anrufen')
    expect(wrapper.get('a[href="https://wa.me/4917632093451"]').text()).toContain('WhatsApp')
  })
})
