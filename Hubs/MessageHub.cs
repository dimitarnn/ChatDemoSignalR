using ChatDemoSignalR.Helpers;
using ChatDemoSignalR.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Hubs
{
    public class MessageHub : Hub
    {
        private readonly UserManager<User> _userManager;
        private readonly static ConnectionMapping<string> _connections =
            new ConnectionMapping<string>();
        public MessageHub(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task SendMessageToAuthorized(Message message)
        {
            var connections = _connections.GetAllConnections().ToList();
            await Clients.Clients(connections).SendAsync("ReceiveMessage", message);
        }
        
        public async Task SendMessageToAll(Message message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }

        public async Task SendMessageToCaller(Message message)
        {
            await Clients.Caller.SendAsync("ReceiveMessage", message);
        }
        
        public async Task SendMessageToConnection(string connectionId, Message message)
        {
            await Clients.Client(connectionId).SendAsync("ReceiveMessage", message);
        }

        public async Task SendMessageToUser(string username, Message message)
        {
            await Clients.Group(username).SendAsync("ReceiveMessage", message);
        }

        public async Task JoinGroup(string group)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, group);
        }

        public async Task SendMessageToGroup(string group, Message message)
        {
            //var message = new Message { Text = text, Sender = sender, SendTime = sendTime };
            //var message1 = message;
            await Clients.Group(group).SendAsync("ReceiveMessage", message);
        }

        public override async Task OnConnectedAsync()
        {
            /// single user groups
            var username = Context.User.Identity.Name;
            if (username != null)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, username);
                /// in-memory
                _connections.Add(username, Context.ConnectionId);
            }

            await Clients.All.SendAsync("UserConnected", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            string username = Context.User.Identity.Name;

            if (username != null)
            {
                _connections.Remove(username, Context.ConnectionId);
            }

            await Clients.All.SendAsync("UserDisconnected", Context.ConnectionId);
            await base.OnDisconnectedAsync(ex);
        }
    }
}
