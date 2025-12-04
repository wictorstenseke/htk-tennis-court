import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExampleComponent from '../ExampleComponent.vue'

describe('ExampleComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(ExampleComponent)
    expect(wrapper.text()).toContain('Example Component')
  })

  it('renders with custom props', () => {
    const wrapper = mount(ExampleComponent, {
      props: {
        title: 'Custom Title',
        message: 'Custom Message',
      },
    })
    expect(wrapper.text()).toContain('Custom Title')
    expect(wrapper.text()).toContain('Custom Message')
  })
})

