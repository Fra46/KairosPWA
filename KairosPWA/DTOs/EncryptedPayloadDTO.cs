using System.Diagnostics.CodeAnalysis;

namespace KairosPWA.DTOs
{
    [ExcludeFromCodeCoverage]
    public class EncryptedPayloadDTO
    {
        public string EncryptedKey { get; set; } = string.Empty;
        public string IV { get; set; } = string.Empty;
        public string CipherText { get; set; } = string.Empty;
        public string AuthTag { get; set; } = string.Empty;
    }
}
