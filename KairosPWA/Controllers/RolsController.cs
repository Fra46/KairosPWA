using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KairosPWA.Data;
using KairosPWA.DTOs;

namespace KairosPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
    }
}
