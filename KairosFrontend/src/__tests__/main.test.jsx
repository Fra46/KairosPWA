import { describe, expect, test, vi } from 'vitest'
import { render } from '@testing-library/react'

const renderMock = vi.fn()
const createRootMock = vi.fn(() => ({ render: renderMock }))

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: createRootMock,
  },
}))
vi.mock('../App.jsx', () => ({
  default: () => <div>App Stub</div>,
}))
vi.mock('../context/authProvider', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
}))
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <>{children}</>,
}))

describe('main entry', () => {
  test('renderiza App usando createRoot en #root', async () => {
    document.body.innerHTML = '<div id="root"></div>'

    await import('../main.jsx')

    expect(createRootMock).toHaveBeenCalledWith(document.getElementById('root'))
    expect(renderMock).toHaveBeenCalled()
  })
})
