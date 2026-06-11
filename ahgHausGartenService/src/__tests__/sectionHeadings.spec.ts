import { describe, expect, it } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import FeedbacksSection from '../includs/Feedbacks'
import GallerySection from '../includs/gallery'

describe('section headings', () => {
  it('shows the configured gallery kicker and title', () => {
    const wrapper = shallowMount(GallerySection, {
      global: { plugins: [createPinia()] },
    })

    expect(wrapper.get('.section-kicker').text()).toBe('Referenzen')
    expect(wrapper.get('.content-heading').text()).toBe('Einblicke in unsere Arbeit')
  })

  it('shows the configured Bewertungen kicker and title', () => {
    const wrapper = mount(FeedbacksSection, {
      global: { plugins: [createPinia()] },
    })

    expect(wrapper.get('.section-kicker').text()).toBe('Kundenstimmen')
    expect(wrapper.get('.content-heading').text()).toBe('Was unsere Kunden sagen')
  })
})
