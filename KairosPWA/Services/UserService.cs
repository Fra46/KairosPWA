using Microsoft.EntityFrameworkCore;
using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.Models;
using AutoMapper;

namespace KairosPWA.Services
{
    public class UserService
    {
        private readonly ConnectionContext _context;
        private readonly IMapper _mapper;

        public UserService(ConnectionContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<UserDTO> RegisterUserAsync(UserCreateDTO userCreateDto)
        {
            var exists = await _context.Users.AnyAsync(u => u.Name == userCreateDto.Name);
            if (exists) throw new Exception("Ya existe un usuario con este nombre.");

            userCreateDto.Password = BCrypt.Net.BCrypt.HashPassword(userCreateDto.Password);
            var userEntity = _mapper.Map<User>(userCreateDto);

            _context.Users.Add(userEntity);
            await _context.SaveChangesAsync();

            await _context.Entry(userEntity).Reference(u => u.Rol).LoadAsync();
            return _mapper.Map<UserDTO>(userEntity);
        }

        public async Task<List<UserDTO>> GetAllUsersAsync()
        {
            var users = await _context.Users.Include(u => u.Rol).ToListAsync();
            return _mapper.Map<List<UserDTO>>(users);
        }

        public async Task<UserDTO?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users.Include(u => u.Rol).FirstOrDefaultAsync(u => u.IdUser == id);
            return user != null ? _mapper.Map<UserDTO>(user) : null;
        }

        public async Task<bool> UpdateUserAsync(int id, UserCreateDTO editDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.Name = editDto.Name;
            user.Password = BCrypt.Net.BCrypt.HashPassword(editDto.Password);
            user.State = editDto.State;
            user.RolId = editDto.RolId;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UserExistsAsync(string name)
        {
            return await _context.Users.AnyAsync(u => u.Name == name);
        }

        public async Task<bool> ChangePasswordAsync(int id, string newPassword)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;
            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
