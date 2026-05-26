using System.ComponentModel.DataAnnotations;

namespace KairosPWA.Models
{
    public class User
    {
        [Key]
        public int IdUser { get; set; }
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string State { get; set; } = null!;
        public int RolId { get; set; }
        public Rol Rol { get; set; } = null!;
    }
}
