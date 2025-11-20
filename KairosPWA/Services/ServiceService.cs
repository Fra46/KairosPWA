using KairosPWA.Data;
using KairosPWA.Enums;
using KairosPWA.Models;
using Microsoft.EntityFrameworkCore;

namespace KairosPWA.Services
{
    public class ServiceService
    {
        private readonly ConnectionContext _context;

        public ServiceService(ConnectionContext context)
        {
            _context = context;
        }

        public async Task<Service> CreateServiceAsync(Service service)
        {
            if (string.IsNullOrWhiteSpace(service.State))
            {
                service.State = ServiceState.Disponible.ToString();
            }

            _context.Services.Add(service);
            await _context.SaveChangesAsync();
            return service;
        }

        public async Task<List<Service>> GetAllServicesAsync()
        {
            return await _context.Services.ToListAsync();
        }

        public async Task<Service?> GetServiceByIdAsync(int id)
        {
            return await _context.Services.FindAsync(id);
        }

        public async Task<bool> UpdateServiceAsync(int id, Service updatedService)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return false;

            service.Name = updatedService.Name;
            service.Description = updatedService.Description;

            if (!string.IsNullOrWhiteSpace(updatedService.State))
            {
                if (!Enum.TryParse<ServiceState>(updatedService.State, ignoreCase: true, out var stateEnum))
                {
                    throw new ArgumentException("Estado de servicio inválido.");
                }

                service.State = stateEnum.ToString();
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteServiceAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return false;

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ServiceExistsAsync(string name)
        {
            return await _context.Services.AnyAsync(s => s.Name == name);
        }
    }
}
