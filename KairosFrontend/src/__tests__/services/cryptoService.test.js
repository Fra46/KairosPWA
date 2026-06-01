import { cryptoService } from '../../services/cryptoService'
import api from '../../services/api'
import { vi } from 'vitest'

vi.mock('../../services/api')

describe('cryptoService', () => {
  afterEach(() => vi.clearAllMocks())

  test('GetPublicKey obtiene clave pública del backend', async () => {
    const mockPem = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBg...\n-----END PUBLIC KEY-----'
    api.get.mockResolvedValue({ data: { publicKey: mockPem } })

    const result = await cryptoService.GetPublicKey()

    expect(api.get).toHaveBeenCalledWith('/crypto/public-key')
    expect(result).toBe(mockPem)
  })

  test('EncryptPublicTurnPayload genera encriptación híbrida', async () => {
    const mockPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2a2rwplBcqmLbPLt0/cX
u3DPGPHmZLk+3khknvf2L1qbXd0qn+PvOmhfPqEarNGPUP8PsHqhCjLQ9vqvQSwW
Lm8sTSsUfIRGfVJ9OMNe1vEXB3N0Wvjq7PqBh5YJJvVf4khKkfEFYHvC1vX1cVgz
7VEkGvN0kGzb8dJEXJJxJXJyJ8BXdQJq3YpA8hxqJGhCzXzx8x8x8x8x8x8x8x8x
lR1VpJq5LJJvV8dJxUxYlBUwEf9jNlRyHzJqBKjmXkNxKwXpDkYKQzVXdKzYqXyB
QIDAQAB
-----END PUBLIC KEY-----`

    const mockCrypto = {
      subtle: {
        importKey: vi.fn().mockResolvedValue({}),
        generateKey: vi.fn().mockResolvedValue({
          privateKey: {},
          publicKey: {},
        }),
        encrypt: vi.fn().mockResolvedValue(new Uint8Array(48).buffer),
        exportKey: vi.fn().mockResolvedValue(new Uint8Array(32).buffer),
      },
      getRandomValues: vi.fn((arr) => {
        arr.fill(1)
        return arr
      }),
    }

    const originalCrypto = global.crypto
    Object.defineProperty(global, 'crypto', { value: mockCrypto, writable: true })

    try {
      const payload = '{"serviceId":1}'
      const result = await cryptoService.EncryptPublicTurnPayload(mockPem, payload)

      expect(result).toHaveProperty('encryptedKey')
      expect(result).toHaveProperty('iv')
      expect(result).toHaveProperty('cipherText')
      expect(result).toHaveProperty('authTag')
      expect(typeof result.encryptedKey).toBe('string')
    } finally {
      Object.defineProperty(global, 'crypto', { value: originalCrypto, writable: true })
    }
  })
})
