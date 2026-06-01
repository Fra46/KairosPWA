import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams('?documento=D1&serviceId=2')],
}))

vi.mock('../services/turnService', () => ({
  turnService: {
    GetPublicStatus: vi.fn(),
  },
}))

import TurnoDetalle from '../clientsViews/turnoDetalle'
import { turnService } from '../services/turnService'

describe('TurnoDetalle component', () => {
  beforeEach(() => vi.resetAllMocks())

  test('muestra detalles del turno cuando existe', async () => {
    turnService.GetPublicStatus.mockResolvedValueOnce({ number: 7, serviceName: 'S2', priority: 'Normal', clientName: 'X', clientDocumentType: 'cedula' })

    render(<TurnoDetalle />)

    await waitFor(() => expect(turnService.GetPublicStatus).toHaveBeenCalled())

    expect(screen.getByText(/Turno activo/i)).toBeInTheDocument()
    expect(screen.getByText(/7/)).toBeInTheDocument()
  })
})
