import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import DatabasePanel from '../component/DatabasePanel.vue'

describe('DatabasePanel', () => {
  afterEach(() => vi.restoreAllMocks())

  it('contains only query input and result output and displays selected rows', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      rows: [{ document_key: 'messages', data: [] }],
    }), { status: 200 }))
    const wrapper = mount(DatabasePanel)

    expect(wrapper.find('.database-toolbar').exists()).toBe(false)
    expect(wrapper.find('.database-rows').exists()).toBe(false)
    expect(wrapper.findAll('textarea')).toHaveLength(1)

    await wrapper.get('.database-run').trigger('click')
    await flushPromises()

    expect(wrapper.get('.database-result-table').text()).toContain('document_key')
    expect(wrapper.get('.database-result-table').text()).toContain('messages')
    expect(fetchMock).toHaveBeenCalledWith('/api/database/query', expect.objectContaining({ method: 'POST' }))
  })

  it('displays query errors in the output', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'SQL syntax error' }), { status: 400 }))
    const wrapper = mount(DatabasePanel)

    await wrapper.get('.database-run').trigger('click')
    await flushPromises()

    expect(wrapper.get('.database-error').text()).toBe('SQL syntax error')
  })
})
