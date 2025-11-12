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
        public async Task<ActionResult<IEnumerable<TurnDTO>>> GetTurns()
        {
            var turnsClient = await _context.Turns.Include(t => t.Client).ToListAsync();
            var turnsService = await _context.Turns.Include(t => t.Service).ToListAsync();
            var turnClienteDtos = _mapper.Map<List<TurnDTO>>(turnsClient);
            var turnServiceDtos = _mapper.Map<List<TurnDTO>>(turnsService);
            var turnDtos = turnClienteDtos.Concat(turnServiceDtos).ToList();

            return turnDtos;
        }

        // GET: api/Turns/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Turn>> GetTurn(int id)
        {
            var turn = await _context.Turns.FindAsync(id);

            if (turn == null)
            {
                return NotFound();
            }

            return turn;
        }

        // PUT: api/Turns/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTurn(int id, Turn turn)
        {
            if (id != turn.IdTurn)
            {
                return BadRequest();
            }

            _context.Entry(turn).State = EntityState.Modified;

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
        public async Task<ActionResult<TurnDTO>> PostTurn(TurnCreateDTO turnDto)
        {
            var turnEntidad = _mapper.Map<Turn>(turnDto);

            _context.Turns.Add(turnEntidad);
            try
            {
                await _context.SaveChangesAsync();
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
            turnEntidad.FechaHora = DateTime.Now;
            await _context.Entry(turnEntidad).Reference(t => t.Client).LoadAsync();
            await _context.Entry(turnEntidad).Reference(t => t.Service).LoadAsync();

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
