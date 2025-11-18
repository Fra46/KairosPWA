using System.ComponentModel.DataAnnotations;


namespace KairosPWA.DTOs

{
    public class TurnDTO
    {
        public int IdTurn { get; set; }
        public int Number { get; set; }
        public DateTime FechaHora { get; set; }
        public string State { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; }
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
    }

    public class TurnCreateDTO
    {
        [Range(1, int.MaxValue, ErrorMessage = "El número de turno debe ser mayor que cero.")]
        public int Number { get; set; }

        [Required(ErrorMessage = "El estado del turno es obligatorio.")]
        [StringLength(20, ErrorMessage = "El estado del turno no puede superar 20 caracteres.")]
        public string State { get; set; }

        [Required(ErrorMessage = "El cliente es obligatorio.")]
        [Range(1, int.MaxValue, ErrorMessage = "El Id de cliente debe ser mayor que cero.")]
        public int ClientId { get; set; }

        [Required(ErrorMessage = "El servicio es obligatorio.")]
        [Range(1, int.MaxValue, ErrorMessage = "El Id de servicio debe ser mayor que cero.")]
        public int ServiceId { get; set; }
    }


}
