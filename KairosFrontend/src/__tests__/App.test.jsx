import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../components/navbar', () => ({
  default: () => <div>Navbar Stub</div>,
}))
vi.mock('../components/protectedRoute', () => ({
  default: ({ children }) => <>{children}</>,
}))
vi.mock('../clientsViews/home', () => ({
  default: () => <div>Home Stub</div>,
}))
vi.mock('../views/login', () => ({
  default: () => <div>Login Stub</div>,
}))
vi.mock('../staffViews/registroStaff', () => ({
  default: () => <div>RegistroStaff Stub</div>,
}))

let App

describe('App routing', () => {
  beforeAll(async () => {
    App = (await import('../App')).default
  })

  test('renderiza la ruta de login', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Login Stub')).toBeInTheDocument()
  }, 10000)

  test('renderiza la ruta de registro de staff', async () => {
    render(
      <MemoryRouter initialEntries={['/registro']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('RegistroStaff Stub')).toBeInTheDocument()
  }, 10000)
})
