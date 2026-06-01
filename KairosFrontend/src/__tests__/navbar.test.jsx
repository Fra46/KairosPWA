import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '../components/navbar'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/authContext'

describe('Navbar', () => {
  test('muestra link de acceso cuando no hay usuario', () => {
    render(
      <AuthContext.Provider value={{ user: null, logout: () => {} }}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(screen.getByText(/Acceso Personal/i)).toBeInTheDocument()
  })

  test('muestra nombre de usuario cuando hay usuario', () => {
    render(
      <AuthContext.Provider value={{ user: { name: 'Ana', role: 'Empleado' }, logout: () => {} }}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(screen.getByText(/Ana/i)).toBeInTheDocument()
    expect(screen.getByText(/Cerrar Sesión/i)).toBeInTheDocument()
  })
})
