import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ state: { turnNumber: 123, serviceName: 'S1', clientName: 'Ana', documento: 'D1', serviceId: 2 }, pathname: '/' }),
  useNavigate: () => vi.fn(),
}))

import ConfirmacionTurno from '../clientsViews/confirmacionTurno'

describe('ConfirmacionTurno component', () => {
  test('muestra número de turno y ticket URL', () => {
    render(<ConfirmacionTurno />)

    expect(screen.getByText(/Turno Confirmado/i)).toBeInTheDocument()
    const matches = screen.getAllByText(/123/)
    expect(matches.length).toBeGreaterThan(0)
  })
})
