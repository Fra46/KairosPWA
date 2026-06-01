import { render, screen } from '@testing-library/react'
import { AuthProvider } from '../context/authProvider'
import { useAuth } from '../context/useAuth'
import { vi } from 'vitest'

function Consumer() {
  const { user } = useAuth()
  return <div>{user ? user.name : 'no-user'}</div>
}

describe('AuthProvider', () => {
  afterEach(() => {
    localStorage.removeItem('kairos_auth')
  })

  test('usa localStorage si hay datos', () => {
    const stored = { user: { id: 1, name: 'StoredUser' }, token: 't' }
    localStorage.setItem('kairos_auth', JSON.stringify(stored))

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    )

    expect(screen.getByText('StoredUser')).toBeInTheDocument()
  })
})
