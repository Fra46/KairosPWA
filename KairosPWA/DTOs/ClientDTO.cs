using System.ComponentModel.DataAnnotations;

namespace KairosPWA.DTOs
{
    public class ClientDTO
    {
        public int IdClient { get; set; }

        [Required(ErrorMessage = "El documento del cliente es obligatorio.")]
        [RegularExpression(@"^\d{7,10}$", ErrorMessage = "El documento del cliente debe tener entre 7 y 10 dígitos numéricos.")]
        [StringLength(10, MinimumLength = 7)]
        public string Id { get; set; }

        [Required(ErrorMessage = "El nombre del cliente es obligatorio.")]
        [StringLength(100, ErrorMessage = "El nombre del cliente no puede superar 100 caracteres.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "El estado del cliente es obligatorio.")]
        [StringLength(20, ErrorMessage = "El estado del cliente no puede superar 20 caracteres.")]
        public string State { get; set; }
    }

}
