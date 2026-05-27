using KairosPWA.Controllers;
using KairosPWA.Data;
using KairosPWA.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace KairosPWA.Tests.Controllers
{
    public class RolsControllerTests : IDisposable
    {
        private readonly ConnectionContext _context;
        private readonly RolsController _controller;

        public RolsControllerTests()
        {
            var options = new DbContextOptionsBuilder<ConnectionContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ConnectionContext(options);
            _controller = new RolsController(_context);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        [Fact]
        public async Task GetRols_ReturnsOkWithRoles()
        {
            _context.Rols.AddRange(
                new Rol
                {
                    Name = "Administrador",
                    Permission = "ALL"
                },
                new Rol
                {
                    Name = "Empleado",
                    Permission = "BASIC"
                }
            );

            await _context.SaveChangesAsync();

            var result = await _controller.GetRols();

            var ok = Assert.IsType<OkObjectResult>(result.Result);

            var roles = Assert.IsAssignableFrom<IEnumerable<object>>(ok.Value);

            Assert.Equal(2, roles.Count());
        }

        [Fact]
        public async Task GetRols_Empty_ReturnsEmptyList()
        {
            var result = await _controller.GetRols();

            var ok = Assert.IsType<OkObjectResult>(result.Result);

            var roles = Assert.IsAssignableFrom<IEnumerable<object>>(ok.Value);

            Assert.Empty(roles);
        }
    }
}