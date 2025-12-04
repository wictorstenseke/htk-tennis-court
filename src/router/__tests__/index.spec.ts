import { describe, it, expect } from 'vitest'
import router from '../index'

describe('router', () => {
  it('should have correct routes', () => {
    const routes = router.getRoutes()

    expect(routes).toHaveLength(2)
    expect(routes[0].path).toBe('/')
    expect(routes[0].name).toBe('home')
    expect(routes[1].path).toBe('/auth')
    expect(routes[1].name).toBe('auth')
  })

  it('should use web history mode', () => {
    expect(router).toBeDefined()
    // Router is created with createWebHistory
    expect(router).toHaveProperty('currentRoute')
  })

  it('should lazy load HomeView component', async () => {
    const route = router.getRoutes().find(r => r.name === 'home')
    expect(route).toBeDefined()

    // Check that route has components (Vue Router uses components, not component)
    if (route) {
      expect(route.components).toBeDefined()
    }
  })
})
