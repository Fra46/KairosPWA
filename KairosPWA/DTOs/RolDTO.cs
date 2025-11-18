using System.ComponentModel.DataAnnotations;

namespace KairosPWA.DTOs
{
    public class RolDTO
    {
        public int IdRol { get; set; }

        [Required(ErrorMessage = "El nombre del rol es obligatorio.")]
        [StringLength(50, ErrorMessage = "El nombre del rol no puede superar 50 caracteres.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "El permiso es obligatorio.")]
        [StringLength(200, ErrorMessage = "El permiso no puede superar 200 caracteres.")]
        public string Permission { get; set; }
    }

}
