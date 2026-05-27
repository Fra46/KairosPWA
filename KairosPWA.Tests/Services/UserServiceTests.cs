using AutoMapper;
using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.Enums;
using KairosPWA.Models;
using KairosPWA.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace KairosPWA.Tests.Services
{
    public class UserServiceTests : IDisposable
    {
        private readonly ConnectionContext _context;
        private readonly Mock<IMapper> _mapperMock;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            var options = new DbContextOptionsBuilder<ConnectionContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new ConnectionContext(options);

            _mapperMock = new Mock<IMapper>();
            _mapperMock
                .Setup(m => m.Map<User>(It.IsAny<UserCreateDTO>()))
                .Returns((UserCreateDTO dto) => new User
                {
                    UserName = dto.Name?.Trim() ?? string.Empty,
                    Password = dto.Password,
                    State = dto.State,
                    RolId = dto.RolId
                });

            _mapperMock
                .Setup(m => m.Map<UserDTO>(It.IsAny<User>()))
                .Returns((User user) => new UserDTO
                {
                    IdUser = user.IdUser,
                    Name = user.UserName,
                    RolId = user.RolId,
                    RolName = user.Rol?.Name ?? string.Empty,
                    State = user.State
                });

            _mapperMock
                .Setup(m => m.Map<List<UserDTO>>(It.IsAny<object>()))
                .Returns((object source) => ((IEnumerable<User>)source)
                    .Select(user => new UserDTO
                    {
                        IdUser = user.IdUser,
                        Name = user.UserName,
                        RolId = user.RolId,
                        RolName = user.Rol?.Name ?? string.Empty,
                        State = user.State
                    })
                    .ToList());

            _userService = new UserService(_context, _mapperMock.Object);
        }

        public void Dispose() => _context.Dispose();

        private async Task<Rol> AddRolAsync(int id = 1, string name = "Admin")
        {
            var rol = new Rol
            {
                IdRol = id,
                Name = name,
                Permission = "All"
            };

            _context.Rols.Add(rol);
            await _context.SaveChangesAsync();
            return rol;
        }

        private async Task<Service> AddServiceAsync(int id = 1, string name = "Consulta")
        {
            var service = new Service
            {
                IdService = id,
                Name = name,
                Description = "Servicio de prueba",
                State = "Activo"
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();
            return service;
        }

        private async Task<User> AddUserAsync(string userName = "testuser", string password = "Password123", string state = "Activo", int rolId = 1)
        {
            var rol = await AddRolAsync(rolId);
            var user = new User
            {
                UserName = userName,
                Password = BCrypt.Net.BCrypt.HashPassword(password),
                State = state,
                RolId = rol.IdRol,
                Rol = rol
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        [Fact]
        public async Task RegisterUserAsync_CreatesUserAndReturnsDto()
        {
            var rol = await AddRolAsync();

            var createDto = new UserCreateDTO
            {
                Name = "NuevaUsuario",
                Password = "Secret1",
                State = UserState.Activo.ToString(),
                RolId = rol.IdRol
            };

            var result = await _userService.RegisterUserAsync(createDto);

            Assert.NotNull(result);
            Assert.Equal("NuevaUsuario", result.Name);
            Assert.Equal(UserState.Activo.ToString(), result.State);
            Assert.Equal(rol.IdRol, result.RolId);
            Assert.Equal(rol.Name, result.RolName);
            Assert.True(result.IdUser > 0);
            Assert.True(await _context.Users.AnyAsync(u => u.UserName == "NuevaUsuario"));
        }

        [Fact]
        public async Task RegisterUserAsync_ExistingUser_ThrowsException()
        {
            await AddUserAsync("usuarioExistente");
            var rol = await AddRolAsync(2, "User");

            var createDto = new UserCreateDTO
            {
                Name = "usuarioExistente",
                Password = "Secret1",
                State = UserState.Activo.ToString(),
                RolId = rol.IdRol
            };

            var exception = await Assert.ThrowsAsync<Exception>(() => _userService.RegisterUserAsync(createDto));

            Assert.Equal("Ya existe un usuario con este nombre de usuario.", exception.Message);
        }

        [Fact]
        public async Task RegisterUserAsync_EmptyStateDefaultsToActivo()
        {
            var rol = await AddRolAsync();

            var createDto = new UserCreateDTO
            {
                Name = "userWithDefaultState",
                Password = "Secret1",
                State = string.Empty,
                RolId = rol.IdRol
            };

            var result = await _userService.RegisterUserAsync(createDto);

            Assert.Equal(UserState.Activo.ToString(), result.State);
        }

        [Fact]
        public async Task GetAllUsersAsync_ReturnsMappedUsers()
        {
            await AddUserAsync("user1", "Pass1", UserState.Activo.ToString(), 1);
            await AddUserAsync("user2", "Pass2", UserState.Inactivo.ToString(), 2);

            var result = await _userService.GetAllUsersAsync();

            Assert.Equal(2, result.Count);
            Assert.Contains(result, u => u.Name == "user1");
            Assert.Contains(result, u => u.Name == "user2");
        }

        [Fact]
        public async Task GetUserByIdAsync_ReturnsUserDtoWhenExists()
        {
            var user = await AddUserAsync("buscarUser", "Pass1", UserState.Activo.ToString(), 1);

            var result = await _userService.GetUserByIdAsync(user.IdUser);

            Assert.NotNull(result);
            Assert.Equal(user.IdUser, result!.IdUser);
            Assert.Equal("buscarUser", result.Name);
        }

        [Fact]
        public async Task GetUserByIdAsync_ReturnsNullWhenNotFound()
        {
            var result = await _userService.GetUserByIdAsync(999);

            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateUserAsync_ReturnsFalseWhenUserMissing()
        {
            var editDto = new UserCreateDTO
            {
                Name = "noExiste",
                Password = "Secret1",
                State = UserState.Activo.ToString(),
                RolId = 1
            };

            var result = await _userService.UpdateUserAsync(999, editDto);

            Assert.False(result);
        }

        [Fact]
        public async Task UpdateUserAsync_UpdatesFieldsAndPassword()
        {
            var user = await AddUserAsync("actualizar", "OldPass1", UserState.Activo.ToString(), 1);
            var newRol = await AddRolAsync(2, "User");

            var editDto = new UserCreateDTO
            {
                Name = "actualizado",
                Password = "NewPass123",
                State = UserState.Inactivo.ToString(),
                RolId = newRol.IdRol
            };

            var result = await _userService.UpdateUserAsync(user.IdUser, editDto);

            Assert.True(result);

            var updated = await _context.Users.FindAsync(user.IdUser);

            Assert.NotNull(updated);
            Assert.Equal("actualizado", updated!.UserName);
            Assert.Equal(UserState.Inactivo.ToString(), updated.State);
            Assert.Equal(newRol.IdRol, updated.RolId);
            Assert.True(BCrypt.Net.BCrypt.Verify("NewPass123", updated.Password));
        }

        [Fact]
        public async Task UpdateUserAsync_DoesNotChangePasswordWhenEmpty()
        {
            var user = await AddUserAsync("sinCambio", "OldPass1", UserState.Activo.ToString(), 1);

            var editDto = new UserCreateDTO
            {
                Name = "sinCambio",
                Password = string.Empty,
                State = UserState.Activo.ToString(),
                RolId = 1
            };

            var result = await _userService.UpdateUserAsync(user.IdUser, editDto);

            Assert.True(result);

            var updated = await _context.Users.FindAsync(user.IdUser);

            Assert.NotNull(updated);
            Assert.Equal(user.Password, updated!.Password);
        }

        [Fact]
        public async Task UpdateUserAsync_InvalidStateThrowsArgumentException()
        {
            var user = await AddUserAsync("estadoInvalido", "Pass1", UserState.Activo.ToString(), 1);

            var editDto = new UserCreateDTO
            {
                Name = "estadoInvalido",
                Password = "",
                State = "EstadoMal",
                RolId = 1
            };

            await Assert.ThrowsAsync<ArgumentException>(() => _userService.UpdateUserAsync(user.IdUser, editDto));
        }

        [Fact]
        public async Task DeleteUserAsync_RemovesUserWhenExists()
        {
            var user = await AddUserAsync("borrarUser", "Pass1", UserState.Activo.ToString(), 1);

            var result = await _userService.DeleteUserAsync(user.IdUser);

            Assert.True(result);
            Assert.False(await _context.Users.AnyAsync(u => u.IdUser == user.IdUser));
        }

        [Fact]
        public async Task DeleteUserAsync_ReturnsFalseWhenMissing()
        {
            var result = await _userService.DeleteUserAsync(999);

            Assert.False(result);
        }

        [Fact]
        public async Task AuthenticateUserAsync_ReturnsUserWhenCredentialsAreValid()
        {
            var user = await AddUserAsync("loginUser", "SecretPass1", UserState.Activo.ToString(), 1);

            var result = await _userService.AuthenticateUserAsync(" loginUser ", "SecretPass1");

            Assert.NotNull(result);
            Assert.Equal(user.IdUser, result!.IdUser);
            Assert.Equal(user.UserName, result.UserName);
        }

        [Fact]
        public async Task AuthenticateUserAsync_ReturnsNullWhenPasswordIsInvalid()
        {
            await AddUserAsync("loginFail", "SecretPass1", UserState.Activo.ToString(), 1);

            var result = await _userService.AuthenticateUserAsync("loginFail", "WrongPass");

            Assert.Null(result);
        }

        [Fact]
        public async Task AuthenticateUserAsync_ReturnsNullWhenUserNotFound()
        {
            var result = await _userService.AuthenticateUserAsync("noExiste", "Secret1");

            Assert.Null(result);
        }

        [Fact]
        public async Task RegisterManagedTurnAsync_CreatesAndIncrementsCounter()
        {
            var user = await AddUserAsync("contadorUser", "Secret1", UserState.Activo.ToString(), 1);
            var service = await AddServiceAsync();

            await _userService.RegisterManagedTurnAsync(user.IdUser, service.IdService);
            await _userService.RegisterManagedTurnAsync(user.IdUser, service.IdService);

            var counter = await _context.UserServiceTurnCounters.FirstOrDefaultAsync(c => c.UserId == user.IdUser && c.ServiceId == service.IdService);

            Assert.NotNull(counter);
            Assert.Equal(2, counter!.ContTurns);
        }

        [Fact]
        public async Task GetUserServiceTurnCountersAsync_ReturnsCounterDtos()
        {
            var user = await AddUserAsync("counterUsuario", "Secret1", UserState.Activo.ToString(), 1);
            var service = await AddServiceAsync();

            await _userService.RegisterManagedTurnAsync(user.IdUser, service.IdService);

            var results = await _userService.GetUserServiceTurnCountersAsync();

            Assert.Single(results);
            Assert.Equal(user.IdUser, results[0].UserId);
            Assert.Equal(user.UserName, results[0].UserName);
            Assert.Equal(service.IdService, results[0].ServiceId);
            Assert.Equal(service.Name, results[0].ServiceName);
            Assert.Equal(1, results[0].ContTurns);
        }

        [Fact]
        public async Task GetUserByUserNameAsync_ReturnsUserWhenExists()
        {
            var user = await AddUserAsync("usuarioNombre", "Secret1", UserState.Activo.ToString(), 1);

            var result = await _userService.GetUserByUserNameAsync(" usuarioNombre ");

            Assert.NotNull(result);
            Assert.Equal(user.IdUser, result!.IdUser);
            Assert.Equal(user.UserName, result.UserName);
        }
    }
}
