using KairosPWA.DTOs;

namespace KairosPWA.Services
{
    public interface ITurnService
    {
        Task<List<TurnDTO>> GetAllTurnsAsync();
        Task<TurnDTO> CreateTurnAsync(TurnCreateDTO turnCreateDto);
        Task<TurnDTO> CreatePublicTurnAsync(PublicTurnCreateDTO dto);
        Task<bool> CancelPublicTurnAsync(PublicTurnCancelDTO dto);
        Task<List<TurnDTO>> GetAllPendingTurnsAsync();
        Task<List<TurnDTO>> GetPendingTurnsByServiceAsync(int serviceId);
        Task<ServiceQueueSummaryDTO> GetServiceQueueSummaryAsync(int serviceId);
        Task<TurnDTO?> AdvanceTurnByServiceAsync(int serviceId, int userId);
        Task<TurnDTO?> CompleteCurrentTurnAsync(int serviceId, int userId);
        Task<TurnDTO?> GetPendingTurnForClientAsync(string document, int serviceId);
        Task<List<TurnDTO>> GetRecentCalledTurnsAsync(int count = 20);
        Task<TurnDTO?> GetCurrentTurnByServiceAsync(int serviceId);
    }
}