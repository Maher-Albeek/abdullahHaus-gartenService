import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import UsersPanel from '../component/UsersPanel.vue'

describe('UsersPanel password validation', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url === '/api/auth/session') {
        return new Response(JSON.stringify({ user: { id: '1', email: 'boss@example.com', displayName: 'Boss', role: 'boss' } }))
      }
      return new Response(JSON.stringify(url === '/api/users' ? [] : { success: true }))
    }))
  })

  it('requires a strong matching password before changing the current password', async () => {
    const wrapper = mount(UsersPanel, { props: { canManage: false } })
    await flushPromises()
    const form = wrapper.findAll('.users-form').find((entry) => entry.find('input[autocomplete="current-password"]').exists())!
    const submit = form.get('button[type="submit"]')

    expect(submit.attributes('disabled')).toBeDefined()
    await form.get('input[autocomplete="current-password"]').setValue('CurrentPassword1')
    await form.findAll('input[autocomplete="new-password"]')[0]!.setValue('StrongPassword1')
    expect(form.findAll('.users-password-requirements li.valid')).toHaveLength(4)
    expect(submit.attributes('disabled')).toBeDefined()

    await form.findAll('input[autocomplete="new-password"]')[1]!.setValue('StrongPassword1')
    expect(form.get('.users-password-match').classes()).toContain('valid')
    expect(submit.attributes('disabled')).toBeUndefined()
  })

  it('requires a strong matching start password before creating a user', async () => {
    const wrapper = mount(UsersPanel, { props: { canManage: true } })
    await flushPromises()
    const form = wrapper.findAll('.users-form')[2]!
    const passwordInputs = form.findAll('input[autocomplete="new-password"]')
    const submit = form.get('button[type="submit"]')

    await form.get('input[placeholder="Name"]').setValue('New User')
    await form.get('input[type="email"]').setValue('new@example.com')
    await passwordInputs[0]!.setValue('Invalid password1')
    await passwordInputs[1]!.setValue('Invalid password1')
    expect(form.findAll('.users-password-requirements li.valid')).toHaveLength(3)
    expect(submit.attributes('disabled')).toBeDefined()

    await passwordInputs[0]!.setValue('StrongPassword1')
    await passwordInputs[1]!.setValue('StrongPassword1')
    expect(form.findAll('.users-password-requirements li.valid')).toHaveLength(4)
    expect(form.get('.users-password-match').classes()).toContain('valid')
    expect(submit.attributes('disabled')).toBeUndefined()
  })

  it('lets an editor edit only their own data and password', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url === '/api/auth/session') {
        return new Response(JSON.stringify({ user: { id: 'editor-1', email: 'editor@example.com', displayName: 'Editor', role: 'editor' } }))
      }
      return new Response(JSON.stringify({ success: true }))
    }))
    const wrapper = mount(UsersPanel, { props: { canManage: false } })
    await flushPromises()

    expect(wrapper.find('.users-profile-form').exists()).toBe(true)
    expect(wrapper.find('input[autocomplete="current-password"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Benutzer hinzufügen')
    expect(wrapper.find('.users-list').exists()).toBe(false)
    expect(fetch).not.toHaveBeenCalledWith('/api/users')
  })
})
