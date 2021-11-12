using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Hubs
{
    public class TestHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            //await Clients.All.SendAsync("ReceiveMessage", user, message);
            await Clients.Group("TestGroup").SendAsync("ReceiveMessage", user, message);
        }

        public async Task JoinGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "TestGroup");
        }
    }
}
