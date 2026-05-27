using Microsoft.AspNetCore.SignalR;
using System.Diagnostics.CodeAnalysis;

namespace KairosPWA.Hubs
{
    [ExcludeFromCodeCoverage]
    public class NotificationsHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }
    }
}
