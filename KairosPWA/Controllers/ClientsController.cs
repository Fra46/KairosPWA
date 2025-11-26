using KairosPWA.DTOs;
using KairosPWA.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KairosPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrador")]
    public class ClientsController : ControllerBase
    {
        private readonly ClientService _clientService;

        public ClientsController(ClientService clientService)
        {
            _clientService = clientService;
        }

        // GET: api/Clients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientDTO>>> GetClients()
        {
            var clients = await _clientService.GetAllClientsAsync();
            return Ok(clients);
        }

        // GET: api/Clients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDTO>> GetClient(int id)
        {
            var client = await _clientService.GetClientByIdAsync(id);

            if (client == null)
                return NotFound();

            return Ok(client);
        }

        // PUT: api/Clients/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutClient(int id, [FromBody] ClientDTO clientDto)
        {
            if (id != clientDto.IdClient)
                return BadRequest("Id de ruta y de cuerpo no coinciden.");

            var updated = await _clientService.UpdateClientAsync(id, clientDto);

            if (!updated)
                return NotFound();

            return NoContent();
        }

        // POST: api/Clients
        [HttpPost]
        public async Task<ActionResult<ClientDTO>> PostClient([FromBody] ClientDTO clientDto)
        {
            var createdClient = await _clientService.CreateClientAsync(clientDto);

            return CreatedAtAction(nameof(GetClient),
                new { id = createdClient.IdClient },
                createdClient);
        }

        // DELETE: api/Clients/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            var deleted = await _clientService.DeleteClientAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}
