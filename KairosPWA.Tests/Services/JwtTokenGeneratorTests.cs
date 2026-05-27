using KairosPWA.Enums;
using KairosPWA.JWT;
using KairosPWA.Models;
using Microsoft.Extensions.Configuration;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Xunit;

namespace KairosPWA.Tests.Services
{
    public class JwtTokenGeneratorTests
    {
        private readonly Mock<IConfiguration> _configMock;
        private readonly JwtTokenGenerator _jwtTokenGenerator;

        public JwtTokenGeneratorTests()
        {
            _configMock = new Mock<IConfiguration>();
            _configMock
                .Setup(c => c["JwtSettings:Key"])
                .Returns("ThisIsAVeryLongSecretKeyThatIsAtLeast32BytesForHS256Algorithm!");
            _configMock
                .Setup(c => c["JwtSettings:Issuer"])
                .Returns("KairosPWA");
            _configMock
                .Setup(c => c["JwtSettings:Audience"])
                .Returns("KairosPWAUsers");
            _configMock
                .Setup(c => c["JwtSettings:DurationInMinutes"])
                .Returns("60");

            _jwtTokenGenerator = new JwtTokenGenerator(_configMock.Object);
        }

        private Rol CreateRol(int id = 1, string name = "Admin")
        {
            return new Rol
            {
                IdRol = id,
                Name = name,
                Permission = "All"
            };
        }

        private User CreateUser(string userName = "testuser", int userId = 1, Rol? rol = null)
        {
            return new User
            {
                IdUser = userId,
                UserName = userName,
                Password = "hashedpassword",
                State = UserState.Activo.ToString(),
                RolId = rol?.IdRol ?? 1,
                Rol = rol ?? new Rol { IdRol = 1, Name = "Default", Permission = "" }
            };
        }

        [Fact]
        public void GenerateToken_WithValidUser_ReturnsValidJwt()
        {
            var rol = CreateRol();
            var user = CreateUser(rol: rol);

            var token = _jwtTokenGenerator.GenerateToken(user);

            Assert.NotNull(token);
            Assert.NotEmpty(token);

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadToken(token) as JwtSecurityToken;

            Assert.NotNull(jwtToken);
            Assert.Equal("KairosPWA", jwtToken!.Issuer);
        }

        [Fact]
        public void GenerateToken_IncludesUserNameInClaims()
        {
            var rol = CreateRol();
            var user = CreateUser("myuser", rol: rol);

            var token = _jwtTokenGenerator.GenerateToken(user);

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadToken(token) as JwtSecurityToken;

            var subClaim = jwtToken!.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);

            Assert.NotNull(subClaim);
            Assert.Equal("myuser", subClaim!.Value);
        }

        [Fact]
        public void GenerateToken_IncludesUserIdInClaims()
        {
            var rol = CreateRol();
            var user = CreateUser("user", userId: 42, rol: rol);

            var token = _jwtTokenGenerator.GenerateToken(user);

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadToken(token) as JwtSecurityToken;

            var idClaim = jwtToken!.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            Assert.NotNull(idClaim);
            Assert.Equal("42", idClaim!.Value);
        }

        [Fact]
        public void GenerateToken_IncludesRoleInClaims()
        {
            var rol = CreateRol(1, "Manager");
            var user = CreateUser(rol: rol);

            var token = _jwtTokenGenerator.GenerateToken(user);

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadToken(token) as JwtSecurityToken;

            var roleClaim = jwtToken!.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);

