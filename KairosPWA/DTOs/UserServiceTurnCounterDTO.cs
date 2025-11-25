namespace KairosPWA.DTOs
{
    public class UserServiceTurnCounterDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; }

        public int ServiceId { get; set; }
        public string ServiceName { get; set; }

        public int ContTurns { get; set; }
    }
}
