using KairosPWA.DTOs;
using KairosPWA.Services;
using System.Security.Cryptography;
using System.Text;
using Xunit;

namespace KairosPWA.Tests.Services
{
    public class EncryptionServiceTests
    {
        [Fact]
        public void GetPublicKeyPem_ReturnsValidPem()
        {
            using var service = new EncryptionService();
            var publicKey = service.GetPublicKeyPem();

            Assert.StartsWith("-----BEGIN PUBLIC KEY-----", publicKey);
            Assert.Contains("-----END PUBLIC KEY-----", publicKey);
        }

        [Fact]
        public void DecryptPayload_WithEncryptedPayload_ReturnsOriginalText()
        {
            using var service = new EncryptionService();
            var publicKeyPem = service.GetPublicKeyPem();

            using var publicRsa = RSA.Create();
            publicRsa.ImportFromPem(publicKeyPem);

            var plainText = "{\"clientDocument\":\"12345678\",\"clientName\":\"Test\",\"serviceId\":1,\"priority\":\"Normal\",\"clientDocumentType\":\"cedula\"}";
            var plainBytes = Encoding.UTF8.GetBytes(plainText);
            var aesKey = RandomNumberGenerator.GetBytes(32);
            var iv = RandomNumberGenerator.GetBytes(12);
            var cipherText = new byte[plainBytes.Length];
            var authTag = new byte[16];

            using (var aesGcm = new AesGcm(aesKey, 16))
            {
                aesGcm.Encrypt(iv, plainBytes, cipherText, authTag);
            }

            var encryptedKey = publicRsa.Encrypt(aesKey, RSAEncryptionPadding.OaepSHA256);

            var payload = new EncryptedPayloadDTO
            {
                EncryptedKey = Convert.ToBase64String(encryptedKey),
                IV = Convert.ToBase64String(iv),
                CipherText = Convert.ToBase64String(cipherText),
                AuthTag = Convert.ToBase64String(authTag),
            };

            var decrypted = service.DecryptPayload(payload);
            Assert.Equal(plainText, decrypted);
        }
    }
}
