import api from './api';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const base64ToArrayBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const parsePemPublicKey = (pem) => {
  const lines = pem
    .trim()
    .split(/\r?\n/)
    .filter((line) => !line.includes('BEGIN PUBLIC KEY') && !line.includes('END PUBLIC KEY'));
  return base64ToArrayBuffer(lines.join(''));
};

const importPublicKey = async (pem) => {
  const keyData = parsePemPublicKey(pem);
  return await window.crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );
};

const splitAesGcmPayload = (encryptedBuffer) => {
  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const tagSize = 16;
  const cipherText = encryptedBytes.slice(0, encryptedBytes.length - tagSize);
  const authTag = encryptedBytes.slice(encryptedBytes.length - tagSize);
  return { cipherText, authTag };
};

export const cryptoService = {
  GetPublicKey: async () => {
    const response = await api.get('/crypto/public-key');
    return response.data.publicKey;
  },

  EncryptPublicTurnPayload: async (publicKeyPem, payloadString) => {
    const publicKey = await importPublicKey(publicKeyPem);
    const aesKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedPayload = textEncoder.encode(payloadString);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      aesKey,
      encodedPayload
    );

    const rawKey = await window.crypto.subtle.exportKey('raw', aesKey);
    const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      rawKey
    );

    const { cipherText, authTag } = splitAesGcmPayload(encryptedBuffer);

    return {
      encryptedKey: arrayBufferToBase64(encryptedKeyBuffer),
      iv: arrayBufferToBase64(iv),
      cipherText: arrayBufferToBase64(cipherText),
      authTag: arrayBufferToBase64(authTag),
    };
  },
};
