using AutoMapper;
using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.JWT;
using KairosPWA.Models;
using KairosPWA.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
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
        public async Task<ActionResult> Login([FromBody] LoginDTO loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userService.AuthenticateUserAsync(loginDto.User, loginDto.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Usuario o contraseña incorrectos." });
            }

            var rolName = user.Rol?.Name ?? "User";

            var token = _jwtTokenGenerator.GenerateToken(user.Name, rolName);

            return Ok(new
            {
                token,
                user = new
                {
                    id = user.IdUser,
                    name = user.Name,
                    userName = user.Name,
                    role = rolName
                }
            });
        }
    }
}
