import { render, screen } from '@testing-library/react'
import ProtectedRoute from '../components/protectedRoute'
import { AuthContext } from '../context/authContext'
import { MemoryRouter } from 'react-router-dom'

describe('ProtectedRoute', () => {
  test('retorna null cuando loading=true', () => {
    const { container } = render(
      <AuthContext.Provider value={{ loading: true, user: null }}>
        <ProtectedRoute><div>OK</div></ProtectedRoute>
      </AuthContext.Provider>
    )
    expect(container.innerHTML).toBe('')
  })

  test('no muestra children cuando no hay usuario', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <AuthContext.Provider value={{ loading: false, user: null }}>
          <ProtectedRoute><div>OK</div></ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    )
    expect(queryByText('OK')).toBeNull()
  })

  test('muestra children cuando rol permitido', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ loading: false, user: { role: 'Empleado' } }}>
          <ProtectedRoute allowedRoles={["Empleado"]}><div>OK</div></ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    )
    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  test('no muestra children cuando rol no permitido', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <AuthContext.Provider value={{ loading: false, user: { role: 'Cliente' } }}>
          <ProtectedRoute allowedRoles={["Empleado"]}><div>OK</div></ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    )
    expect(queryByText('OK')).toBeNull()
  })
})
