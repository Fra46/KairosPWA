import { render, screen, fireEvent } from '@testing-library/react'
import EmpleadoClientes from '../../staffViews/empleadoClientes'
import { clientService } from '../../services/clientService'
import { vi } from 'vitest'

describe('EmpleadoClientes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('muestra clientes y filtra la búsqueda', async () => {
    const clients = [
      { idClient: 1, name: 'Alice', state: 'Activo' },
      { idClient: 2, name: 'Bob', state: 'Activo' },
    ]
    vi.spyOn(clientService, 'GetAll').mockResolvedValue(clients)

    render(<EmpleadoClientes />)

    expect(await screen.findByText('Consultar Clientes')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/Buscar/i), {
      target: { value: 'Bob' },
    })

    expect(await screen.findByText('Bob')).toBeInTheDocument()
    expect(screen.queryByText('Alice')).toBeNull()

    fireEvent.change(screen.getByPlaceholderText(/Buscar/i), {
      target: { value: 'ZZZ' },
    })

    expect(await screen.findByText(/No se encontraron clientes/i)).toBeInTheDocument()
  })
})
