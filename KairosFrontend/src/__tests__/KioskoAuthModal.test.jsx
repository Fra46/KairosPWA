import { render, screen, fireEvent, act } from '@testing-library/react'
import KioskoAuthModal from '../components/KioskoAuthModal'
import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }))

describe('KioskoAuthModal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  test('permite ingresar PIN correcto y navegar', () => {
    const onClose = vi.fn()
    render(<KioskoAuthModal isOpen={true} onClose={onClose} />)

    // ingresar 1,2,3,4
    fireEvent.click(screen.getByText('1'))
    fireEvent.click(screen.getByText('2'))
    fireEvent.click(screen.getByText('3'))
    fireEvent.click(screen.getByText('4'))

    const btn = screen.getByRole('button', { name: /Acceder/i })
    expect(btn).toBeEnabled()

    act(() => {
      fireEvent.click(btn)
      vi.advanceTimersByTime(600)
    })

    expect(onClose).toHaveBeenCalled()
  })

  test('muestra error si PIN incorrecto', () => {
    const onClose = vi.fn()
    render(<KioskoAuthModal isOpen={true} onClose={onClose} />)

    fireEvent.click(screen.getByText('1'))
    fireEvent.click(screen.getByText('2'))
    fireEvent.click(screen.getByText('3'))
    fireEvent.click(screen.getByText('5'))

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Acceder/i }))
      vi.advanceTimersByTime(600)
    })

    expect(screen.getByText(/PIN incorrecto/i)).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })
})
