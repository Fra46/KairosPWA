using System.ComponentModel.DataAnnotations;

namespace KairosPWA.Models
{
    public class Service
    {
        [Key]
        public int IdService { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string State { get; set; } = null!;
    }
}
