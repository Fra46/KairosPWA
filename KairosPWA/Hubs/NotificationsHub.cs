using Microsoft.AspNetCore.SignalR;

namespace KairosPWA.Hubs
{
    public class NotificationsHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }
    }
}
