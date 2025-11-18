using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KairosPWA.Data;
using KairosPWA.Models;
using KairosPWA.DTOs;
using AutoMapper;

namespace KairosPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TurnsController : ControllerBase
    {
        private readonly ConnectionContext _context;
        private readonly IMapper _mapper;

        public TurnsController(ConnectionContext context, IMapper autoMapper)
        {
            _context = context;
            _mapper = autoMapper;
        }

        // GET: api/Turns
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TurnDTO>>> GetTurns(CancellationToken cancellationToken)
        {
            var turns = await _context.Turns
                .AsNoTracking()
                .Include(t => t.Client)
                .Include(t => t.Service)
                .ToListAsync(cancellationToken);

            var turnDtos = _mapper.Map<List<TurnDTO>>(turns);
            return turnDtos;
        }

        // GET: api/Turns/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TurnDTO>> GetTurn(int id)
        {
            var turn = await _context.Turns
                .Include(t => t.Client)
                .Include(t => t.Service)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.IdTurn == id);

            if (turn == null)
            {
                return NotFound();
            }

            var dto = _mapper.Map<TurnDTO>(turn);
            return dto;
        }

        // PUT: api/Turns/5
        // To protect from overposting attacks, receive a DTO
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTurn(int id, TurnCreateDTO turnDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var turn = await _context.Turns.FindAsync(id);
            if (turn == null) return NotFound();

            // Update only allowed properties (using the single DTO)
            turn.Number = turnDto.Number;
            turn.State = turnDto.State;
            turn.ClientId = turnDto.ClientId;
            turn.ServiceId = turnDto.ServiceId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TurnExists(id))
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

        // POST: api/Turns
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TurnDTO>> PostTurn(TurnCreateDTO turnDto, CancellationToken cancellationToken)
        {
            var turnEntidad = _mapper.Map<Turn>(turnDto);

            turnEntidad.FechaHora = DateTime.UtcNow;

            _context.Turns.Add(turnEntidad);
            try
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException)
            {
                if (TurnExists(turnEntidad.IdTurn))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            await _context.Entry(turnEntidad).Reference(t => t.Client).LoadAsync(cancellationToken);
            await _context.Entry(turnEntidad).Reference(t => t.Service).LoadAsync(cancellationToken);

            var responseDto = _mapper.Map<TurnDTO>(turnEntidad);
            return CreatedAtAction("GetTurn", new { id = turnEntidad.IdTurn },
                responseDto);
        }

        // DELETE: api/Turns/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTurn(int id)
        {
            var turn = await _context.Turns.FindAsync(id);
            if (turn == null)
            {
                return NotFound();
            }

            _context.Turns.Remove(turn);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TurnExists(int id)
        {
            return _context.Turns.Any(e => e.IdTurn == id);
        }
    }
}
