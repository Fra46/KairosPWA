namespace KairosPWA.DTOs
{
    public class ServiceQueueSummaryDTO
    {
        public int ServiceId { get; set; }
        public int? CurrentNumber { get; set; }  // null si no hay turno
        public int LastNumber { get; set; }      // 0 si nunca han pedido turnos
        public int PendingCount { get; set; }    // turnos Pendiente
    }
}
