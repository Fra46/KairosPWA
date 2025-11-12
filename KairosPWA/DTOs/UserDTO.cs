namespace KairosPWA.DTOs
{
    public class UserDTO
    {
        public int IdUser { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public string State { get; set; }
        public int RolId { get; set; }
        public string RolName { get; set; }
    }

    public class UserCreateDTO
    {
        public string Name { get; set; }
        public string Password { get; set; }
        public string State { get; set; }
        public int RolId { get; set; }
    }
}
