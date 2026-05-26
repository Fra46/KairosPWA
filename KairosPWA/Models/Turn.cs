    using System.ComponentModel.DataAnnotations;

namespace KairosPWA.Models
{
    public class Turn
    {
        [Key]
        public int IdTurn { get; set; }
        public int Number { get; set; }
        public DateTime FechaHora { get; set; }
        public string State { get; set; } = null!;
        public int ClientId { get; set; }
        public Client Client { get; set; } = null!;
        public int ServiceId { get; set; }
        public Service Service { get; set; } = null!;
    }
}
