using KairosPWA.Controllers;
using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Reflection;
using System.Threading;
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

        private class FailingConnectionContext : ConnectionContext
        {
            private readonly string _databaseName;
            private readonly bool _removeServiceBeforeThrow;

            public FailingConnectionContext(DbContextOptions<ConnectionContext> options, string databaseName, bool removeServiceBeforeThrow)
                : base(options)
            {
                _databaseName = databaseName;
                _removeServiceBeforeThrow = removeServiceBeforeThrow;
            }

            public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            {
                if (_removeServiceBeforeThrow)
                {
                    var service = Services.Local.FirstOrDefault();
                    if (service != null)
                    {
                        Entry(service).State = EntityState.Detached;

                        var options = new DbContextOptionsBuilder<ConnectionContext>()
                            .UseInMemoryDatabase(_databaseName)
                            .Options;

                        await using var cleanupContext = new ConnectionContext(options);
                        var existing = await cleanupContext.Services.FindAsync(service.IdService);
                        if (existing != null)
                        {
                            cleanupContext.Services.Remove(existing);
                            await cleanupContext.SaveChangesAsync(cancellationToken);
                        }
                    }
                }

                throw new DbUpdateConcurrencyException();
            }
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
        public async Task PutService_InvalidModel_ReturnsBadRequest()
        {
            _controller.ModelState.AddModelError("x", "error");

            var dto = new ServiceDTO
            {
                Name = "Edit",
                Description = "Edit",
                State = "Activo"
            };

            var result = await _controller.PutService(1, dto);

            Assert.IsType<BadRequestObjectResult>(result);
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
        public async Task PutService_ExistingService_ReturnsNoContent()
        {
            var service = new Service
            {
                Name = "Original",
                Description = "Desc",
                State = "Activo"
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            var dto = new ServiceDTO
            {
                Name = "Modificado",
                Description = "Desc Modificada",
                State = "Inactivo"
            };

            var result = await _controller.PutService(service.IdService, dto);

            Assert.IsType<NoContentResult>(result);
            var updatedService = await _context.Services.FindAsync(service.IdService);
            Assert.Equal("Modificado", updatedService!.Name);
            Assert.Equal("Inactivo", updatedService.State);
        }

        [Fact]
        public async Task PutService_ExistingService_ThrowsOnDbConcurrencyException()
        {
            var dbName = Guid.NewGuid().ToString();
            var options = new DbContextOptionsBuilder<ConnectionContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            var service = new Service
            {
                Name = "Original",
                Description = "Desc",
                State = "Activo"
            };

            await using (var seedContext = new ConnectionContext(options))
            {
                seedContext.Services.Add(service);
                await seedContext.SaveChangesAsync();
            }

            await using var context = new FailingConnectionContext(options, dbName, false);
            var controller = new ServicesController(context);
            var dto = new ServiceDTO
            {
                Name = "Modificado",
                Description = "Desc Modificada",
                State = "Inactivo"
            };

            await Assert.ThrowsAsync<DbUpdateConcurrencyException>(async () =>
                await controller.PutService(service.IdService, dto));
        }

        [Fact]
        public async Task PutService_ExistingService_ReturnsNotFoundWhenServiceMissingAfterConcurrencyException()
        {
            var dbName = Guid.NewGuid().ToString();
            var options = new DbContextOptionsBuilder<ConnectionContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            var service = new Service
            {
                Name = "Original",
                Description = "Desc",
                State = "Activo"
            };

            await using (var seedContext = new ConnectionContext(options))
            {
                seedContext.Services.Add(service);
                await seedContext.SaveChangesAsync();
            }

            await using var context = new FailingConnectionContext(options, dbName, true);
            var controller = new ServicesController(context);
            var dto = new ServiceDTO
            {
                Name = "Modificado",
                Description = "Desc Modificada",
                State = "Inactivo"
            };

            var result = await controller.PutService(service.IdService, dto);
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task PostService_InvalidModel_ReturnsBadRequest()
        {
            _controller.ModelState.AddModelError("x", "error");

            var dto = new ServiceDTO
            {
                Name = "Nuevo Servicio",
                Description = "Desc",
                State = "Activo"
            };

            var result = await _controller.PostService(dto);

            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task ServiceExists_PrivateMethod_WorksViaReflection()
        {
            var service = new Service
            {
                Name = "Test",
                Description = "Desc",
                State = "Activo"
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            var method = typeof(ServicesController)
                .GetMethod("ServiceExists", BindingFlags.Instance | BindingFlags.NonPublic);

            Assert.NotNull(method);

            var existsResult = (bool)(method!
                .Invoke(_controller, new object[] { service.IdService }) ?? false);
            Assert.True(existsResult);

            var notExistsResult = (bool)(method!
                .Invoke(_controller, new object[] { service.IdService + 1 }) ?? false);
            Assert.False(notExistsResult);
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