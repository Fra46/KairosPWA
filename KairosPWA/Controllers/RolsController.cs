using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KairosPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Administrador")]
    public class RolsController : ControllerBase
    {
        private readonly ConnectionContext _context;

        public RolsController(ConnectionContext context)
        {
            _context = context;
        }

        // GET: api/Rols
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RolDTO>>> GetRols()
        {
            var rols = await _context.Rols.ToListAsync();
            var rolDTOs = rols.Select(r => new RolDTO
            {
                IdRol = r.IdRol,
                Name = r.Name,
                Permission = r.Permission
            }).ToList();

            return Ok(rolDTOs);
        }

        // POST: api/Rols1
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Rol>> PostRol(Rol rol)
        {
            _context.Rols.Add(rol);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRols", new { id = rol.IdRol }, rol);
        }
    }
}
