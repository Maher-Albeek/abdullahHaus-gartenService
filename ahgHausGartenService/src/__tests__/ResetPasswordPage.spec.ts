import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ResetPasswordPage from '../pages/ResetPasswordPage.vue'

const replace = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: { token: 'reset-token' } }),
  useRouter: () => ({ replace }),
}))

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    replace.mockReset()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('requires matching new passwords', async () => {
    const wrapper = mount(ResetPasswordPage)
    const inputs = wrapper.findAll('input[type="password"]')

    await inputs[0]!.setValue('StrongPassword1')
    await inputs[1]!.setValue('DifferentPassword2')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('[role="alert"]').text()).toBe('Die Passwörter stimmen nicht überein.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows completed password requirements and rejects weak passwords', async () => {
    const wrapper = mount(ResetPasswordPage)
    const inputs = wrapper.findAll('input[type="password"]')

    await inputs[0]!.setValue('short')
    await inputs[1]!.setValue('short')

    expect(wrapper.findAll('.password-requirements li.valid')).toHaveLength(1)
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('[role="alert"]').text()).toBe('Das neue Passwort erfüllt nicht alle Anforderungen.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('submits a matching strong password', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }))
    const wrapper = mount(ResetPasswordPage)
    const inputs = wrapper.findAll('input[type="password"]')

    await inputs[0]!.setValue('StrongPassword1')
    await inputs[1]!.setValue('StrongPassword1')

    expect(wrapper.findAll('.password-requirements li.valid')).toHaveLength(4)
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ token: 'reset-token', password: 'StrongPassword1' }),
    }))
  })
})
