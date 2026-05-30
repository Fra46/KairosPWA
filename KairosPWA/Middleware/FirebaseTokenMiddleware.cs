using KairosPWA.Services;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Tasks;

namespace KairosPWA.Middleware
{
    public class FirebaseTokenMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly FirebaseAuthService _firebaseAuth;

        public FirebaseTokenMiddleware(RequestDelegate next, FirebaseAuthService firebaseAuth)
        {
            _next = next;
            _firebaseAuth = firebaseAuth;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var authHeader = context.Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length).Trim();

                // Intentamos verificar con Firebase Admin
                var decoded = await _firebaseAuth.VerifyIdTokenAsync(token);
                if (decoded != null)
                {
                    var claims = new List<Claim>();

                    // uid
                    claims.Add(new Claim(ClaimTypes.NameIdentifier, decoded.Uid));

                    // claims del token (email, name, role, etc.)
                    if (decoded.Claims.TryGetValue("email", out var emailObj) && emailObj != null)
                    {
                        var emailValue = emailObj.ToString() ?? string.Empty;
                        claims.Add(new Claim(ClaimTypes.Email, emailValue));
                        claims.Add(new Claim(ClaimTypes.Name, emailValue));
                    }

                    if (decoded.Claims.TryGetValue("name", out var nameObj) && nameObj != null)
                    {
                        var nameValue = nameObj.ToString() ?? string.Empty;
                        claims.Add(new Claim(ClaimTypes.Name, nameValue));
                    }

                    // custom role claim
                    if (decoded.Claims.TryGetValue("role", out var roleObj) && roleObj != null)
                    {
                        var roleValue = roleObj.ToString() ?? string.Empty;
                        claims.Add(new Claim(ClaimTypes.Role, roleValue));
                    }

                    var identity = new ClaimsIdentity(claims, "Firebase");
                    context.User = new ClaimsPrincipal(identity);
                }
            }

            await _next(context);
        }
    }
}
