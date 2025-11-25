using AutoMapper;
using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.Enums;
using KairosPWA.Models;
using Microsoft.EntityFrameworkCore;

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
            // Usamos Name como UserName (nombre de login)
            var normalizedName = userCreateDto.Name.Trim();

            var exists = await _context.Users
                .AnyAsync(u => u.UserName == normalizedName);

            if (exists)
                throw new Exception("Ya existe un usuario con este nombre de usuario.");

            var userEntity = _mapper.Map<User>(userCreateDto);

            userEntity.UserName = normalizedName;

            if (string.IsNullOrWhiteSpace(userEntity.State))
            {
                userEntity.State = UserState.Activo.ToString();
            }

            userEntity.Password = BCrypt.Net.BCrypt.HashPassword(userCreateDto.Password);

            _context.Users.Add(userEntity);
            await _context.SaveChangesAsync();

            await _context.Entry(userEntity).Reference(u => u.Rol).LoadAsync();

            return _mapper.Map<UserDTO>(userEntity);
        }

        public async Task<List<UserDTO>> GetAllUsersAsync()
        {
            var users = await _context.Users
                .Include(u => u.Rol)
                .ToListAsync();

            return _mapper.Map<List<UserDTO>>(users);
        }

        public async Task<UserDTO?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.IdUser == id);

            return user != null ? _mapper.Map<UserDTO>(user) : null;
        }

        public async Task<bool> UpdateUserAsync(int id, UserCreateDTO editDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            var normalizedName = editDto.Name.Trim();

            user.UserName = normalizedName;

            if (!string.IsNullOrWhiteSpace(editDto.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(editDto.Password);
            }

            if (!string.IsNullOrWhiteSpace(editDto.State))
            {
                if (!Enum.TryParse<UserState>(editDto.State, ignoreCase: true, out var stateEnum))
                {
                    throw new ArgumentException("Estado de usuario inválido.");
                }

                user.State = stateEnum.ToString();
            }

            user.RolId = editDto.RolId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UserExistsAsync(string name)
        {
            var normalizedName = name.Trim();
            return await _context.Users.AnyAsync(u => u.UserName == normalizedName);
        }

        public async Task<bool> ChangePasswordAsync(int id, string newPassword)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<User?> AuthenticateUserAsync(string username, string password)
        {
            var normalizedUser = username.Trim();

            var user = await _context.Users
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.UserName == normalizedUser);

            if (user == null)
                return null;

            var passwordValid = BCrypt.Net.BCrypt.Verify(password, user.Password);
            if (!passwordValid)
                return null;

            return user;
        }

        public async Task RegisterManagedTurnAsync(int userId, int serviceId)
        {
            var registro = await _context.UserServiceTurnCounters
                .FirstOrDefaultAsync(r => r.UserId == userId && r.ServiceId == serviceId);

            if (registro == null)
            {
                registro = new UserServiceTurnCounter
                {
                    UserId = userId,
                    ServiceId = serviceId,
                    ContTurns = 1
                };

                _context.UserServiceTurnCounters.Add(registro);
            }
            else
            {
                registro.ContTurns++;
                _context.UserServiceTurnCounters.Update(registro);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<UserServiceTurnCounterDTO>> GetUserServiceTurnCountersAsync()
        {
            var query = from c in _context.UserServiceTurnCounters
                        join u in _context.Users on c.UserId equals u.IdUser
                        join s in _context.Services on c.ServiceId equals s.IdService
                        select new UserServiceTurnCounterDTO
                        {
                            UserId = u.IdUser,
                            UserName = u.UserName,
                            ServiceId = s.IdService,
                            ServiceName = s.Name,
                            ContTurns = c.ContTurns
                        };

            return await query.ToListAsync();
        }

        public async Task<User?> GetUserByUserNameAsync(string userName)
        {
            var normalized = userName.Trim();
            return await _context.Users
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.UserName == normalized);
        }
    }
}
