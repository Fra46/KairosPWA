using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.Models;
using KairosPWA.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace KairosPWA.Tests.Services
{
    public class ClientServiceTests : IDisposable
    {
        private readonly ConnectionContext _context;
        private readonly ClientService _service;

        public ClientServiceTests()
        {
            var options = new DbContextOptionsBuilder<ConnectionContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new ConnectionContext(options);
            _service = new ClientService(_context);
        }

        public void Dispose() => _context.Dispose();

        [Fact]
        public async Task CreateClientAsync_DefaultState_SetsActivo()
        {
            var dto = new ClientDTO { Id = "999", Name = "Test" };
            var created = await _service.CreateClientAsync(dto);
            Assert.NotEqual(0, created.IdClient);
            Assert.Equal("Activo", created.State);
        }

        [Fact]
        public async Task GetClientByDocumentAsync_NotFound_ReturnsNull()
        {
            var result = await _service.GetClientByDocumentAsync("noexiste");
            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateClientAsync_InvalidState_Throws()
        {
            var added = await _service.CreateClientAsync(new ClientDTO { Id = "1000", Name = "A" });
            var dto = new ClientDTO { Name = "B", State = "InvalidState" };
            await Assert.ThrowsAsync<Exception>(() => _service.UpdateClientAsync(added.IdClient, dto));
        }

        [Fact]
        public async Task DeleteClientAsync_Works()
        {
            var added = await _service.CreateClientAsync(new ClientDTO { Id = "2000", Name = "C" });
            var deleted = await _service.DeleteClientAsync(added.IdClient);
            Assert.True(deleted);
            Assert.Null(await _context.Clients.FindAsync(added.IdClient));
        }

        [Fact]
        public async Task GetAllClientsAsync_ReturnsList()
        {
            await _service.CreateClientAsync(new ClientDTO { Id = "a1", Name = "A" });
            await _service.CreateClientAsync(new ClientDTO { Id = "a2", Name = "B" });
            var list = await _service.GetAllClientsAsync();
            Assert.True(list.Count >= 2);
        }

        [Fact]
        public async Task GetClientByIdAsync_ReturnsClient()
        {
            var created = await _service.CreateClientAsync(new ClientDTO { Id = "x1", Name = "X" });
            var dto = await _service.GetClientByIdAsync(created.IdClient);
            Assert.NotNull(dto);
            Assert.Equal(created.IdClient, dto!.IdClient);
        }

        [Fact]
        public async Task CreateClientAsync_WithState_PreservesState()
        {
            var dto = new ClientDTO { Id = "zzz", Name = "Z", State = "Inactivo" };
            var created = await _service.CreateClientAsync(dto);
            Assert.Equal("Inactivo", created.State);
        }

        [Fact]
        public async Task UpdateClientAsync_ValidState_Updates()
        {
            var created = await _service.CreateClientAsync(new ClientDTO { Id = "u1", Name = "U" });
            var dto = new ClientDTO { Name = "U2", State = "Inactivo" };
            var ok = await _service.UpdateClientAsync(created.IdClient, dto);
            Assert.True(ok);
            var inDb = await _context.Clients.FindAsync(created.IdClient);
            Assert.Equal("U2", inDb!.Name);
            Assert.Equal("Inactivo", inDb.State);
        }

        [Fact]
        public async Task GetClientByDocumentAsync_Found_ReturnsClient()
        {
            var created = await _service.CreateClientAsync(new ClientDTO { Id = "found1", Name = "Found" });
            var result = await _service.GetClientByDocumentAsync("found1");
            Assert.NotNull(result);
            Assert.Equal(created.IdClient, result!.IdClient);
        }

        [Fact]
        public async Task CreateClientAsync_InvalidState_Throws()
        {
            var dto = new ClientDTO { Id = "bad1", Name = "Bad", State = "NotAState" };
            await Assert.ThrowsAsync<Exception>(() => _service.CreateClientAsync(dto));
        }
    }
}
