using KairosPWA.Data;
using KairosPWA.Models;
using KairosPWA.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace KairosPWA.Tests.Services
{
    public class ServiceServiceTests : IDisposable
    {
        private readonly ConnectionContext _context;
        private readonly ServiceService _service;

        public ServiceServiceTests()
        {
            var options = new DbContextOptionsBuilder<ConnectionContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new ConnectionContext(options);
            _service = new ServiceService(_context);
        }

        public void Dispose() => _context.Dispose();

        [Fact]
        public async Task CreateServiceAsync_DefaultState_SetsDisponible()
        {
            var s = new Service { Name = "S1", Description = "D" };
            var created = await _service.CreateServiceAsync(s);
            Assert.NotEqual(0, created.IdService);
            Assert.Equal("Disponible", created.State);
        }

        [Fact]
        public async Task UpdateServiceAsync_InvalidState_Throws()
        {
            var created = await _service.CreateServiceAsync(new Service { Name = "S2", Description = "D" });
            var updated = new Service { Name = "S2-up", Description = "D2", State = "BadState" };
            await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateServiceAsync(created.IdService, updated));
        }

        [Fact]
        public async Task ServiceExistsAsync_Works()
        {
            await _service.CreateServiceAsync(new Service { Name = "Exists", Description = "D" });
            var exists = await _service.ServiceExistsAsync("Exists");
            Assert.True(exists);
            var not = await _service.ServiceExistsAsync("Nope");
            Assert.False(not);
        }

        [Fact]
        public async Task GetAllServicesAsync_ReturnsList()
        {
            await _service.CreateServiceAsync(new Service { Name = "G1", Description = "D" });
            await _service.CreateServiceAsync(new Service { Name = "G2", Description = "D" });
            var list = await _service.GetAllServicesAsync();
            Assert.True(list.Count >= 2);
        }

        [Fact]
        public async Task GetServiceByIdAsync_Returns()
        {
            var created = await _service.CreateServiceAsync(new Service { Name = "ById", Description = "D" });
            var s = await _service.GetServiceByIdAsync(created.IdService);
            Assert.NotNull(s);
            Assert.Equal(created.IdService, s!.IdService);
        }

        [Fact]
        public async Task UpdateServiceAsync_Valid_Updates()
        {
            var created = await _service.CreateServiceAsync(new Service { Name = "U1", Description = "D" });
            var updated = new Service { Name = "U1-up", Description = "D2", State = "Disponible" };
            var ok = await _service.UpdateServiceAsync(created.IdService, updated);
            Assert.True(ok);
            var inDb = await _context.Services.FindAsync(created.IdService);
            Assert.Equal("U1-up", inDb!.Name);
        }

        [Fact]
        public async Task DeleteServiceAsync_Works()
        {
            var created = await _service.CreateServiceAsync(new Service { Name = "Del", Description = "D" });
            var ok = await _service.DeleteServiceAsync(created.IdService);
            Assert.True(ok);
            Assert.Null(await _context.Services.FindAsync(created.IdService));
        }
    }
}
