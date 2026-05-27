using KairosPWA.DTOs;

namespace KairosPWA.Services
{
    public interface IClientService
    {
        Task<List<ClientDTO>> GetAllClientsAsync();
        Task<ClientDTO?> GetClientByIdAsync(int id);
        Task<ClientDTO?> GetClientByDocumentAsync(string id);
        Task<ClientDTO> CreateClientAsync(ClientDTO clientDto);
        Task<bool> UpdateClientAsync(int id, ClientDTO clientDto);
        Task<bool> DeleteClientAsync(int id);
    }
}