import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import DatabasePanel from '../component/DatabasePanel.vue'

describe('DatabasePanel', () => {
  afterEach(() => vi.restoreAllMocks())

  it('loads tables and displays structured add and delete controls', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (url === '/api/database') return new Response(JSON.stringify([{ name: 'app_documents', rows: 1, shape: 'array' }]), { status: 200 })
      return new Response(JSON.stringify({ name: 'app_documents', shape: 'array', columns: ['document_key', 'data'], rows: [{ document_key: 'messages', data: [] }] }), { status: 200 })
    })
    const wrapper = mount(DatabasePanel)
    await flushPromises()

    expect(wrapper.get<HTMLSelectElement>('.database-toolbar select').element.value).toBe('app_documents')
    expect(wrapper.get('.database-toolbar').text()).toContain('Add table')
    expect(wrapper.get('.database-toolbar').text()).toContain('Delete table')
    expect(wrapper.get('.database-columns').text()).toContain('Add column')
    expect(wrapper.get<HTMLTextAreaElement>('.database-rows textarea').element.value).toContain('messages')
  })

  it('runs a structured count operation', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options) => {
      if (url === '/api/database' && !options) return new Response(JSON.stringify([{ name: 'app_documents', rows: 3, shape: 'array' }]), { status: 200 })
      if (String(url).includes('?table=')) return new Response(JSON.stringify({ name: 'app_documents', shape: 'array', columns: ['document_key'], rows: [] }), { status: 200 })
      return new Response(JSON.stringify({ count: 3 }), { status: 200 })
    })
    const wrapper = mount(DatabasePanel)
    await flushPromises()
    await wrapper.get('.database-query select').setValue('count')
    await wrapper.get('.database-query .admin-button.primary').trigger('click')
    await flushPromises()

    expect(wrapper.get('.database-query pre').text()).toContain('"count": 3')
    expect(fetchMock).toHaveBeenLastCalledWith('/api/database', expect.objectContaining({ method: 'POST' }))
  })
})
