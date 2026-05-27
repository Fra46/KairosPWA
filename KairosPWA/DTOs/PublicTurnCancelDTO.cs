using System.Diagnostics.CodeAnalysis;

namespace KairosPWA.DTOs
{
    [ExcludeFromCodeCoverage]
    public class PublicTurnCancelDTO
    {
        public string ClientDocument { get; set; } = string.Empty;
        public int ServiceId { get; set; }
    }
}
