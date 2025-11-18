using System.ComponentModel.DataAnnotations;

namespace KairosPWA.DTOs
{
    public class RegistroDTO
    {
        [Required(ErrorMessage = "El usuario es obligatorio.")]
        [StringLength(50, ErrorMessage = "El usuario no puede superar 50 caracteres.")]
        public string User { get; set; }

        [Required(ErrorMessage = "La contraseña es obligatoria.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
        public string Password { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [StringLength(100, ErrorMessage = "El nombre no puede superar 100 caracteres.")]
        public string Name { get; set; }
    }
}
