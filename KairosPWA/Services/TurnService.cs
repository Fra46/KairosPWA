using AutoMapper;
using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.Models;
using Microsoft.EntityFrameworkCore;

namespace KairosPWA.Services
{
    public class TurnService
    {
        private readonly ConnectionContext _context;
        private readonly IMapper _mapper;

        public TurnService(ConnectionContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<TurnDTO> CreateTurnAsync(TurnCreateDTO turnCreateDto)
        {
            var client = await _context.Clients.FindAsync(turnCreateDto.ClientId);
            var service = await _context.Services.FindAsync(turnCreateDto.ServiceId);

            if (client == null || service == null)
                throw new Exception("Cliente o servicio no encontrado.");

            var turnEntidad = _mapper.Map<Turn>(turnCreateDto);
            turnEntidad.FechaHora = DateTime.Now;

            _context.Turns.Add(turnEntidad);
            await _context.SaveChangesAsync();

            await _context.Entry(turnEntidad).Reference(t => t.Client).LoadAsync();
            await _context.Entry(turnEntidad).Reference(t => t.Service).LoadAsync();

            return _mapper.Map<TurnDTO>(turnEntidad);
        }

        public async Task<List<TurnDTO>> GetAllTurnsAsync()
        {
            var turns = await _context.Turns
                .Include(t => t.Client)
                .Include(t => t.Service)
                .ToListAsync();
            return _mapper.Map<List<TurnDTO>>(turns);
        }

        public async Task<List<TurnDTO>> GetPendingTurnsByServiceAsync(int serviceId)
        {
            var turns = await _context.Turns
                .Include(t => t.Client)
                .Include(t => t.Service)
                .Where(t => t.ServiceId == serviceId && t.State == "Pendiente")
                .OrderBy(t => t.Number)
                .ToListAsync();
            return _mapper.Map<List<TurnDTO>>(turns);
        }

        public async Task<TurnDTO?> GetCurrentPendingTurnByServiceAsync(int serviceId)
        {
            var turn = await _context.Turns
                .Include(t => t.Client)
                .Include(t => t.Service)
                .Where(t => t.ServiceId == serviceId && t.State == "Pendiente")
                .OrderBy(t => t.Number)
                .FirstOrDefaultAsync();

            return turn != null ? _mapper.Map<TurnDTO>(turn) : null;
        }

        public async Task<bool> DeleteTurnAsync(int id)
        {
            var turn = await _context.Turns.FindAsync(id);
            if (turn == null) return false;
            _context.Turns.Remove(turn);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateTurnAsync(int id, TurnCreateDTO updatedTurn)
        {
            var turn = await _context.Turns.FindAsync(id);
            if (turn == null) return false;

            turn.State = updatedTurn.State;
            turn.ClientId = updatedTurn.ClientId;
            turn.ServiceId = updatedTurn.ServiceId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<TurnDTO?> AdvanceTurnByServiceAsync(int serviceId)
        {
            var turnToAttend = await _context.Turns
                .Where(t => t.State == "Pendiente" && t.ServiceId == serviceId)
                .OrderBy(t => t.Number)
                .FirstOrDefaultAsync();

            if (turnToAttend == null)
                return null;

            turnToAttend.State = "Atendido";
            await _context.SaveChangesAsync();

            var nextTurn = await _context.Turns
                .Include(t => t.Client)
                .Include(t => t.Service)
                .Where(t => t.State == "Pendiente" && t.ServiceId == serviceId)
                .OrderBy(t => t.Number)
                .FirstOrDefaultAsync();

            return nextTurn != null ? _mapper.Map<TurnDTO>(nextTurn) : null;
        }

        public async Task<bool> ChangeTurnStateAsync(int id, string newState)
        {
            var turn = await _context.Turns.FindAsync(id);
            if (turn == null) return false;
            turn.State = newState;
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
