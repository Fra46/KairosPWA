using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace KairosPWA.Models
{
    [ExcludeFromCodeCoverage]
    public class UserServiceTurnCounter
    {
        [Key]
        public int IdUserServiceTurnCounter { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int ServiceId { get; set; }
        public Service Service { get; set; } = null!;

        public int ContTurns { get; set; }
    }
}
