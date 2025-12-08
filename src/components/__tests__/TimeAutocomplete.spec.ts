import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import TimeAutocomplete from '../TimeAutocomplete.vue'

const mediaQueryRef = ref(false)

vi.mock('@vueuse/core', () => ({
  useMediaQuery: vi.fn(() => mediaQueryRef),
}))

describe('TimeAutocomplete', () => {
  it('does not emit selection for disabled options and keeps dropdown open', async () => {
    const wrapper = mount(TimeAutocomplete, {
      props: {
        modelValue: '',
        disabledOptions: ['10:00'],
      },
    })

    // Type to show dropdown with matching option
    const input = wrapper.find('input')
    await input.setValue('10:00')
    const emitsBefore = wrapper.emitted()['update:modelValue']?.length ?? 0
    await input.trigger('focus')

    const option = wrapper.findAll('button').find(btn => btn.text() === '10:00')
    expect(option).toBeTruthy()

    await option!.trigger('mousedown')
    await option!.trigger('click')

    // No new emit for disabled option
    const emitsAfter = wrapper.emitted()['update:modelValue']?.length ?? 0
    expect(emitsAfter).toBe(emitsBefore)
    // Dropdown remains visible
    expect(wrapper.find('.time-dropdown').exists()).toBe(true)
  })

  it('uses native time input on mobile (no chevron)', async () => {
    mediaQueryRef.value = true

    const wrapper = mount(TimeAutocomplete, {
      props: {
        modelValue: '',
      },
    })

    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('time')
    expect(wrapper.find('.time-dropdown').exists()).toBe(false)
    expect(wrapper.find('svg').exists()).toBe(false)
  })
})
