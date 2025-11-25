using System.ComponentModel.DataAnnotations;

namespace KairosPWA.Models
{
    public class UserServiceTurnCounter
    {
        [Key]
        public int IdUserServiceTurnCounter { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int ServiceId { get; set; }
        public Service Service { get; set; }

        public int ContTurns { get; set; }
    }
}
