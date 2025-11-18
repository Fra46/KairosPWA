using AutoMapper;
using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.JWT;
using KairosPWA.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KairosPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ConnectionContext _context;
        private readonly JwtTokenGenerator _jwtTokenGenerator;
        private readonly IMapper _mapper;

        public UsersController(ConnectionContext context, JwtTokenGenerator jwtTokenGenerator, IMapper autoMapper)
        {
            _context = context;
            _jwtTokenGenerator = jwtTokenGenerator;
            _mapper = autoMapper;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await _context.Users.Include(u => u.Rol).ToListAsync();
            var usersDto = _mapper.Map<List<UserDTO>>(users);
            return usersDto;
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            var user = await _context.Users.Include(u => u.Rol).FirstOrDefaultAsync(u => u.IdUser == id);

            if (user == null)
            {
                return NotFound();
            }

            var dto = _mapper.Map<UserDTO>(user);
            return dto;
        }

        // PUT: api/Users/5
        // Receive a DTO to avoid overposting
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, UserCreateDTO userDto)
        {

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Update only allowed fields
            user.Name = userDto.Name;
            if (!string.IsNullOrWhiteSpace(userDto.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password);
            }
            user.State = userDto.State;
            user.RolId = userDto.RolId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Users
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<UserDTO>> PostUser(UserCreateDTO userDto)
        {
            userDto.Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password);
            var userEntidad = _mapper.Map<User>(userDto);

            _context.Users.Add(userEntidad);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (UserExists(userEntidad.IdUser))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }
            await _context.Entry(userEntidad).Reference(u => u.Rol).LoadAsync();

            var responseDto = _mapper.Map<UserDTO>(userEntidad);
            return CreatedAtAction("GetUser", new { id = userEntidad.IdUser },
                        responseDto);
        }

        [HttpPost("Login")]
        public async Task<ActionResult> Login([FromBody] LoginDTO loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(p => p.Name == loginDto.User);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
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


        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.IdUser == id);
        }
    }
}
