import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegistroStaff from '../../staffViews/registroStaff'
import { userService } from '../../services/userService'
import { rolService } from '../../services/rolService'
import { vi } from 'vitest'

describe('RegistroStaff', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('carga roles y registra un nuevo usuario', async () => {
    vi.spyOn(rolService, 'GetAll').mockResolvedValue([{ idRol: 1, name: 'Empleado' }])
    vi.spyOn(userService, 'Create').mockResolvedValue({ idUser: 1, userName: 'newuser' })

    const { container } = render(
      <MemoryRouter>
        <RegistroStaff />
      </MemoryRouter>
    )

    expect(await screen.findByText(/Registrar Personal/i)).toBeInTheDocument()

    const userNameInput = container.querySelector('input[name="userName"]')
    const passwordInput = container.querySelector('input[name="password"]')
    const confirmInput = container.querySelector('input[name="confirmPassword"]')

    fireEvent.change(userNameInput, {
      target: { value: 'newuser' },
    })
    fireEvent.change(passwordInput, {
      target: { value: 'password123' },
    })
    fireEvent.change(confirmInput, {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Registrar/i }))

    await waitFor(() => expect(userService.Create).toHaveBeenCalled())
    expect(userService.Create).toHaveBeenCalledWith({
      userName: 'newuser',
      password: 'password123',
      state: 'Activo',
      rolId: 1,
    })
  })
})
