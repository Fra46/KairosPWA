using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.Enums;
using KairosPWA.Models;
using Microsoft.EntityFrameworkCore;

namespace KairosPWA.Services
{
    public class ClientService
    {
        private readonly ConnectionContext _context;

        public ClientService(ConnectionContext context)
        {
            _context = context;
        }

        public async Task<List<ClientDTO>> GetAllClientsAsync()
        {
            var clients = await _context.Clients.ToListAsync();
            return clients.Select(c => new ClientDTO
            {
                IdClient = c.IdClient,
                Name = c.Name,
                State = c.State
            }).ToList();
        }

        public async Task<ClientDTO?> GetClientByIdAsync(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null) return null;

            return new ClientDTO
            {
                IdClient = client.IdClient,
                Name = client.Name,
                State = client.State
            };
        }

        public async Task<ClientDTO> CreateClientAsync(ClientDTO clientDto)
        {
            // Asignar estado por defecto o validarlo
            if (string.IsNullOrWhiteSpace(clientDto.State))
            {
                clientDto.State = ClientState.Activo.ToString();
            }
            else
            {
                if (!Enum.TryParse<ClientState>(clientDto.State, ignoreCase: true, out var stateEnum))
                    throw new Exception("Estado de cliente inválido.");

                clientDto.State = stateEnum.ToString();
            }

            var client = new Client
            {
                Name = clientDto.Name,
                State = clientDto.State
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            clientDto.IdClient = client.IdClient;
            return clientDto;
        }

        public async Task<bool> UpdateClientAsync(int id, ClientDTO clientDto)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null) return false;

            client.Name = clientDto.Name;

            if (!string.IsNullOrWhiteSpace(clientDto.State))
            {
                if (!Enum.TryParse<ClientState>(clientDto.State, ignoreCase: true, out var stateEnum))
                    throw new Exception("Estado de cliente inválido.");

                client.State = stateEnum.ToString();
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteClientAsync(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null) return false;

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
