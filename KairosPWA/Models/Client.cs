using System.ComponentModel.DataAnnotations;

namespace KairosPWA.Models
{
    public class Client
    {
        [Key]
        public int IdClient { get; set; }
        public string Id { get; set; }
        public string Name { get; set; }
        public string State { get; set; }
    }
}
