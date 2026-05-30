using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;

namespace KairosPWA.Services
{
    public class FirebaseAuthService
    {
        private readonly IConfiguration _configuration;

        public FirebaseAuthService(IConfiguration configuration)
        {
            _configuration = configuration;

            var serviceAccountPath = _configuration["Firebase:ServiceAccountPath"];
            if (!string.IsNullOrEmpty(serviceAccountPath) && FirebaseApp.DefaultInstance == null)
            {
                var credential = GoogleCredential.FromFile(serviceAccountPath);
                FirebaseApp.Create(new AppOptions()
                {
                    Credential = credential
                });
            }
        }

        public async Task<FirebaseToken?> VerifyIdTokenAsync(string idToken)
        {
            if (string.IsNullOrWhiteSpace(idToken)) return null;

            try
            {
                var decoded = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
                return decoded;
            }
            catch
            {
                return null;
            }
        }
    }
}
