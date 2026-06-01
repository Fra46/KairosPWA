using KairosPWA.Controllers;
using KairosPWA.DTOs;
using KairosPWA.Models;
using KairosPWA.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Xunit;

namespace KairosPWA.Tests.Controllers
{
    public class TurnsControllerTests
    {
        private readonly Mock<ITurnService> _turnServiceMock;
        private readonly Mock<IUserService> _userServiceMock;
        private readonly Mock<IEncryptionService> _encryptionServiceMock;
        private readonly TurnsController _controller;

        public TurnsControllerTests()
        {
            _turnServiceMock = new Mock<ITurnService>();
            _userServiceMock = new Mock<IUserService>();
            _encryptionServiceMock = new Mock<IEncryptionService>();

            _controller = new TurnsController(
                _turnServiceMock.Object,
                _userServiceMock.Object,
                _encryptionServiceMock.Object
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
            var dto = new TurnCreateDTO { ClientId = 1, ServiceId = 1 };
            var response = new TurnDTO { Number = 10 };

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
            var dto = new PublicTurnCreateDTO { ClientDocument = "123", ClientName = "Juan", ServiceId = 1 };
            var response = new TurnDTO { Number = 5 };

            _turnServiceMock
                .Setup(x => x.CreatePublicTurnAsync(dto))
                .ReturnsAsync(response);

            var result = await _controller.CreatePublicTurn(dto);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task CreatePublicTurn_InvalidModel_ReturnsBadRequest()
        {
            _controller.ModelState.AddModelError("x", "error");

            var dto = new PublicTurnCreateDTO();
            var result = await _controller.CreatePublicTurn(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task CreatePublicTurn_Exception_ReturnsBadRequest()
        {
            var dto = new PublicTurnCreateDTO { ClientDocument = "123", ServiceId = 1 };

            _turnServiceMock
                .Setup(x => x.CreatePublicTurnAsync(dto))
                .ThrowsAsync(new Exception("Error de prueba"));

            var result = await _controller.CreatePublicTurn(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }
        [Fact]
        public async Task CreatePublicTurnEncrypted_ReturnsOk()
        {
            var encryptedPayload = new EncryptedPayloadDTO
            {
                EncryptedKey = "abc",
                IV = "def",
                CipherText = "ghi",
                AuthTag = "jkl"
            };

            var decryptedJson = "{\"clientDocument\":\"12345678\",\"clientName\":\"Test\",\"serviceId\":1,\"priority\":\"Normal\",\"clientDocumentType\":\"cedula\"}";
            var dto = new PublicTurnCreateDTO
            {
                ClientDocument = "12345678",
                ClientName = "Test",
                ServiceId = 1,
                Priority = "Normal",
                ClientDocumentType = "cedula"
            };
            var createdTurn = new TurnDTO { Number = 7 };

            _encryptionServiceMock
                .Setup(x => x.DecryptPayload(encryptedPayload))
                .Returns(decryptedJson);

            _turnServiceMock
                .Setup(x => x.CreatePublicTurnAsync(It.IsAny<PublicTurnCreateDTO>()))
                .ReturnsAsync(createdTurn);

            var result = await _controller.CreatePublicTurnEncrypted(encryptedPayload);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<TurnDTO>(okResult.Value);
            Assert.Equal(7, returnValue.Number);
        }
        [Fact]
        public async Task CancelPublicTurn_NotFound_ReturnsNotFound()
        {
            var dto = new PublicTurnCancelDTO { ClientDocument = "123", ServiceId = 1 };

            _turnServiceMock
                .Setup(x => x.CancelPublicTurnAsync(dto))
                .ReturnsAsync(false);

            var result = await _controller.CancelPublicTurn(dto);

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task CancelPublicTurn_Success_ReturnsOk()
        {
            var dto = new PublicTurnCancelDTO { ClientDocument = "123", ServiceId = 1 };

            _turnServiceMock
                .Setup(x => x.CancelPublicTurnAsync(dto))
                .ReturnsAsync(true);

            var result = await _controller.CancelPublicTurn(dto);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetPending_All_ReturnsOk()
        {
            var pending = new List<TurnDTO> { new TurnDTO { Number = 1 } };

            _turnServiceMock
                .Setup(x => x.GetAllPendingTurnsAsync())
                .ReturnsAsync(pending);

            var result = await _controller.GetPending();

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetPending_ByService_ReturnsOk()
        {
            var pending = new List<TurnDTO> { new TurnDTO { Number = 2 } };

            _turnServiceMock
                .Setup(x => x.GetPendingTurnsByServiceAsync(1))
                .ReturnsAsync(pending);

            var result = await _controller.GetPending(1);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetPending_ByServiceZero_ReturnsAllPending()
        {
            var all = new List<TurnDTO> { new TurnDTO { Number = 1 } };

            _turnServiceMock
                .Setup(x => x.GetAllPendingTurnsAsync())
                .ReturnsAsync(all);

            var result = await _controller.GetPending(0);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetServiceSummary_ReturnsOk()
        {
            var summary = new ServiceQueueSummaryDTO { PendingCount = 3 };

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
        public async Task GetPublicTurnStatus_InvalidDocument_ReturnsBadRequest()
        {
            var result = await _controller.GetPublicTurnStatus("   ", 1);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task GetPublicTurnStatus_InvalidServiceId_ReturnsBadRequest()
        {
            var result = await _controller.GetPublicTurnStatus("123", 0);

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
        public async Task GetPublicTurnStatus_TurnExists_ReturnsOkWithTurn()
        {
            var dto = new TurnDTO { Number = 5 };

            _turnServiceMock
                .Setup(x => x.GetPendingTurnForClientAsync("123", 1))
                .ReturnsAsync(dto);

            var result = await _controller.GetPublicTurnStatus("123", 1);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ok.Value);
        }

        [Fact]
        public async Task GetRecentCalled_DefaultCount_ReturnsOk()
        {
            var turns = new List<TurnDTO> { new TurnDTO { Number = 1 } };

            _turnServiceMock
                .Setup(x => x.GetRecentCalledTurnsAsync(20))
                .ReturnsAsync(turns);

            var result = await _controller.GetRecentCalled(20);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetRecentCalled_ZeroCount_ClampsTo20()
        {
            var turns = new List<TurnDTO>();

            _turnServiceMock
                .Setup(x => x.GetRecentCalledTurnsAsync(20))
                .ReturnsAsync(turns);

            var result = await _controller.GetRecentCalled(0);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetRecentCalled_OverMaxCount_ClampsTo100()
        {
            var turns = new List<TurnDTO>();

            _turnServiceMock
                .Setup(x => x.GetRecentCalledTurnsAsync(100))
                .ReturnsAsync(turns);

            var result = await _controller.GetRecentCalled(200);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetCurrentByService_NotFound_ReturnsNotFound()
        {
            _turnServiceMock
                .Setup(x => x.GetCurrentTurnByServiceAsync(1))
                .ReturnsAsync((TurnDTO?)null);

            var result = await _controller.GetCurrentByService(1);

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetCurrentByService_ReturnsOk()
        {
            var dto = new TurnDTO { Number = 99 };

            _turnServiceMock
                .Setup(x => x.GetCurrentTurnByServiceAsync(1))
                .ReturnsAsync(dto);

            var result = await _controller.GetCurrentByService(1);

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
                HttpContext = new DefaultHttpContext { User = principal }
            };

            var dto = new TurnDTO { Number = 50 };

            _turnServiceMock
                .Setup(x => x.AdvanceTurnByServiceAsync(1, 1))
                .ReturnsAsync(dto);

            var result = await _controller.AdvanceTurnByService(1, null);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task AdvanceTurnByService_WithSubClaim_UsesUserNameLookup_ReturnsOk()
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, "juan")
            };

            var identity = new ClaimsIdentity(claims);
            var principal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };

            _userServiceMock
                .Setup(x => x.GetUserByUserNameAsync("juan"))
                .ReturnsAsync(new User { IdUser = 7, UserName = "juan" });

            var dto = new TurnDTO { Number = 50 };

            _turnServiceMock
                .Setup(x => x.AdvanceTurnByServiceAsync(1, 7))
                .ReturnsAsync(dto);

            var result = await _controller.AdvanceTurnByService(1, null);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task AdvanceTurnByService_WithSubClaim_UserNotFound_ReturnsUnauthorized()
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, "juan")
            };

            var identity = new ClaimsIdentity(claims);
            var principal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };

            _userServiceMock
                .Setup(x => x.GetUserByUserNameAsync("juan"))
                .ReturnsAsync((User?)null);

            var result = await _controller.AdvanceTurnByService(1, null);

            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task AdvanceTurnByService_WithBodyUserId_ReturnsOk()
        {
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var request = new AdvanceTurnRequestDTO { UserId = 5 };
            var dto = new TurnDTO { Number = 10 };

            _turnServiceMock
                .Setup(x => x.AdvanceTurnByServiceAsync(1, 5))
                .ReturnsAsync(dto);

            var result = await _controller.AdvanceTurnByService(1, request);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task AdvanceTurnByService_NoPendingTurns_ReturnsOkMessage()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "1")
            };
            var principal = new ClaimsPrincipal(new ClaimsIdentity(claims));
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };

            _turnServiceMock
                .Setup(x => x.AdvanceTurnByServiceAsync(1, 1))
                .ReturnsAsync((TurnDTO?)null);

            var result = await _controller.AdvanceTurnByService(1, null);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task CompleteCurrentTurn_NoUser_ReturnsUnauthorized()
        {
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var result = await _controller.CompleteCurrentTurn(1, null);

            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task CompleteCurrentTurn_WithClaim_NoCurrentTurn_ReturnsOkMessage()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "1")
            };
            var principal = new ClaimsPrincipal(new ClaimsIdentity(claims));
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };

            _turnServiceMock
                .Setup(x => x.CompleteCurrentTurnAsync(1, 1))
                .ReturnsAsync((TurnDTO?)null);

            var result = await _controller.CompleteCurrentTurn(1, null);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task CompleteCurrentTurn_WithClaim_Success_ReturnsOk()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "1")
            };
            var principal = new ClaimsPrincipal(new ClaimsIdentity(claims));
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };

            var dto = new TurnDTO { Number = 3 };
            _turnServiceMock
                .Setup(x => x.CompleteCurrentTurnAsync(1, 1))
                .ReturnsAsync(dto);

            var result = await _controller.CompleteCurrentTurn(1, null);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task CompleteCurrentTurn_WithBodyUserId_ReturnsOk()
        {
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var request = new AdvanceTurnRequestDTO { UserId = 7 };
            var dto = new TurnDTO { Number = 4 };

            _turnServiceMock
                .Setup(x => x.CompleteCurrentTurnAsync(1, 7))
                .ReturnsAsync(dto);

            var result = await _controller.CompleteCurrentTurn(1, request);

            Assert.IsType<OkObjectResult>(result);
        }
    }
}