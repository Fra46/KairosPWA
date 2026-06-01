import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EmpleadoNextTurn from '../../staffViews/empleadoNextTurn'
import * as authModule from '../../context/useAuth'
import { serviceService } from '../../services/serviceService'
import * as signalRModule from '../../services/signalR'
import { turnService } from '../../services/turnService'
import { vi } from 'vitest'

describe('EmpleadoNextTurn', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('carga servicios y mantiene botones deshabilitados sin servicio seleccionado', async () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: { id: 1 } })
    vi.spyOn(serviceService, 'GetAll').mockResolvedValue([
      { idService: 1, name: 'Servicio Uno', state: 'Activo' },
    ])
    vi.spyOn(signalRModule, 'startConnection').mockResolvedValue({ on: vi.fn() })
    vi.spyOn(turnService, 'GetCurrent').mockResolvedValue(null)

    render(<EmpleadoNextTurn />)

    expect(await screen.findByText('Servicio Uno')).toBeInTheDocument()

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(select).toHaveValue('')

    const button = screen.getByRole('button', { name: /Llamar Siguiente Turno/i })
    expect(button).toBeDisabled()

    fireEvent.change(select, { target: { value: '1' } })

    await waitFor(() => expect(select).toHaveValue('1'))
    expect(button).not.toBeDisabled()
  })
})
