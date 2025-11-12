using System.ComponentModel.DataAnnotations;

namespace KairosPWA.Models
{
    public class Rol
    {
        [Key]
        public int IdRol { get; set; }
        public string Name { get; set; }
        public string Permission { get; set; }
    }
}
