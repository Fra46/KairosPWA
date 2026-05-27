using System.Diagnostics.CodeAnalysis;

namespace KairosPWA.DTOs
{
    [ExcludeFromCodeCoverage]
    public class UserServiceTurnCounterDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = null!;

        public int ServiceId { get; set; }
        public string ServiceName { get; set; } = null!;

        public int ContTurns { get; set; }
    }
}
