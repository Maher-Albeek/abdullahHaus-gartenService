import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import Header from '../includs/header'

let wrapper: VueWrapper

const mountHeader = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  })
  await router.push('/')
  await router.isReady()

  wrapper = mount(Header, {
    attachTo: document.body,
    global: { plugins: [createPinia(), router] },
  })
}

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: true }),
  )
})

afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
})

describe('Header menu keyboard behavior', () => {
  it('moves focus into the menu and closes with Escape', async () => {
    await mountHeader()
    const toggle = wrapper.get('.ahg-nav-btn')

    await toggle.trigger('click')

    expect(document.activeElement).toBe(wrapper.get('#takeover-nav a').element)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.get('#takeover-nav').classes()).not.toContain('shown')
    expect(document.activeElement).toBe(toggle.element)
  })

  it('wraps focus in both directions', async () => {
    await mountHeader()
    const toggle = wrapper.get('.ahg-nav-btn')

    await toggle.trigger('click')
    const menuLinks = wrapper.findAll('#takeover-nav a')
    const lastLink = menuLinks[menuLinks.length - 1]!

    ;(lastLink.element as HTMLElement).focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(toggle.element)

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    )
    expect(document.activeElement).toBe(lastLink.element)
  })
})
