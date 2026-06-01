using KairosPWA.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KairosPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CryptoController : ControllerBase
    {
        private readonly IEncryptionService _encryptionService;

        public CryptoController(IEncryptionService encryptionService)
        {
            _encryptionService = encryptionService;
        }

        [HttpGet("public-key")]
        [AllowAnonymous]
        public IActionResult GetPublicKey()
        {
            return Ok(new { publicKey = _encryptionService.GetPublicKeyPem() });
        }
    }
}
