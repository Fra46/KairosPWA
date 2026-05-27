using System.Diagnostics.CodeAnalysis;

namespace KairosPWA.DTOs
{
    [ExcludeFromCodeCoverage]
    public class PublicTurnCreateDTO
    {
        public string ClientDocument { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public int ServiceId { get; set; }
        public string Priority { get; set; } = "Normal";
    }
}