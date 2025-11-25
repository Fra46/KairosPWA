using KairosPWA.DTOs;
using KairosPWA.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace KairosPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TurnsController : ControllerBase
    {
        private readonly TurnService _turnService;
        private readonly UserService _userService;

        public TurnsController(TurnService turnService, UserService userService)
        {
            _turnService = turnService;
            _userService = userService;
        }

        // GET: api/Turns
        [HttpGet]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<IEnumerable<TurnDTO>>> GetTurns()
        {
            var turns = await _turnService.GetAllTurnsAsync();
            return Ok(turns);
        }

        // POST: api/Turns (uso interno: crear turno directo)
        [HttpPost]
        [Authorize(Roles = "Administrador")]
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

        // POST api/turns/public (clientes piden turno)
        [HttpPost("public")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(TurnDTO), 200)]
        public async Task<IActionResult> CreatePublicTurn([FromBody] PublicTurnCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _turnService.CreatePublicTurnAsync(dto);
                return Ok(created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST api/turns/public/cancel
        [HttpPost("public/cancel")]
        [AllowAnonymous]
        public async Task<IActionResult> CancelPublicTurn([FromBody] PublicTurnCancelDTO dto)
        {
            var result = await _turnService.CancelPublicTurnAsync(dto);
            if (!result)
                return NotFound(new { message = "No se encontró un turno pendiente para ese cliente/servicio." });

            return Ok(new { message = "Turno cancelado correctamente." });
        }

        // GET api/turns/service/{serviceId}/summary
        [HttpGet("service/{serviceId}/summary")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ServiceQueueSummaryDTO), 200)]
        public async Task<IActionResult> GetServiceSummary(int serviceId)
        {
            var summary = await _turnService.GetServiceQueueSummaryAsync(serviceId);
            return Ok(summary);
        }

        // POST api/turns/service/{serviceId}/advance
        [HttpPost("service/{serviceId}/advance")]
        [Authorize(Roles = "Administrador,Empleado")]
        public async Task<IActionResult> AdvanceTurnByService(int serviceId)
        {
            int? userId = null;

            // 1) Intentar directamente con NameIdentifier
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsedId))
            {
                userId = parsedId;
            }

            // 2) Si falla, buscar por username desde los claims (sub / name)
            if (userId == null)
            {
                var userName =
                    User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ??
                    User.FindFirst(ClaimTypes.Name)?.Value;

                if (!string.IsNullOrWhiteSpace(userName))
                {
                    var user = await _userService.GetUserByUserNameAsync(userName);
                    if (user != null)
                    {
                        userId = user.IdUser;
                    }
                }
            }

            if (userId == null)
            {
                return Unauthorized(new { message = "No se pudo determinar el usuario actual." });
            }

            var nextTurn = await _turnService.AdvanceTurnByServiceAsync(serviceId, userId.Value);

            if (nextTurn == null)
                return Ok(new { message = "No hay más turnos pendientes para este servicio." });

            return Ok(nextTurn);
        }

        // GET api/turns/public/status?document=123&serviceId=1
        [HttpGet("public/status")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicTurnStatus([FromQuery] string document, [FromQuery] int serviceId)
        {
            if (string.IsNullOrWhiteSpace(document) || serviceId <= 0)
                return BadRequest(new { message = "Parámetros inválidos." });

            var turn = await _turnService.GetPendingTurnForClientAsync(document, serviceId);
            if (turn == null)
                return Ok(null); // sin turno pendiente

            return Ok(turn);
        }

        // GET api/turns/display/recent?count=20
        [HttpGet("display/recent")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecentCalled([FromQuery] int count = 20)
        {
            if (count <= 0) count = 20;
            if (count > 100) count = 100;

            var turns = await _turnService.GetRecentCalledTurnsAsync(count);
            return Ok(turns);
        }
    }
}
