import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/ingresar-documento' }),
}))

vi.mock('../services/clientService', () => ({
  clientService: {
    GetByIdAlternative: vi.fn(),
  },
}))

import IngresarDocumento from '../clientsViews/ingresarDocumento'
import { clientService } from '../services/clientService'

describe('IngresarDocumento component', () => {
  beforeEach(() => vi.resetAllMocks())

  test('digita número y verifica cliente existente', async () => {
    clientService.GetByIdAlternative.mockResolvedValueOnce({ idClient: 'abc', name: 'Juan' })

    render(<IngresarDocumento />)

    // Click digits 1..6 to reach minimum length
    await userEvent.click(screen.getByText('1'))
    await userEvent.click(screen.getByText('2'))
    await userEvent.click(screen.getByText('3'))
    await userEvent.click(screen.getByText('4'))
    await userEvent.click(screen.getByText('5'))
    await userEvent.click(screen.getByText('6'))

    // Click continuar
    const continuar = screen.getByRole('button', { name: /Continuar/i })
    await userEvent.click(continuar)

    await waitFor(() => expect(clientService.GetByIdAlternative).toHaveBeenCalled())
  })
})
