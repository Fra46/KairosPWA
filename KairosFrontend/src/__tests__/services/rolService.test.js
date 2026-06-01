import { rolService } from '../../services/rolService'
import api from '../../services/api'
import { vi } from 'vitest'

vi.mock('../../services/api')

describe('rolService', () => {
  afterEach(() => vi.clearAllMocks())

  test('GetAll obtiene todos los roles', async () => {
    const mockRols = [{ id: 1, name: 'Administrador' }, { id: 2, name: 'Empleado' }]
    api.get.mockResolvedValue({ data: mockRols })

    const result = await rolService.GetAll()

    expect(api.get).toHaveBeenCalledWith('/rols')
    expect(result).toEqual(mockRols)
  })

  test('GetById obtiene rol por ID', async () => {
    const mockRol = { id: 1, name: 'Administrador' }
    api.get.mockResolvedValue({ data: mockRol })

    const result = await rolService.GetById(1)

    expect(api.get).toHaveBeenCalledWith('/rols/1')
    expect(result).toEqual(mockRol)
  })

  test('Create crea nuevo rol', async () => {
    const rolData = { name: 'Manager', description: 'Gestor de sucursal' }
    const mockResponse = { id: 3, ...rolData }
    api.post.mockResolvedValue({ data: mockResponse })

    const result = await rolService.Create(rolData)

    expect(api.post).toHaveBeenCalledWith('/rols', rolData)
    expect(result).toEqual(mockResponse)
  })

  test('Update actualiza rol', async () => {
    const updateData = { name: 'Manager Updated' }
    const mockResponse = { id: 3, ...updateData }
    api.put.mockResolvedValue({ data: mockResponse })

    const result = await rolService.Update(3, updateData)

    expect(api.put).toHaveBeenCalledWith('/rols/3', updateData)
    expect(result).toEqual(mockResponse)
  })

  test('Delete elimina rol', async () => {
    const mockResponse = { success: true }
    api.delete.mockResolvedValue({ data: mockResponse })

    const result = await rolService.Delete(3)

    expect(api.delete).toHaveBeenCalledWith('/rols/3')
    expect(result).toEqual(mockResponse)
  })
})
