import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Mocks for services used by the component (scoped to these tests)
const navigateMock = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ state: { clientName: 'Juan Perez', documento: '12345', docType: 'cedula' }, pathname: '/seleccionar' })
}))

vi.mock('../services/serviceService', () => ({
  serviceService: {
    GetAll: vi.fn(),
  },
}))

vi.mock('../services/turnService', () => ({
  turnService: {
    CreatePublicEncrypted: vi.fn(),
    CreatePublic: vi.fn(),
  },
}))

vi.mock('../services/cryptoService', () => ({
  cryptoService: {
    GetPublicKey: vi.fn(),
    EncryptPublicTurnPayload: vi.fn(),
  },
}))

import SeleccionarServicio from '../clientsViews/seleccionarServicio'
import { serviceService } from '../services/serviceService'
import { turnService } from '../services/turnService'
import { cryptoService } from '../services/cryptoService'

describe('SeleccionarServicio component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  beforeAll(() => {
    // Ensure React is available as a global in case the JSX transform expects it
    global.React = React
  })

  test('muestra mensaje cuando no hay servicios disponibles', async () => {
    serviceService.GetAll.mockResolvedValueOnce([])

    render(<SeleccionarServicio />)

    expect(screen.getByText(/Cargando servicios.../i)).toBeInTheDocument()

    await waitFor(() => expect(serviceService.GetAll).toHaveBeenCalled())

    expect(screen.getByText(/No hay servicios disponibles/i)).toBeInTheDocument()
  })

  test('renderiza servicios y crea turno cifrado cuando crypto está disponible', async () => {
    const services = [{ idService: 1, name: 'Servicio A' }]
    serviceService.GetAll.mockResolvedValueOnce(services)

    // Simula disponibilidad de Web Crypto
    // Nota: jsdom puede exponer `crypto` como propiedad solo-lectura, así que la sobrescribimos temporalmente
    const originalCrypto = global.crypto
    Object.defineProperty(global, 'crypto', { value: { subtle: {} }, configurable: true })

    cryptoService.GetPublicKey.mockResolvedValueOnce('PUBLIC_KEY')
    cryptoService.EncryptPublicTurnPayload.mockResolvedValueOnce({ encryptedKey: 'a', iv: 'b', cipherText: 'c', authTag: 'd' })
    turnService.CreatePublicEncrypted.mockResolvedValueOnce({ number: 42 })

    render(<SeleccionarServicio />)

    await waitFor(() => expect(serviceService.GetAll).toHaveBeenCalled())

    const btn = await screen.findByRole('button', { name: /Servicio A/i })
    await userEvent.click(btn)

    await waitFor(() => expect(cryptoService.GetPublicKey).toHaveBeenCalled())
    expect(cryptoService.EncryptPublicTurnPayload).toHaveBeenCalled()
    await waitFor(() => expect(turnService.CreatePublicEncrypted).toHaveBeenCalled())

    // Navegación a confirmación con número de turno
    await waitFor(() => expect(navigateMock).toHaveBeenCalled())

    // restaurar crypto original
    Object.defineProperty(global, 'crypto', { value: originalCrypto, configurable: true })
  })
})
