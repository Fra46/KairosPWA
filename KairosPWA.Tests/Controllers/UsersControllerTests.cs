using KairosPWA.Controllers;
using KairosPWA.DTOs;
using KairosPWA.JWT;
using KairosPWA.Models;
using KairosPWA.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace KairosPWA.Tests.Controllers
{
    public class UsersControllerTests
    {
        private readonly Mock<UserService> _userServiceMock;
        private readonly Mock<JwtTokenGenerator> _jwtMock;
        private readonly UsersController _controller;

        public UsersControllerTests()
        {
            _userServiceMock = new Mock<UserService>();
            _jwtMock = new Mock<JwtTokenGenerator>();

            _controller = new UsersController(
                _userServiceMock.Object,
                _jwtMock.Object
            );
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsUnauthorized()
        {
            _userServiceMock
                .Setup(x => x.AuthenticateUserAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync((User?)null);

            var dto = new LoginDTO
            {
                UserName = "test",
                Password = "123"
            };

            var result = await _controller.Login(dto);

            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsOk()
        {
            var user = new User
            {
                IdUser = 1,
                UserName = "admin",
                Rol = new Rol
                {
                    Name = "Administrador"
                }
            };

            _userServiceMock
                .Setup(x => x.AuthenticateUserAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(user);

            _jwtMock
                .Setup(x => x.GenerateToken(It.IsAny<User>()))
                .Returns("fake-jwt");

            var dto = new LoginDTO
            {
                UserName = "admin",
                Password = "123"
            };

            var result = await _controller.Login(dto);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ok.Value);
        }

        [Fact]
        public async Task DeleteUser_NotFound_ReturnsNotFound()
        {
            _userServiceMock
                .Setup(x => x.DeleteUserAsync(1))
                .ReturnsAsync(false);

            var result = await _controller.DeleteUser(1);

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task DeleteUser_Exists_ReturnsNoContent()
        {
            _userServiceMock
                .Setup(x => x.DeleteUserAsync(1))
                .ReturnsAsync(true);

            var result = await _controller.DeleteUser(1);

            Assert.IsType<NoContentResult>(result);
        }
    }
}