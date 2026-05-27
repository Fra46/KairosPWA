using KairosPWA.Models;

namespace KairosPWA.JWT
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}