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
        private readonly Mock<ClientService> _clientServiceMock;
        private readonly ClientsController _controller;

        public ClientsControllerTests()
        {
            _clientServiceMock = new Mock<ClientService>();
            _controller = new ClientsController(_clientServiceMock.Object);
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
            var dto = new ClientDTO
            {
                IdClient = 1,
                Name = "Juan"
            };

            _clientServiceMock
                .Setup(x => x.GetClientByIdAsync(1))
                .ReturnsAsync(dto);

            var result = await _controller.GetClient(1);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var client = Assert.IsType<ClientDTO>(ok.Value);

            Assert.Equal("Juan", client.Name);
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