import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/home' }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams('?documento=123&serviceId=1')],
}))

vi.mock('../services/turnService', () => ({
  turnService: {
    GetPublicStatus: vi.fn(),
  },
}))

import Home from '../clientsViews/home'
import { turnService } from '../services/turnService'

describe('Home component', () => {
  beforeEach(() => vi.resetAllMocks())

  test('muestra estado público cuando hay respuesta', async () => {
    turnService.GetPublicStatus.mockResolvedValueOnce({ number: 5, serviceName: 'S1', state: 'Pendiente', clientDocumentType: 'cedula' })

    render(<Home />)

    await waitFor(() => expect(turnService.GetPublicStatus).toHaveBeenCalled())

    expect(screen.getByText(/Turno 5/i)).toBeInTheDocument()
  })
})
