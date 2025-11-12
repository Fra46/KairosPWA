using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

public class RolMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string[] _allowedRoles;

    public RolMiddleware(RequestDelegate next, params string[] allowedRoles)
    {
        _next = next;
        _allowedRoles = allowedRoles;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var user = context.User;

        if (!user.Identity.IsAuthenticated)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("No autenticado.");
            return;
        }

        var roles = user.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value);

        if (!_allowedRoles.Any(role => roles.Contains(role)))
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsync("No autorizado para esta acción.");
            return;
        }

        await _next(context);
    }
}
