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
        public int Number { get; set; }
        public string State { get; set; }
        public int ClientId { get; set; }
        public int ServiceId { get; set; }
    }
}
