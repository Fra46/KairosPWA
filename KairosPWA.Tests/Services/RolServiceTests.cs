using KairosPWA.Data;
using KairosPWA.Models;
using KairosPWA.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace KairosPWA.Tests.Services
{
    public class RolServiceTests : IDisposable
    {
        private readonly ConnectionContext _context;
        private readonly RolService _service;

        public RolServiceTests()
        {
            var options = new DbContextOptionsBuilder<ConnectionContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new ConnectionContext(options);
            _service = new RolService(_context);
        }

        public void Dispose() => _context.Dispose();

        [Fact]
        public async Task CreateRoleAsync_And_GetAll()
        {
            var r = new Rol { Name = "Admin", Permission = "All" };
            var created = await _service.CreateRoleAsync(r);
            Assert.NotEqual(0, created.IdRol);

            var all = await _service.GetAllRolesAsync();
            Assert.Contains(all, x => x.Name == "Admin");
        }

        [Fact]
        public async Task RoleExistsAsync_UserHasRole_Works()
        {
            var rol = await _service.CreateRoleAsync(new Rol { Name = "User", Permission = "Basic" });
            var user = new User { UserName = "u1", Password = "p", State = "Activo", RolId = rol.IdRol, Rol = rol };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var has = await _service.UserHasRoleAsync(user.IdUser, "User");
            Assert.True(has);
            var not = await _service.UserHasRoleAsync(9999, "User");
            Assert.False(not);
        }

        [Fact]
        public async Task GetRolesWithPermissionAsync_Works()
        {
            await _service.CreateRoleAsync(new Rol { Name = "R1", Permission = "P1" });
            await _service.CreateRoleAsync(new Rol { Name = "R2", Permission = "P2" });
            var list = await _service.GetRolesWithPermissionAsync("P1");
            Assert.Single(list);
            Assert.Equal("R1", list.First().Name);
        }

        [Fact]
        public async Task GetRoleByIdAsync_Update_Delete_Works()
        {
            var created = await _service.CreateRoleAsync(new Rol { Name = "Tmp", Permission = "X" });
            var byId = await _service.GetRoleByIdAsync(created.IdRol);
            Assert.NotNull(byId);

            var ok = await _service.UpdateRoleAsync(created.IdRol, new Rol { Name = "Tmp2", Permission = "Y" });
            Assert.True(ok);
            var inDb = await _context.Rols.FindAsync(created.IdRol);
            Assert.Equal("Tmp2", inDb!.Name);

            var del = await _service.DeleteRoleAsync(created.IdRol);
            Assert.True(del);
            Assert.Null(await _context.Rols.FindAsync(created.IdRol));
        }

        [Fact]
        public async Task RoleExistsAsync_Works()
        {
            await _service.CreateRoleAsync(new Rol { Name = "ExistsR", Permission = "P" });
            Assert.True(await _service.RoleExistsAsync("ExistsR"));
            Assert.False(await _service.RoleExistsAsync("Nope"));
        }
    }
}
