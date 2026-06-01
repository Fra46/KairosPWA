import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

// Mock react-router-dom hooks
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/display' }),
}))

// Mock services
vi.mock('../services/turnService', () => ({
  turnService: {
    GetAll: vi.fn(),
    GetPending: vi.fn(),
    GetPublicStatus: vi.fn(),
  },
}))

vi.mock('../services/signalR', () => ({
  startConnection: vi.fn().mockResolvedValue({ on: vi.fn() }),
}))

vi.mock('../services/timeEstimateService', () => ({
  timeEstimateService: {
    getAllServices: () => [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }],
    getEstimatedTime: () => 5,
    formatEstimatedTime: (n) => `${n} min`,
  },
}))

import Display from '../clientsViews/display'
import { turnService } from '../services/turnService'

describe('Display component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('muestra mensaje cuando no hay turnos', async () => {
    turnService.GetAll.mockResolvedValueOnce([])

    render(<Display />)

    await waitFor(() => expect(turnService.GetAll).toHaveBeenCalled())

    expect(screen.getByText(/No hay turnos en atención/i)).toBeInTheDocument()
  })

  test('muestra turnos en atención cuando existen', async () => {
    const data = [
      { id: 1, state: 'EnAtencion', number: 10, serviceId: 1, serviceName: 'A', clientName: 'X' },
      { id: 2, state: 'EnAtencion', number: 11, serviceId: 2, serviceName: 'B', clientName: 'Y' },
      { id: 3, state: 'EnAtencion', number: 12, serviceId: 3, serviceName: 'C', clientName: 'Z' },
    ]
    turnService.GetAll.mockResolvedValueOnce(data)

    // Mock Audio to avoid errors
    global.Audio = function () {
      return { play: () => Promise.resolve() }
    }

    render(<Display />)

    await waitFor(() => expect(turnService.GetAll).toHaveBeenCalled())

    expect(screen.getByText('EN ATENCIÓN')).toBeTruthy()
    const nums = screen.getAllByText(/10|11|12/)
    expect(nums.length).toBeGreaterThan(0)
  })
})
