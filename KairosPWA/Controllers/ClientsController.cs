using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KairosPWA.Data;
using KairosPWA.Models;
using KairosPWA.DTOs;

namespace KairosPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly ConnectionContext _context;

        public ClientsController(ConnectionContext context)
        {
            _context = context;
        }

        // GET: api/Clients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientDTO>>> GetClients()
        {
            var clients = await _context.Clients.ToListAsync();

            var clientsDto = clients.Select(c => new ClientDTO
            {
                IdClient = c.IdClient,
                Id = c.Id,
                Name = c.Name,
                State = c.State
            }).ToList();

            return Ok(clientsDto);
        }

        // GET: api/Clients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDTO>> GetClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound();
            }

            var clientDto = new ClientDTO
            {
                IdClient = client.IdClient,
                Id = client.Id,
                Name = client.Name,
                State = client.State
            };

            return Ok(clientDto);
        }

        // PUT: api/Clients/5
        // To protect from overposting attacks, receive a DTO and map allowed fields
        [HttpPut("{id}")]
        public async Task<IActionResult> PutClient(int id, ClientDTO clientDto)
        {
            if (id != clientDto.IdClient)
            {
                return BadRequest();
            }

            var client = await _context.Clients.FindAsync(id);
            if (client == null)
            {
                return NotFound();
            }

            client.Id = clientDto.Id;
            client.Name = clientDto.Name;
            client.State = clientDto.State;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Clients
        // To protect from overposting attacks, receive a DTO and map to entity
        [HttpPost]
        public async Task<ActionResult<ClientDTO>> PostClient(ClientDTO clientDto)
        {
            var client = new Client
            {
                Id = clientDto.Id,
                Name = clientDto.Name,
                State = clientDto.State
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            clientDto.IdClient = client.IdClient;

            return CreatedAtAction(nameof(GetClient), new { id = client.IdClient }, clientDto);
        }
    }
}
