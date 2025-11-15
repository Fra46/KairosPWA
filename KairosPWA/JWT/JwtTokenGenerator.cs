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

        public string GenerateToken(string user, string? rol = null)
        {
            var key = Encoding.UTF8.GetBytes(_config["JwtSettings:Key"]);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user)
            };

            if (!string.IsNullOrWhiteSpace(rol))
            {
                claims.Add(new Claim(ClaimTypes.Role, rol));
            }

            var token = new JwtSecurityToken(
                issuer: _config["JwtSettings:Issuer"],
                audience: _config["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(_config["JwtSettings:DurationInMinutes"])),
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
