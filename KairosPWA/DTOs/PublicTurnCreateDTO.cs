using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace KairosPWA.DTOs
{
    [ExcludeFromCodeCoverage]
    public class PublicTurnCreateDTO
    {
        [Required(ErrorMessage = "El documento del cliente es obligatorio.")]
        public string ClientDocument { get; set; } = string.Empty;

        [Required(ErrorMessage = "El nombre del cliente es obligatorio.")]
        public string ClientName { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = "El servicio es obligatorio.")]
        public int ServiceId { get; set; }

        public string Priority { get; set; } = "Normal";
        public string ClientDocumentType { get; set; } = "cedula";
    }
}