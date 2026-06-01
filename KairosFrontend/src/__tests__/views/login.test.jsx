import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../../views/login'
import { useAuth } from '../../context/useAuth'
import { vi } from 'vitest'

const navigateMock = vi.fn()

vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}))
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ state: {} }),
}))

describe('Login', () => {
  afterEach(() => {
    vi.clearAllMocks()
    navigateMock.mockClear()
  })

  test('redirige a admin cuando el usuario es administrador', async () => {
    const loginMock = vi.fn().mockResolvedValue({ user: { rol: { name: 'Administrador' } } })
    useAuth.mockReturnValue({ login: loginMock })

    render(<Login />)

    fireEvent.change(screen.getByPlaceholderText(/Usuario/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith('admin', 'secret'))
    expect(navigateMock).toHaveBeenCalledWith('/admin/servicios', { replace: true })
  })
})
