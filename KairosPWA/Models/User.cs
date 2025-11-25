using System.ComponentModel.DataAnnotations;

namespace KairosPWA.Models
{
    public class User
    {
        [Key]
        public int IdUser { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string State { get; set; }
        public int RolId { get; set; }
        public Rol Rol { get; set; }
    }
}
