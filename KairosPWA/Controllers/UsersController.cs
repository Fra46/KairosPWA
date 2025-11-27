using AutoMapper;
using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.JWT;
using KairosPWA.Models;
using KairosPWA.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace KairosPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly JwtTokenGenerator _jwtTokenGenerator;

        public UsersController(UserService userService, JwtTokenGenerator jwtTokenGenerator)
        {
            _userService = userService;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        // GET: api/Users
        [HttpGet]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> PutUser(int id, [FromBody] UserCreateDTO userDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _userService.UpdateUserAsync(id, userDto);

            if (!updated)
                return NotFound();

            return NoContent();
        }

        // POST: api/Users
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<UserDTO>> PostUser([FromBody] UserCreateDTO userDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var createdUser = await _userService.RegisterUserAsync(userDto);

                return CreatedAtAction(nameof(GetUser),
                    new { id = createdUser.IdUser },
                    createdUser);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/Users/Login
        [HttpPost("Login")]
        [AllowAnonymous]
        public async Task<ActionResult> Login([FromBody] LoginDTO loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userService.AuthenticateUserAsync(loginDto.UserName, loginDto.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Usuario o contraseña incorrectos." });
            }

            var rolName = user.Rol?.Name ?? "User";

            var token = _jwtTokenGenerator.GenerateToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    id = user.IdUser,
                    name = user.UserName,
                    role = rolName
                }
            });
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var deleted = await _userService.DeleteUserAsync(id);
            if (!deleted) return NotFound(new { message = "Usuario no encontrado." });

            return NoContent();
        }

        [HttpGet("turns-by-service")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> GetTurnsByUserAndService()
        {
            var data = await _userService.GetUserServiceTurnCountersAsync();
            return Ok(data);
        }
    }
}