            Assert.NotNull(roleClaim);
            Assert.Equal("Manager", roleClaim!.Value);
        }

        [Fact]
        public void GenerateToken_WithoutRole_StillGeneratesToken()
        {
            var user = new User
            {
                IdUser = 1,
                UserName = "user",
                Password = "hashedpassword",
                State = UserState.Activo.ToString(),
                RolId = 1,
                Rol = null
            };

            var token = _jwtTokenGenerator.GenerateToken(user);

            Assert.NotNull(token);
            Assert.NotEmpty(token);

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadToken(token) as JwtSecurityToken;

            var roleClaim = jwtToken!.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);

            Assert.Null(roleClaim);
        }

        [Fact]
        public void GenerateToken_NoKeyConfigured_ThrowsInvalidOperationException()
        {
            _configMock
                .Setup(c => c["JwtSettings:Key"])
                .Returns((string?)null);

            var user = CreateUser();

            var exception = Assert.Throws<InvalidOperationException>(() => _jwtTokenGenerator.GenerateToken(user));

            Assert.Equal("JwtSettings:Key no está configurada.", exception.Message);
        }

        [Fact]
        public void GenerateToken_EmptyKeyConfigured_ThrowsInvalidOperationException()
        {
            _configMock
                .Setup(c => c["JwtSettings:Key"])
                .Returns("");

            var user = CreateUser();

            var exception = Assert.Throws<InvalidOperationException>(() => _jwtTokenGenerator.GenerateToken(user));

            Assert.Equal("JwtSettings:Key no está configurada.", exception.Message);
        }

        [Fact]
        public void GenerateToken_KeyTooShort_ThrowsInvalidOperationException()
        {
            _configMock
                .Setup(c => c["JwtSettings:Key"])
                .Returns("Short");

            var user = CreateUser();

            var exception = Assert.Throws<InvalidOperationException>(() => _jwtTokenGenerator.GenerateToken(user));

            Assert.Equal("JwtSettings:Key debe tener al menos 32 bytes (256 bits).", exception.Message);
        }

        [Fact]
        public void GenerateToken_ContainsJti()
        {
            var rol = CreateRol();
            var user = CreateUser(rol: rol);

            var token = _jwtTokenGenerator.GenerateToken(user);

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadToken(token) as JwtSecurityToken;

            var jtiClaim = jwtToken!.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti);

            Assert.NotNull(jtiClaim);
            Assert.NotEmpty(jtiClaim!.Value);
            Assert.True(Guid.TryParse(jtiClaim.Value, out _));
        }

        [Fact]
        public void GenerateToken_ExpiryIsSet()
        {
            var rol = CreateRol();
            var user = CreateUser(rol: rol);

            var token = _jwtTokenGenerator.GenerateToken(user);

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadToken(token) as JwtSecurityToken;

            Assert.True(jwtToken!.ValidTo > DateTime.UtcNow);
        }

        [Fact]
        public void GenerateToken_InvalidDurationFallsBackTo60Minutes()
        {
            _configMock
                .Setup(c => c["JwtSettings:DurationInMinutes"])
                .Returns("notanumber");

            var rol = CreateRol();
            var user = CreateUser(rol: rol);

            var beforeToken = DateTime.UtcNow;
            var token = _jwtTokenGenerator.GenerateToken(user);

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadToken(token) as JwtSecurityToken;

            var expectedMinExpiry = beforeToken.AddMinutes(59);
            var expectedMaxExpiry = beforeToken.AddMinutes(61);

            Assert.True(jwtToken!.ValidTo >= expectedMinExpiry && jwtToken.ValidTo <= expectedMaxExpiry);
        }

        [Fact]
        public void GenerateToken_CustomDurationInMinutes()
        {
            _configMock
                .Setup(c => c["JwtSettings:DurationInMinutes"])
                .Returns("120");

            var rol = CreateRol();
            var user = CreateUser(rol: rol);

            var beforeToken = DateTime.UtcNow;
            var token = _jwtTokenGenerator.GenerateToken(user);

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadToken(token) as JwtSecurityToken;

            var expectedMinExpiry = beforeToken.AddMinutes(119);
            var expectedMaxExpiry = beforeToken.AddMinutes(121);

            Assert.True(jwtToken!.ValidTo >= expectedMinExpiry && jwtToken.ValidTo <= expectedMaxExpiry);
        }
    }
}
