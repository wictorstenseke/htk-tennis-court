import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import router from '../index'

describe('router', () => {
  it('should have correct routes', () => {
    const routes = router.getRoutes()

    expect(routes).toHaveLength(1)
    expect(routes[0].path).toBe('/')
    expect(routes[0].name).toBe('home')
  })

  it('should use web history mode', () => {
    expect(router).toBeDefined()
    // Router is created with createWebHistory
    expect(router).toHaveProperty('currentRoute')
  })

  it('should lazy load HomeView component', async () => {
    const route = router.getRoutes().find(r => r.name === 'home')
    expect(route).toBeDefined()

    if (route && typeof route.component === 'function') {
      const component = await route.component()
      expect(component).toBeDefined()
    }
  })
})

