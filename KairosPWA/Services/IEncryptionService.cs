using KairosPWA.DTOs;

namespace KairosPWA.Services
{
    public interface IEncryptionService
    {
        string GetPublicKeyPem();
        string DecryptPayload(EncryptedPayloadDTO payload);
    }
}
