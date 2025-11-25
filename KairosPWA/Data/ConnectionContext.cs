using KairosPWA.Models;
using Microsoft.EntityFrameworkCore;

namespace KairosPWA.Data
{
    public class ConnectionContext : DbContext
    {
        public ConnectionContext(DbContextOptions<ConnectionContext> options)
            : base(options)
        {
        }

        public DbSet<Client> Clients { get; set; }
        public DbSet<Rol> Rols { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Turn> Turns { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserServiceTurnCounter> UserServiceTurnCounters { get; set; }
    }
}
