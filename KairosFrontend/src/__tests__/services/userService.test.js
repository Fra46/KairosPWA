import { userService } from '../../services/userService'
import api from '../../services/api'
import { vi } from 'vitest'

vi.mock('../../services/api')

describe('userService', () => {
  afterEach(() => vi.clearAllMocks())

  test('Login autentica usuario', async () => {
    const credentials = { userName: 'admin', password: 'pass123' }
    const mockResponse = { token: 'jwt_token_here', user: { id: 1, name: 'Admin' } }
    api.post.mockResolvedValue({ data: mockResponse })

    const result = await userService.Login(credentials)

    expect(api.post).toHaveBeenCalledWith('/users/login', {
      userName: 'admin',
      password: 'pass123',
    })
    expect(result).toEqual(mockResponse)
  })

  test('GetAll obtiene todos los usuarios', async () => {
    const mockUsers = [{ id: 1, name: 'Admin', role: 'Administrador' }]
    api.get.mockResolvedValue({ data: mockUsers })

    const result = await userService.GetAll()

    expect(api.get).toHaveBeenCalledWith('/users')
    expect(result).toEqual(mockUsers)
  })

  test('GetById obtiene usuario por ID', async () => {
    const mockUser = { id: 1, name: 'Admin', role: 'Administrador' }
    api.get.mockResolvedValue({ data: mockUser })

    const result = await userService.GetById(1)

    expect(api.get).toHaveBeenCalledWith('/users/1')
    expect(result).toEqual(mockUser)
  })

  test('Create crea nuevo usuario', async () => {
    const userData = { userName: 'newuser', password: 'pass', rolId: 2 }
    const mockResponse = { id: 2, name: 'newuser', rolId: 2 }
    api.post.mockResolvedValue({ data: mockResponse })

    const result = await userService.Create(userData)

    expect(api.post).toHaveBeenCalledWith('/users', {
      name: 'newuser',
      password: 'pass',
      state: 'Activo',
      rolId: 2,
    })
    expect(result).toEqual(mockResponse)
  })

  test('GetTurnStats obtiene estadísticas de turnos', async () => {
    const mockStats = [{ userId: 1, totalTurns: 50, completedTurns: 48 }]
    api.get.mockResolvedValue({ data: mockStats })

    const result = await userService.GetTurnStats()

    expect(api.get).toHaveBeenCalledWith('/users/turns-by-service')
    expect(result).toEqual(mockStats)
  })
})
