namespace KairosPWA.DTOs
{
    public class PublicTurnCreateDTO
    {
        public string ClientDocument { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public int ServiceId { get; set; }
    }
}