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
        private readonly Mock<IUserService> _userServiceMock;
        private readonly Mock<IJwtTokenGenerator> _jwtMock;
        private readonly UsersController _controller;

        public UsersControllerTests()
        {
            _userServiceMock = new Mock<IUserService>();
            _jwtMock = new Mock<IJwtTokenGenerator>();

            _controller = new UsersController(
                _userServiceMock.Object,
                _jwtMock.Object
            );
        }

        [Fact]
        public async Task GetUsers_ReturnsOk()
        {
            var users = new List<UserDTO>
            {
                new UserDTO { IdUser = 1, Name = "admin" },
                new UserDTO { IdUser = 2, Name = "empleado" }
            };

            _userServiceMock
                .Setup(x => x.GetAllUsersAsync())
                .ReturnsAsync(users);

            var result = await _controller.GetUsers();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsAssignableFrom<IEnumerable<UserDTO>>(ok.Value);
            Assert.Equal(2, data.Count());
        }

        [Fact]
        public async Task GetUser_Found_ReturnsOk()
        {
            var dto = new UserDTO { IdUser = 1, Name = "admin" };

            _userServiceMock
                .Setup(x => x.GetUserByIdAsync(1))
                .ReturnsAsync(dto);

            var result = await _controller.GetUser(1);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<UserDTO>(ok.Value);
        }

        [Fact]
        public async Task GetUser_NotFound_ReturnsNotFound()
        {
            _userServiceMock
                .Setup(x => x.GetUserByIdAsync(999))
                .ReturnsAsync((UserDTO?)null);

            var result = await _controller.GetUser(999);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task PutUser_InvalidModel_ReturnsBadRequest()
        {
            _controller.ModelState.AddModelError("x", "error");

            var result = await _controller.PutUser(1, new UserCreateDTO());

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task PutUser_NotFound_ReturnsNotFound()
        {
            _userServiceMock
                .Setup(x => x.UpdateUserAsync(999, It.IsAny<UserCreateDTO>()))
                .ReturnsAsync(false);

            var dto = new UserCreateDTO { Name = "u", Password = "p", State = "Activo", RolId = 1 };
            var result = await _controller.PutUser(999, dto);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task PutUser_Success_ReturnsNoContent()
        {
            _userServiceMock
                .Setup(x => x.UpdateUserAsync(1, It.IsAny<UserCreateDTO>()))
                .ReturnsAsync(true);

            var dto = new UserCreateDTO { Name = "u", Password = "p", State = "Activo", RolId = 1 };
            var result = await _controller.PutUser(1, dto);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task PostUser_InvalidModel_ReturnsBadRequest()
        {
            _controller.ModelState.AddModelError("x", "error");

            var result = await _controller.PostUser(new UserCreateDTO());

            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task PostUser_Valid_ReturnsCreated()
        {
            var dto = new UserCreateDTO { Name = "nuevo", Password = "pass123", State = "Activo", RolId = 1 };
            var created = new UserDTO { IdUser = 10, Name = "nuevo" };

            _userServiceMock
                .Setup(x => x.RegisterUserAsync(dto))
                .ReturnsAsync(created);

            var result = await _controller.PostUser(dto);

            Assert.IsType<CreatedAtActionResult>(result.Result);
        }

        [Fact]
        public async Task PostUser_Exception_ReturnsBadRequest()
        {
            var dto = new UserCreateDTO { Name = "dup", Password = "pass123", State = "Activo", RolId = 1 };

            _userServiceMock
                .Setup(x => x.RegisterUserAsync(dto))
                .ThrowsAsync(new Exception("Ya existe un usuario con este nombre de usuario."));

            var result = await _controller.PostUser(dto);

            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task Login_InvalidModel_ReturnsBadRequest()
        {
            _controller.ModelState.AddModelError("x", "error");

            var result = await _controller.Login(new LoginDTO());

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsUnauthorized()
        {
            _userServiceMock
                .Setup(x => x.AuthenticateUserAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync((User?)null);

            var dto = new LoginDTO { UserName = "test", Password = "123456" };
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
                Rol = new Rol { Name = "Administrador" }
            };

            _userServiceMock
                .Setup(x => x.AuthenticateUserAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(user);

            _jwtMock
                .Setup(x => x.GenerateToken(It.IsAny<User>()))
                .Returns("fake-jwt");

            var dto = new LoginDTO { UserName = "admin", Password = "123456" };
            var result = await _controller.Login(dto);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ok.Value);
        }

        [Fact]
        public async Task Login_ValidCredentials_NullRole_ReturnsOk()
        {
            var user = new User
            {
                IdUser = 2,
                UserName = "sinrol",
                Rol = null!
            };

            _userServiceMock
                .Setup(x => x.AuthenticateUserAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(user);

            _jwtMock
                .Setup(x => x.GenerateToken(It.IsAny<User>()))
                .Returns("fake-jwt-no-role");

            var dto = new LoginDTO { UserName = "sinrol", Password = "123456" };
            var result = await _controller.Login(dto);

            Assert.IsType<OkObjectResult>(result);
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

        [Fact]
        public async Task GetTurnsByUserAndService_ReturnsOk()
        {
            var counters = new List<UserServiceTurnCounterDTO>
            {
                new UserServiceTurnCounterDTO { UserId = 1, UserName = "admin", ServiceId = 1, ServiceName = "Consulta", ContTurns = 5 }
            };

            _userServiceMock
                .Setup(x => x.GetUserServiceTurnCountersAsync())
                .ReturnsAsync(counters);

            var result = await _controller.GetTurnsByUserAndService();

            Assert.IsType<OkObjectResult>(result);
        }
    }
}