using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace KairosPWA.DTOs
{
    [ExcludeFromCodeCoverage]
    public class UserDTO
    {
        public int IdUser { get; set; }

        [Required(ErrorMessage = "El nombre de usuario es obligatorio.")]
        [StringLength(100, ErrorMessage = "El nombre de usuario no puede superar 100 caracteres.")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "El estado del usuario es obligatorio.")]
        [StringLength(20, ErrorMessage = "El estado del usuario no puede superar 20 caracteres.")]
        public string State { get; set; } = null!;

        [Required(ErrorMessage = "El rol es obligatorio.")]
        [Range(1, int.MaxValue, ErrorMessage = "El Id de rol debe ser mayor que cero.")]
        public int RolId { get; set; }

        public string RolName { get; set; } = null!;
    }

    [ExcludeFromCodeCoverage]
    public class UserCreateDTO
    {
        [Required(ErrorMessage = "El nombre de usuario es obligatorio.")]
        [StringLength(100, ErrorMessage = "El nombre de usuario no puede superar 100 caracteres.")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "La contraseña es obligatoria.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
        public string Password { get; set; } = null!;

        [Required(ErrorMessage = "El estado del usuario es obligatorio.")]
        [StringLength(20, ErrorMessage = "El estado del usuario no puede superar 20 caracteres.")]
        public string State { get; set; } = null!;

        [Required(ErrorMessage = "El rol es obligatorio.")]
        [Range(1, int.MaxValue, ErrorMessage = "El Id de rol debe ser mayor que cero.")]
        public int RolId { get; set; }
    }


}
