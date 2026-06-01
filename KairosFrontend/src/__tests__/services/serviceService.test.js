import { serviceService } from '../../services/serviceService'
import api from '../../services/api'
import { vi } from 'vitest'

vi.mock('../../services/api')

describe('serviceService', () => {
  afterEach(() => vi.clearAllMocks())

  test('GetAll obtiene todos los servicios', async () => {
    const mockServices = [{ id: 1, name: 'Atención al Cliente', state: 'Activo' }]
    api.get.mockResolvedValue({ data: mockServices })

    const result = await serviceService.GetAll()

    expect(api.get).toHaveBeenCalledWith('/services')
    expect(result).toEqual(mockServices)
  })

  test('GetById obtiene servicio por ID', async () => {
    const mockService = { id: 1, name: 'Atención al Cliente', state: 'Activo' }
    api.get.mockResolvedValue({ data: mockService })

    const result = await serviceService.GetById(1)

    expect(api.get).toHaveBeenCalledWith('/services/1')
    expect(result).toEqual(mockService)
  })

  test('Create crea nuevo servicio', async () => {
    const serviceData = { name: 'Nuevo Servicio', description: 'Desc' }
    const mockResponse = { id: 10, ...serviceData }
    api.post.mockResolvedValue({ data: mockResponse })

    const result = await serviceService.Create(serviceData)

    expect(api.post).toHaveBeenCalledWith('/services', serviceData)
    expect(result).toEqual(mockResponse)
  })

  test('Update actualiza servicio', async () => {
    const updateData = { name: 'Servicio Actualizado' }
    const mockResponse = { id: 1, ...updateData }
    api.put.mockResolvedValue({ data: mockResponse })

    const result = await serviceService.Update(1, updateData)

    expect(api.put).toHaveBeenCalledWith('/services/1', updateData)
    expect(result).toEqual(mockResponse)
  })

  test('Delete elimina servicio', async () => {
    const mockResponse = { success: true }
    api.delete.mockResolvedValue({ data: mockResponse })

    const result = await serviceService.Delete(1)

    expect(api.delete).toHaveBeenCalledWith('/services/1')
    expect(result).toEqual(mockResponse)
  })
})
