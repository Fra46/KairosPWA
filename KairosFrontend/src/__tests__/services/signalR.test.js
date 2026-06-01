import { vi } from 'vitest'

describe('signalR', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  test('getConnection retorna null antes de conectar', async () => {
    const { getConnection } = await import('../../services/signalR')
    expect(getConnection()).toBeNull()
  })

  test('signalR module exporta funciones necesarias', async () => {
    const signalRModule = await import('../../services/signalR')
    
    expect(typeof signalRModule.startConnection).toBe('function')
    expect(typeof signalRModule.getConnection).toBe('function')
  })
})
