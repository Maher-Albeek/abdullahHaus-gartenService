import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from '../pages/LoginPage.vue'

const replace = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ replace }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    replace.mockReset()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('logs in and redirects to admin', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ user: { email: 'admin@example.com' } }), { status: 200 }))
    const wrapper = mount(LoginPage)

    await wrapper.get('input[type="email"]').setValue('admin@example.com')
    await wrapper.get('input[type="password"]').setValue('secret-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }))
    expect(replace).toHaveBeenCalledWith('/admin')
  })

  it('shows invalid credential errors', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ message: 'Invalid email or password.' }), { status: 401 }))
    const wrapper = mount(LoginPage)

    await wrapper.get('input[type="email"]').setValue('admin@example.com')
    await wrapper.get('input[type="password"]').setValue('wrong-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Invalid email or password.')
  })
})
