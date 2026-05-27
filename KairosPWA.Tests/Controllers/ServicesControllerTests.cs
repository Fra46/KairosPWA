using KairosPWA.Controllers;
using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace KairosPWA.Tests.Controllers
{
    public class ServicesControllerTests : IDisposable
    {
        private readonly ConnectionContext _context;
        private readonly ServicesController _controller;

        public ServicesControllerTests()
        {
            var options = new DbContextOptionsBuilder<ConnectionContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ConnectionContext(options);
            _controller = new ServicesController(_context);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        [Fact]
        public async Task GetServices_ReturnsOkResult()
        {
            _context.Services.Add(new Service
            {
                Name = "Consulta",
                Description = "General",
                State = "Activo"
            });

            await _context.SaveChangesAsync();

            var result = await _controller.GetServices();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var services = Assert.IsAssignableFrom<IEnumerable<ServiceDTO>>(okResult.Value);

            Assert.Single(services);
        }

        [Fact]
        public async Task PostService_ValidService_ReturnsCreated()
        {
            var dto = new ServiceDTO
            {
                Name = "Nuevo Servicio",
                Description = "Desc",
                State = "Activo"
            };

            var result = await _controller.PostService(dto);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedDto = Assert.IsType<ServiceDTO>(created.Value);

            Assert.Equal("Nuevo Servicio", returnedDto.Name);
        }

        [Fact]
        public async Task PutService_ServiceNotFound_ReturnsNotFound()
        {
            var dto = new ServiceDTO
            {
                Name = "Edit",
                Description = "Edit",
                State = "Activo"
            };

            var result = await _controller.PutService(999, dto);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteService_ServiceExists_ReturnsNoContent()
        {
            var service = new Service
            {
                Name = "Eliminar",
                Description = "Desc",
                State = "Activo"
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            var result = await _controller.DeleteService(service.IdService);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteService_ServiceNotFound_ReturnsNotFound()
        {
            var result = await _controller.DeleteService(999);

            Assert.IsType<NotFoundResult>(result);
        }
    }
}