using System.ComponentModel.DataAnnotations;

namespace KairosPWA.DTOs
{
    public class ServiceDTO
    {
        public int IdService { get; set; }

        [Required(ErrorMessage = "El nombre del servicio es obligatorio.")]
        [StringLength(100, ErrorMessage = "El nombre del servicio no puede superar 100 caracteres.")]
        public string Name { get; set; }

        [StringLength(200, ErrorMessage = "La descripción no puede superar 200 caracteres.")]
        public string Description { get; set; }

        [Required(ErrorMessage = "El estado del servicio es obligatorio.")]
        [StringLength(20, ErrorMessage = "El estado del servicio no puede superar 20 caracteres.")]
        public string State { get; set; }
    }
}

