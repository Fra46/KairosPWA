namespace KairosPWA.Services
{
    public interface IUserService
    {
        Task RegisterManagedTurnAsync(int userId, int serviceId);
    }
}
