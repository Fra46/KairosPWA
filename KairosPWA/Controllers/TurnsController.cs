using KairosPWA.DTOs;
using KairosPWA.Services;
using Microsoft.AspNetCore.Mvc;

namespace KairosPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TurnsController : ControllerBase
    {
        private readonly TurnService _turnService;

        public TurnsController(TurnService turnService)
        {
            _turnService = turnService;
        }

        // GET: api/Turns
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TurnDTO>>> GetTurns()
        {
            var turns = await _turnService.GetAllTurnsAsync();
            return Ok(turns);
        }

        // POST: api/Turns
        [HttpPost]
        public async Task<ActionResult<TurnDTO>> PostTurn([FromBody] TurnCreateDTO turnDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var createdTurn = await _turnService.CreateTurnAsync(turnDto);
                return Ok(createdTurn);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
