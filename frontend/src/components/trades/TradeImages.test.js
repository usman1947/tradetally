import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TradeImages from './TradeImages.vue'

vi.mock('@/services/api', () => ({
  default: { defaults: { baseURL: '/api' }, get: vi.fn(), delete: vi.fn() }
}))
vi.mock('@/composables/useNotification', () => ({
  useNotification: () => ({ showSuccess: vi.fn(), showError: vi.fn() })
}))

// External URLs are passed through by useAuthedImage, so no blob fetch is needed.
const images = [
  { id: 'a', file_name: 'first.png', file_size: 1024, file_url: 'https://cdn.example/first.png' },
  { id: 'b', file_name: 'second.png', file_size: 2048, file_url: 'https://cdn.example/second.png' }
]

let wrapper
afterEach(() => wrapper?.unmount())

describe('TradeImages viewer', () => {
  it('opens on the first image when mounted with viewer-open (switching trades)', () => {
    wrapper = mount(TradeImages, {
      props: { tradeId: 't1', images, viewerOpen: true, caption: 'AAPL · Aug 19, 2026 · long' }
    })

    const viewer = wrapper.get('.fixed.inset-0')
    expect(viewer.get('img').attributes('src')).toBe('https://cdn.example/first.png')
    expect(viewer.text()).toContain('AAPL · Aug 19, 2026 · long')
    expect(viewer.text()).toContain('first.png')
  })

  it('stays open with a message when the trade has no screenshot', () => {
    wrapper = mount(TradeImages, { props: { tradeId: 't1', images: [], viewerOpen: true } })

    expect(wrapper.get('.fixed.inset-0').text()).toContain('No screenshot for this trade')
  })

  it('reports open and close through update:viewerOpen, closing on Escape', async () => {
    wrapper = mount(TradeImages, { props: { tradeId: 't1', images }, attachTo: document.body })

    await wrapper.findAll('img')[1].trigger('click')
    expect(wrapper.emitted('update:viewerOpen')).toEqual([[true]])
    expect(wrapper.get('.fixed.inset-0 img').attributes('src')).toBe('https://cdn.example/second.png')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:viewerOpen')).toEqual([[true], [false]])
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)
  })

  it('renders nothing for a trade without images when the viewer is closed', () => {
    wrapper = mount(TradeImages, { props: { tradeId: 't1', images: [] } })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})
