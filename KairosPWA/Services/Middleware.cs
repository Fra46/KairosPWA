using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using System.Threading.Tasks;

namespace KairosPWA.Middleware
{
    public class Middleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<Middleware> _logger;

        public Middleware(RequestDelegate next, ILogger<Middleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var endpoint = context.GetEndpoint();

            // Si la acción permite anónimos, no hacemos nada especial
            var allowsAnonymous = endpoint?.Metadata?.GetMetadata<IAllowAnonymous>() != null;

            if (!allowsAnonymous)
            {
                var user = context.User;
                var identity = user?.Identity;

                string userId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                                ?? user?.FindFirst("id")?.Value
                                ?? "anonymous";

                string userName = user?.FindFirst(ClaimTypes.Name)?.Value
                                  ?? user?.FindFirst("username")?.Value;

                string role = user?.FindFirst(ClaimTypes.Role)?.Value
                              ?? user?.FindFirst("role")?.Value;

                _logger.LogInformation(
                    "Request {Method} {Path} by {UserId} ({UserName}) with role {Role}. Authenticated: {IsAuthenticated}",
                    context.Request.Method,
                    context.Request.Path,
                    userId,
                    userName ?? "-",
                    role ?? "-",
                    identity?.IsAuthenticated ?? false
                );
            }

            await _next(context);
        }
    }
}
