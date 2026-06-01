using KairosPWA.DTOs;
using System.Security.Cryptography;
using System.Text;

namespace KairosPWA.Services
{
    public class EncryptionService : IEncryptionService, IDisposable
    {
        private readonly RSA _rsa;
        private readonly string _publicKeyPem;

        public EncryptionService()
        {
            _rsa = RSA.Create(2048);
            _publicKeyPem = ExportPublicKey(_rsa);
        }

        public string GetPublicKeyPem() => _publicKeyPem;

        public string DecryptPayload(EncryptedPayloadDTO payload)
        {
            if (payload == null)
                throw new ArgumentNullException(nameof(payload));

            var encryptedKey = Convert.FromBase64String(payload.EncryptedKey);
            var iv = Convert.FromBase64String(payload.IV);
            var cipherText = Convert.FromBase64String(payload.CipherText);
            var authTag = Convert.FromBase64String(payload.AuthTag);

            var aesKey = _rsa.Decrypt(encryptedKey, RSAEncryptionPadding.OaepSHA256);
            return DecryptAesGcm(aesKey, iv, cipherText, authTag);
        }

        private static string DecryptAesGcm(byte[] key, byte[] iv, byte[] cipherText, byte[] authTag)
        {
            using var aes = new AesGcm(key, 16);
            var plainText = new byte[cipherText.Length];
            aes.Decrypt(iv, cipherText, authTag, plainText, null);
            return Encoding.UTF8.GetString(plainText);
        }

        private static string ExportPublicKey(RSA rsa)
        {
            var publicKeyBytes = rsa.ExportSubjectPublicKeyInfo();
            var base64 = Convert.ToBase64String(publicKeyBytes);
            var sb = new StringBuilder();
            sb.AppendLine("-----BEGIN PUBLIC KEY-----");

            for (var pos = 0; pos < base64.Length; pos += 64)
            {
                var chunk = base64[pos..Math.Min(pos + 64, base64.Length)];
                sb.AppendLine(chunk);
            }

            sb.AppendLine("-----END PUBLIC KEY-----");
            return sb.ToString();
        }

        public void Dispose()
        {
            _rsa?.Dispose();
        }
    }
}
