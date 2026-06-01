import { clientService } from '../../services/clientService'
import api from '../../services/api'
import { vi } from 'vitest'

vi.mock('../../services/api')

describe('clientService', () => {
  afterEach(() => vi.clearAllMocks())

  test('GetAll obtiene todos los clientes', async () => {
    const mockClients = [{ id: 1, name: 'Alice', document: '12345678' }]
    api.get.mockResolvedValue({ data: mockClients })

    const result = await clientService.GetAll()

    expect(api.get).toHaveBeenCalledWith('/clients')
    expect(result).toEqual(mockClients)
  })

  test('GetById obtiene cliente por ID', async () => {
    const mockClient = { id: 1, name: 'Alice', document: '12345678' }
    api.get.mockResolvedValue({ data: mockClient })

    const result = await clientService.GetById(1)

    expect(api.get).toHaveBeenCalledWith('/clients/1')
    expect(result).toEqual(mockClient)
  })

  test('GetByIdAlternative obtiene cliente por documento', async () => {
    const mockClient = { id: 1, name: 'Alice', document: '12345678' }
    api.get.mockResolvedValue({ data: mockClient })

    const result = await clientService.GetByIdAlternative('12345678')

    expect(api.get).toHaveBeenCalledWith('/clients/by-id/12345678')
    expect(result).toEqual(mockClient)
  })

  test('Create crea nuevo cliente', async () => {
    const clientData = { name: 'Bob', document: '87654321', documentType: 'DNI' }
    const mockResponse = { id: 2, ...clientData }
    api.post.mockResolvedValue({ data: mockResponse })

    const result = await clientService.Create(clientData)

    expect(api.post).toHaveBeenCalledWith('/clients', clientData)
    expect(result).toEqual(mockResponse)
  })

  test('Update actualiza cliente', async () => {
    const updateData = { name: 'Alice Updated' }
    const mockResponse = { id: 1, ...updateData }
    api.put.mockResolvedValue({ data: mockResponse })

    const result = await clientService.Update(1, updateData)

    expect(api.put).toHaveBeenCalledWith('/clients/1', updateData)
    expect(result).toEqual(mockResponse)
  })

  test('Delete elimina cliente', async () => {
    const mockResponse = { success: true, id: 1 }
    api.delete.mockResolvedValue({ data: mockResponse })

    const result = await clientService.Delete(1)

    expect(api.delete).toHaveBeenCalledWith('/clients/1')
    expect(result).toEqual(mockResponse)
  })
})
