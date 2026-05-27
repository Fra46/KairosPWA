using KairosPWA.Controllers;
using KairosPWA.DTOs;
using KairosPWA.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace KairosPWA.Tests.Controllers
{
    public class ClientsControllerTests
    {
        private readonly Mock<IClientService> _clientServiceMock;
        private readonly ClientsController _controller;

        public ClientsControllerTests()
        {
            _clientServiceMock = new Mock<IClientService>();
            _controller = new ClientsController(_clientServiceMock.Object);
        }

        [Fact]
        public async Task GetClients_ReturnsOk()
        {
            var clients = new List<ClientDTO>
            {
                new ClientDTO { IdClient = 1, Name = "Juan", Id = "12345678", State = "Activo" },
                new ClientDTO { IdClient = 2, Name = "Maria", Id = "87654321", State = "Activo" }
            };

            _clientServiceMock
                .Setup(x => x.GetAllClientsAsync())
                .ReturnsAsync(clients);

            var result = await _controller.GetClients();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsAssignableFrom<IEnumerable<ClientDTO>>(ok.Value);
            Assert.Equal(2, data.Count());
        }

        [Fact]
        public async Task GetClient_NotFound_ReturnsNotFound()
        {
            _clientServiceMock
                .Setup(x => x.GetClientByIdAsync(1))
                .ReturnsAsync((ClientDTO?)null);

            var result = await _controller.GetClient(1);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetClient_Found_ReturnsOk()
        {
            var dto = new ClientDTO { IdClient = 1, Name = "Juan", Id = "12345678", State = "Activo" };

            _clientServiceMock
                .Setup(x => x.GetClientByIdAsync(1))
                .ReturnsAsync(dto);

            var result = await _controller.GetClient(1);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var client = Assert.IsType<ClientDTO>(ok.Value);
            Assert.Equal("Juan", client.Name);
        }

        [Fact]
        public async Task GetClientByDocument_Found_ReturnsOk()
        {
            var dto = new ClientDTO { IdClient = 1, Name = "Pedro", Id = "11223344", State = "Activo" };

            _clientServiceMock
                .Setup(x => x.GetClientByDocumentAsync("11223344"))
                .ReturnsAsync(dto);

            var result = await _controller.GetClientByDocument("11223344");

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<ClientDTO>(ok.Value);
        }

        [Fact]
        public async Task GetClientByDocument_NotFound_ReturnsNotFound()
        {
            _clientServiceMock
                .Setup(x => x.GetClientByDocumentAsync("00000000"))
                .ReturnsAsync((ClientDTO?)null);

            var result = await _controller.GetClientByDocument("00000000");

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task PutClient_IdMismatch_ReturnsBadRequest()
        {
            var dto = new ClientDTO { IdClient = 2, Name = "Ana", Id = "12345678", State = "Activo" };

            var result = await _controller.PutClient(1, dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task PutClient_NotFound_ReturnsNotFound()
        {
            var dto = new ClientDTO { IdClient = 1, Name = "Ana", Id = "12345678", State = "Activo" };

            _clientServiceMock
                .Setup(x => x.UpdateClientAsync(1, dto))
                .ReturnsAsync(false);

            var result = await _controller.PutClient(1, dto);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task PutClient_Success_ReturnsNoContent()
        {
            var dto = new ClientDTO { IdClient = 1, Name = "Ana", Id = "12345678", State = "Activo" };

            _clientServiceMock
                .Setup(x => x.UpdateClientAsync(1, dto))
                .ReturnsAsync(true);

            var result = await _controller.PutClient(1, dto);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task PostClient_ReturnsCreated()
        {
            var dto = new ClientDTO { Name = "Nuevo", Id = "99887766", State = "Activo" };
            var created = new ClientDTO { IdClient = 5, Name = "Nuevo", Id = "99887766", State = "Activo" };

            _clientServiceMock
                .Setup(x => x.CreateClientAsync(dto))
                .ReturnsAsync(created);

            var result = await _controller.PostClient(dto);

            Assert.IsType<CreatedAtActionResult>(result.Result);
        }

        [Fact]
        public async Task DeleteClient_NotFound_ReturnsNotFound()
        {
            _clientServiceMock
                .Setup(x => x.DeleteClientAsync(1))
                .ReturnsAsync(false);

            var result = await _controller.DeleteClient(1);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteClient_Exists_ReturnsNoContent()
        {
            _clientServiceMock
                .Setup(x => x.DeleteClientAsync(1))
                .ReturnsAsync(true);

            var result = await _controller.DeleteClient(1);

            Assert.IsType<NoContentResult>(result);
        }
    }
}