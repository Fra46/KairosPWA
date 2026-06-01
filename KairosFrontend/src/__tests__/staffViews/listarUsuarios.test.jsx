import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ListarUsuarios from '../../staffViews/listarUsuarios'
import { userService } from '../../services/userService'
import * as authModule from '../../context/useAuth'
import { vi } from 'vitest'

describe('ListarUsuarios', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('muestra usuarios cargados correctamente', async () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: { idUser: 999 } })
    const users = [{ idUser: 1, name: 'Admin', rolName: 'Administrador', state: 'Activo' }]
    vi.spyOn(userService, 'GetAll').mockResolvedValue(users)

    render(
      <MemoryRouter>
        <ListarUsuarios />
      </MemoryRouter>
    )

    expect(await screen.findByText('Administrar Usuarios')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText(/Administrador/i)).toBeInTheDocument()
  })
})
