using Microsoft.EntityFrameworkCore;
using KairosPWA.Data;
using KairosPWA.Models;

namespace KairosPWA.Services
{
    public class RolService
    {
        private readonly ConnectionContext _context;

        public RolService(ConnectionContext context)
        {
            _context = context;
        }

        public async Task<Rol> CreateRoleAsync(Rol rol)
        {
            _context.Rols.Add(rol);
            await _context.SaveChangesAsync();
            return rol;
        }

        public async Task<List<Rol>> GetAllRolesAsync()
        {
            return await _context.Rols.ToListAsync();
        }

        public async Task<Rol?> GetRoleByIdAsync(int id)
        {
            return await _context.Rols.FindAsync(id);
        }

        public async Task<bool> UpdateRoleAsync(int id, Rol updatedRole)
        {
            var rol = await _context.Rols.FindAsync(id);
            if (rol == null) return false;
            rol.Name = updatedRole.Name;
            rol.Permission = updatedRole.Permission;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteRoleAsync(int id)
        {
            var rol = await _context.Rols.FindAsync(id);
            if (rol == null) return false;
            _context.Rols.Remove(rol);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RoleExistsAsync(string name)
        {
            return await _context.Rols.AnyAsync(r => r.Name == name);
        }

        public async Task<bool> UserHasRoleAsync(int userId, string roleName)
        {
            var user = await _context.Users.Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.IdUser == userId);
            if (user == null || user.Rol == null) return false;
            return user.Rol.Name == roleName;
        }

        public async Task<List<Rol>> GetRolesWithPermissionAsync(string permission)
        {
            return await _context.Rols.Where(r => r.Permission == permission).ToListAsync();
        }
    }
}
