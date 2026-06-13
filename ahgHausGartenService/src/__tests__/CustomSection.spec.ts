import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomSection from '../includs/CustomSection'

describe('CustomSection', () => {
  it('renders positioned cards and buttons from builder data', () => {
    const wrapper = mount(CustomSection, {
      props: {
        section: {
          id: 'custom-example',
          label: 'Example',
          description: '',
          enabled: true,
          content: { title: 'Custom title', kicker: 'Kicker', description: 'Intro', backgroundColor: '#ffffff' },
          items: [
            { type: 'card', title: 'Card title', description: 'Card text', x: 10, y: 40, width: 30 },
            { type: 'button', label: 'Contact', url: '#contact', x: 50, y: 70, width: 20 },
          ],
        },
      },
    })

    expect(wrapper.text()).toContain('Custom title')
    expect(wrapper.get('.custom-content-card').attributes('style')).toContain('left: 10%')
    expect(wrapper.get('.custom-content-button').attributes('href')).toBe('#contact')
  })
})
