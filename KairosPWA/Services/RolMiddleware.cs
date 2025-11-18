using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace KairosPWA.Middleware
{
    public class RoleMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RoleMiddleware> _logger;

        private static readonly string[] _excludedRoutes = new[]
        {
            "/api/users/login",
            "/api/users/register",
            "/swagger"
        };

        public RoleMiddleware(RequestDelegate next, ILogger<RoleMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLower() ?? "";

            if (_excludedRoutes.Any(r => path.StartsWith(r)))
            {
                await _next(context);
                return;
            }

            if (!(context.User.Identity?.IsAuthenticated ?? false))
            {
                _logger.LogWarning("Acceso no autenticado a {Path}", path);
                await WriteJson(context, StatusCodes.Status401Unauthorized, "No autenticado");
                return;
            }


            var role = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

            if (role is null)
            {
                _logger.LogWarning("Usuario sin rol intentando acceder a {Path}", path);
                await WriteJson(context, StatusCodes.Status403Forbidden, "Acceso denegado: no tiene rol asignado");
                return;
            }


            _logger.LogInformation("Acceso permitido a {Path} con rol {Role}", path, role);

            await _next(context);
        }

        private async Task WriteJson(HttpContext context, int statusCode, string message)
        {
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var payload = new
            {
                status = statusCode,
                message
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
        }
    }
}
