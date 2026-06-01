using KairosPWA.Controllers;
using KairosPWA.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace KairosPWA.Tests.Controllers
{
    public class CryptoControllerTests
    {
        [Fact]
        public void GetPublicKey_ReturnsOkWithPublicKey()
        {
            var encryptionServiceMock = new Mock<IEncryptionService>();
            encryptionServiceMock.Setup(x => x.GetPublicKeyPem()).Returns("-----BEGIN PUBLIC KEY-----\nABC\n-----END PUBLIC KEY-----\n");

            var controller = new CryptoController(encryptionServiceMock.Object);
            var result = controller.GetPublicKey();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            var publicKeyProperty = okResult.Value.GetType().GetProperty("publicKey");
            Assert.NotNull(publicKeyProperty);
            var publicKeyValue = publicKeyProperty.GetValue(okResult.Value) as string;
            Assert.Equal("-----BEGIN PUBLIC KEY-----\nABC\n-----END PUBLIC KEY-----\n", publicKeyValue);
        }
    }
}
