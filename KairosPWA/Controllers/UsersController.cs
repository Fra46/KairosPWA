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
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/Users/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.IdUser)
            {
                return BadRequest();
            }

            _context.Entry(user).State = EntityState.Modified;

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
        public async Task<ActionResult<RegistroDTO>> Login(LoginDTO loginDto)
        {
            var user = await _context.Users
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(p => p.Name == loginDto.User);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                return Unauthorized("Usuario o contraseña incorrectos.");
            }

            var rolName = user.Rol?.Name;
            var token = _jwtTokenGenerator.GenerateToken(loginDto.User, rolName);
            return Ok(new { token, loginDto.User });
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
