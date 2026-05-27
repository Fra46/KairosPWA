using KairosPWA.DTOs;
using KairosPWA.Models;

namespace KairosPWA.Services
{
    public interface IUserService
    {
        Task RegisterManagedTurnAsync(int userId, int serviceId);
        Task<UserDTO> RegisterUserAsync(UserCreateDTO userCreateDto);
        Task<List<UserDTO>> GetAllUsersAsync();
        Task<UserDTO?> GetUserByIdAsync(int id);
        Task<bool> UpdateUserAsync(int id, UserCreateDTO editDto);
        Task<bool> DeleteUserAsync(int id);
        Task<User?> AuthenticateUserAsync(string username, string password);
        Task<List<UserServiceTurnCounterDTO>> GetUserServiceTurnCountersAsync();
        Task<User?> GetUserByUserNameAsync(string userName);
    }
}