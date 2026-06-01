import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdminServices from '../../staffViews/adminServices'
import { serviceService } from '../../services/serviceService'
import { vi } from 'vitest'

describe('AdminServices', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('muestra servicios cargados y permite agregar uno nuevo', async () => {
    vi.spyOn(serviceService, 'GetAll')
      .mockResolvedValueOnce([
        { idService: 1, name: 'Servicio A', description: 'Desc A', state: 'Activo' },
      ])
      .mockResolvedValueOnce([
        { idService: 1, name: 'Servicio A', description: 'Desc A', state: 'Activo' },
        { idService: 2, name: 'Servicio B', description: 'Desc B', state: 'Activo' },
      ])
    vi.spyOn(serviceService, 'Create').mockResolvedValue({ idService: 2, name: 'Servicio B', description: 'Desc B', state: 'Activo' })

    render(<AdminServices />)

    expect(await screen.findByText('Servicio A')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/Nombre del servicio/i), {
      target: { value: 'Servicio B' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Descripción/i), {
      target: { value: 'Desc B' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Agregar/i }))

    await waitFor(() => expect(serviceService.Create).toHaveBeenCalledWith({
      name: 'Servicio B',
      description: 'Desc B',
      state: 'Activo',
    }))

    expect(await screen.findByText('Servicio B')).toBeInTheDocument()
  })
})
