using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KairosPWA.Data;
using KairosPWA.Models;
using KairosPWA.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace KairosPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly ConnectionContext _context;

        public ServicesController(ConnectionContext context)
        {
            _context = context;
        }

        // GET: api/Services
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ServiceDTO>>> GetServices()
        {
            var services = await _context.Services
                .AsNoTracking()
                .Select(s => new ServiceDTO
                {
                    IdService = s.IdService,
                    Name = s.Name,
                    Description = s.Description,
                    State = s.State
                })
                .ToListAsync();

            return Ok(services);
        }

        // PUT: api/Services/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> PutService(int id, [FromBody] ServiceDTO serviceDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound();
            }

            // Actualizar solo campos permitidos
            service.Name = serviceDto.Name;
            service.Description = serviceDto.Description;
            service.State = serviceDto.State;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ServiceExists(id))
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

        // POST: api/Services
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<ServiceDTO>> PostService([FromBody] ServiceDTO serviceDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var service = new Service
            {
                Name = serviceDto.Name,
                Description = serviceDto.Description,
                State = serviceDto.State
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            serviceDto.IdService = service.IdService;

            return CreatedAtAction(nameof(GetServices), new { id = service.IdService }, serviceDto);
        }

        // DELETE: api/Services/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound();
            }

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ServiceExists(int id)
        {
            return _context.Services.Any(e => e.IdService == id);
        }
    }
}
