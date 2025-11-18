using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace KairosPWA.JWT
{
    public class JwtTokenGenerator
    {
        private readonly IConfiguration _config;

        public JwtTokenGenerator(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(string userName, string role)
        {
            var keyString = _config["JwtSettings:Key"];

            if (string.IsNullOrWhiteSpace(keyString))
                throw new InvalidOperationException("JwtSettings:Key no está configurada.");

            var keyBytes = Encoding.UTF8.GetBytes(keyString);

            if (keyBytes.Length < 32)
                throw new InvalidOperationException("JwtSettings:Key debe tener al menos 32 bytes (256 bits).");

            var securityKey = new SymmetricSecurityKey(keyBytes);
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, userName)
            };

            if (!string.IsNullOrWhiteSpace(role))
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var issuer = _config["JwtSettings:Issuer"];
            var audience = _config["JwtSettings:Audience"];

            var durationConfig = _config["JwtSettings:DurationInMinutes"];
            if (!double.TryParse(durationConfig, out double durationInMinutes))
            {
                durationInMinutes = 60;
            }

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(durationInMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
