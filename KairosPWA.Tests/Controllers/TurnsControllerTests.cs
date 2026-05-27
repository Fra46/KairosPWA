using KairosPWA.Controllers;
using KairosPWA.DTOs;
using KairosPWA.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;
using Xunit;

namespace KairosPWA.Tests.Controllers
{
    public class TurnsControllerTests
    {
        private readonly Mock<TurnService> _turnServiceMock;
        private readonly Mock<UserService> _userServiceMock;
        private readonly TurnsController _controller;

        public TurnsControllerTests()
        {
            _turnServiceMock = new Mock<TurnService>();
            _userServiceMock = new Mock<UserService>();

            _controller = new TurnsController(
                _turnServiceMock.Object,
                _userServiceMock.Object
            );
        }

        [Fact]
        public async Task GetTurns_ReturnsOk()
        {
            var turns = new List<TurnDTO>
            {
                new TurnDTO { Number = 1 },
                new TurnDTO { Number = 2 }
            };

            _turnServiceMock
                .Setup(x => x.GetAllTurnsAsync())
                .ReturnsAsync(turns);

            var result = await _controller.GetTurns();

            var ok = Assert.IsType<OkObjectResult>(result.Result);

            var data = Assert.IsAssignableFrom<IEnumerable<TurnDTO>>(ok.Value);

            Assert.Equal(2, data.Count());
        }

        [Fact]
        public async Task PostTurn_InvalidModel_ReturnsBadRequest()
        {
            _controller.ModelState.AddModelError("x", "error");

            var dto = new TurnCreateDTO();

            var result = await _controller.PostTurn(dto);

            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task PostTurn_Valid_ReturnsOk()
        {
            var dto = new TurnCreateDTO
            {
                ClientId = 1,
                ServiceId = 1
            };

            var response = new TurnDTO
            {
                Number = 10
            };

            _turnServiceMock
                .Setup(x => x.CreateTurnAsync(dto))
                .ReturnsAsync(response);

            var result = await _controller.PostTurn(dto);

            var ok = Assert.IsType<OkObjectResult>(result.Result);

            var data = Assert.IsType<TurnDTO>(ok.Value);

            Assert.Equal(10, data.Number);
        }

        [Fact]
        public async Task PostTurn_Exception_ReturnsBadRequest()
        {
            var dto = new TurnCreateDTO();

            _turnServiceMock
                .Setup(x => x.CreateTurnAsync(dto))
                .ThrowsAsync(new Exception("Error"));

            var result = await _controller.PostTurn(dto);

            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task CreatePublicTurn_ReturnsOk()
        {
            var dto = new PublicTurnCreateDTO
            {
                ClientDocument = "123",
                ClientName = "Juan",
                ServiceId = 1
            };

            var response = new TurnDTO
            {
                Number = 5
            };

            _turnServiceMock
                .Setup(x => x.CreatePublicTurnAsync(dto))
                .ReturnsAsync(response);

            var result = await _controller.CreatePublicTurn(dto);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task CancelPublicTurn_NotFound_ReturnsNotFound()
        {
            var dto = new PublicTurnCancelDTO
            {
                ClientDocument = "123",
                ServiceId = 1
            };

            _turnServiceMock
                .Setup(x => x.CancelPublicTurnAsync(dto))
                .ReturnsAsync(false);

            var result = await _controller.CancelPublicTurn(dto);

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task CancelPublicTurn_Success_ReturnsOk()
        {
            var dto = new PublicTurnCancelDTO
            {
                ClientDocument = "123",
                ServiceId = 1
            };

            _turnServiceMock
                .Setup(x => x.CancelPublicTurnAsync(dto))
                .ReturnsAsync(true);

            var result = await _controller.CancelPublicTurn(dto);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetPending_All_ReturnsOk()
        {
            var pending = new List<TurnDTO>
            {
                new TurnDTO { Number = 1 }
            };

            _turnServiceMock
                .Setup(x => x.GetAllPendingTurnsAsync())
                .ReturnsAsync(pending);

            var result = await _controller.GetPending();

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetPending_ByService_ReturnsOk()
        {
            var pending = new List<TurnDTO>
            {
                new TurnDTO { Number = 2 }
            };

            _turnServiceMock
                .Setup(x => x.GetPendingTurnsByServiceAsync(1))
                .ReturnsAsync(pending);

            var result = await _controller.GetPending(1);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetServiceSummary_ReturnsOk()
        {
            var summary = new ServiceQueueSummaryDTO
            {
                PendingCount = 3
            };

            _turnServiceMock
                .Setup(x => x.GetServiceQueueSummaryAsync(1))
                .ReturnsAsync(summary);

            var result = await _controller.GetServiceSummary(1);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetPublicTurnStatus_InvalidParams_ReturnsBadRequest()
        {
            var result = await _controller.GetPublicTurnStatus("", 0);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task GetPublicTurnStatus_NoTurn_ReturnsOkNull()
        {
            _turnServiceMock
                .Setup(x => x.GetPendingTurnForClientAsync("123", 1))
                .ReturnsAsync((TurnDTO?)null);

            var result = await _controller.GetPublicTurnStatus("123", 1);

            var ok = Assert.IsType<OkObjectResult>(result);

            Assert.Null(ok.Value);
        }

        [Fact]
        public async Task GetCurrentByService_NotFound_ReturnsNotFound()
        {
            _turnServiceMock
                .Setup(x => x.GetCurrentByServiceAsync(1, 1))
                .ReturnsAsync((TurnDTO?)null);

            var result = await _controller.GetCurrentByService(1, 1);

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetCurrentByService_ReturnsOk()
        {
            var dto = new TurnDTO
            {
                Number = 99
            };

            _turnServiceMock
                .Setup(x => x.GetCurrentByServiceAsync(1, 1))
                .ReturnsAsync(dto);

            var result = await _controller.GetCurrentByService(1, 1);

            var ok = Assert.IsType<OkObjectResult>(result.Result);

            var data = Assert.IsType<TurnDTO>(ok.Value);

            Assert.Equal(99, data.Number);
        }

        [Fact]
        public async Task AdvanceTurnByService_NoUser_ReturnsUnauthorized()
        {
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var result = await _controller.AdvanceTurnByService(1, null);

            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task AdvanceTurnByService_WithClaim_ReturnsOk()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "1")
            };

            var identity = new ClaimsIdentity(claims);
            var principal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = principal
                }
            };

            var dto = new TurnDTO
            {
                Number = 50
            };

            _turnServiceMock
                .Setup(x => x.AdvanceTurnByServiceAsync(1, 1))
                .ReturnsAsync(dto);

            var result = await _controller.AdvanceTurnByService(1, null);

            Assert.IsType<OkObjectResult>(result);
        }
    }
}