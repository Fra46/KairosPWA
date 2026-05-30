using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Google.Cloud.Firestore.V1;
using Microsoft.Extensions.Configuration;

namespace KairosPWA.Services
{
    public class FirestoreService
    {
        private readonly FirestoreDb _db;

        public FirestoreService(IConfiguration configuration)
        {
            var serviceAccountPath = configuration["Firebase:ServiceAccountPath"];
            var projectId = configuration["Firebase:ProjectId"];

            if (string.IsNullOrWhiteSpace(serviceAccountPath) || string.IsNullOrWhiteSpace(projectId))
            {
                throw new InvalidOperationException("Firestore requires Firebase:ServiceAccountPath and Firebase:ProjectId en la configuración.");
            }

            var credential = GoogleCredential.FromFile(serviceAccountPath);
            var builder = new FirestoreClientBuilder { Credential = credential };
            var client = builder.Build();

            _db = FirestoreDb.Create(projectId, client);
        }

        public async Task SaveUserProfileAsync(string uid, string email, string displayName, string? role = null)
        {
            var doc = _db.Collection("users").Document(uid);
            var data = new Dictionary<string, object>
            {
                { "email", email },
                { "displayName", displayName },
                { "role", role ?? "" },
                { "updatedAt", Timestamp.GetCurrentTimestamp() }
            };

            await doc.SetAsync(data, SetOptions.MergeAll);
        }

        public async Task<Dictionary<string, object>?> GetUserProfileAsync(string uid)
        {
            var snap = await _db.Collection("users").Document(uid).GetSnapshotAsync();
            if (!snap.Exists) return null;
            return snap.ToDictionary();
        }
    }
}
