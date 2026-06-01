import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: { documento: '999' }, pathname: '/' }),
}))

vi.mock('../services/clientService', () => ({
  clientService: {
    Create: vi.fn(),
  },
}))

import RegistroCliente from '../clientsViews/registroCliente'
import { clientService } from '../services/clientService'

describe('RegistroCliente component', () => {
  beforeEach(() => vi.resetAllMocks())

  test('registra cliente con nombre via teclado y submit', async () => {
    clientService.Create.mockResolvedValueOnce({ idClient: '999', name: 'User' })

    render(<RegistroCliente />)

    const input = screen.getByPlaceholderText(/Escriba su nombre completo/i)
    await userEvent.type(input, 'Juan')

    const submit = screen.getByRole('button', { name: /Registrar/i })
    await userEvent.click(submit)

    expect(clientService.Create).toHaveBeenCalled()
  })
})
