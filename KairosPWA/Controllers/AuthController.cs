using KairosPWA.JWT;
using KairosPWA.Models;
using KairosPWA.Enums;
using KairosPWA.Services;
using Microsoft.AspNetCore.Mvc;

namespace KairosPWA.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly FirebaseAuthService _firebaseAuth;
        private readonly IUserService _userService;
        private readonly JwtTokenGenerator _jwtGenerator;
        private readonly IConfiguration _configuration;

        public AuthController(FirebaseAuthService firebaseAuth, IUserService userService, JwtTokenGenerator jwtGenerator, IConfiguration configuration)
        {
            _firebaseAuth = firebaseAuth;
            _userService = userService;
            _jwtGenerator = jwtGenerator;
            _configuration = configuration;
        }

        public class TokenRequest { public string IdToken { get; set; } = string.Empty; }

        [HttpPost("firebase")]
        public async Task<IActionResult> FirebaseSignIn([FromBody] TokenRequest req)
        {
            if (string.IsNullOrWhiteSpace(req?.IdToken)) return BadRequest(new { error = "idToken required" });

            var decoded = await _firebaseAuth.VerifyIdTokenAsync(req.IdToken);
            if (decoded == null) return Unauthorized(new { error = "Invalid Firebase token" });

            // Extraer email y displayName del token
            decoded.Claims.TryGetValue("email", out var emailObj);
            decoded.Claims.TryGetValue("name", out var nameObj);
            
            var email = emailObj?.ToString() ?? string.Empty;
            var displayName = nameObj?.ToString() ?? email;

            if (string.IsNullOrWhiteSpace(email)) 
                return BadRequest(new { error = "Email not found in Firebase token" });

            // Buscar usuario local por username = email
            var userEntity = await _userService.GetUserByUserNameAsync(email);

            // Si no existe, crear usuario automáticamente con rol por defecto (Empleado)
            if (userEntity == null)
            {
                var defaultRolId = _configuration.GetValue<int>("Firebase:DefaultRoleId", 2); // 2 = Empleado por defecto
                
                try
                {
                    await _userService.RegisterUserAsync(new DTOs.UserCreateDTO
                    {
                        Name = email,
                        Password = Guid.NewGuid().ToString(),
                        State = UserState.Activo.ToString(),
                        RolId = defaultRolId
                    });

                    userEntity = await _userService.GetUserByUserNameAsync(email);
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { error = "Error creating user: " + ex.Message });
                }
            }

            if (userEntity == null)
                return StatusCode(500, new { error = "Failed to create or retrieve user" });

            // Generar token JWT interno
            var token = _jwtGenerator.GenerateToken(userEntity);

            var userDto = new
            {
                id = userEntity.IdUser,
                idUser = userEntity.IdUser,
                userName = userEntity.UserName,
                name = userEntity.UserName,
                role = userEntity.Rol?.Name,
                roleName = userEntity.Rol?.Name,
                rolId = userEntity.RolId,
                state = userEntity.State
            };

            return Ok(new { user = userDto, token });
        }
    }
}
