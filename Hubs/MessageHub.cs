using ChatDemoSignalR.Data;
using ChatDemoSignalR.Helpers;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Hubs
{
    public class MessageHub : Hub
    {
        private readonly static ConnectionMapping<string> _connections =
            new ConnectionMapping<string>();
        private readonly IUnitOfWork _unitOfWork;

        public MessageHub(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task SendNotificationToGroup(string group, Notification notification)
        {
            if (notification == null)
                return;

            string username = Context.User.Identity.Name ?? "Anonymous";

            Log.Information("[CUSTOM] User [{User}] connection {ConnectionId} sending notification [{Notification}] to group [{group}] at {Now}",
                username,
                Context.ConnectionId,
                notification,
                group,
                DateTime.Now);

            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetByName(group);
            List<User> users = (await _unitOfWork.Users.GetUsersInRoom(chatRoom)).ToList();

            foreach (User user in users)
            {
                var connections = _connections.GetConnections(user.UserName).ToList();
                if (!connections.Any() || user.Id == notification.UserId) // original notification has its sender as User and UserId
                    continue;

                Notification tmp = new Notification
                {
                    Id = notification.Id,
                    UserId = user.Id,
                    User = user,
                    Text = notification.Text,
                    Source = notification.Source,
                    CreationTime = notification.CreationTime
                };

                await Clients.Clients(connections).SendAsync("ReceiveNotification", tmp);
            }
        }

        public async Task SendNotificationToUser(string username)       // not used?, add notification as parameter 
        {
            var connections = _connections.GetConnections(username).ToList();
            if (!connections.Any())
                return;

            await Clients.Clients(connections).SendAsync("ReceiveNotification");
        }

        public async Task SendNotificationToUserId(string id, Notification notification)
        {
            User user = await _unitOfWork.Users.Get(id);
            if (user == null)
                return;

            var connections = _connections.GetConnections(user.UserName).ToList();
            if (!connections.Any())
                return;

            await Clients.Clients(connections).SendAsync("ReceiveNotification", notification);
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
            string username = Context.User.Identity.Name ?? "Anonymous";

            Log.Information("[CUSTOM] User [{User}] connection {ConnectionId} joining group [{Group}] at {Now}",
                username,
                Context.ConnectionId,
                group,
                DateTime.Now);

            await Groups.AddToGroupAsync(Context.ConnectionId, group);
        }

        public async Task SendMessageToGroup(string group, Message message)
        {
            string username = Context.User.Identity.Name ?? "Anonymous";

            Log.Information("[CUSTOM] User [{User}] connection {ConnectionId} sending message [{Message}] to group [{Group}] at {Now}",
                username,
                Context.ConnectionId,
                message,
                group,
                DateTime.Now);

            await Clients.Group(group).SendAsync("ReceiveMessage", message);
        }

        public async Task SendMessageToOthersInGroup(string group, Message message)
        {
            var username = Context.User.Identity.Name;
            var userConnections = _connections.GetConnections(username).ToList();
            await Clients.GroupExcept(group, userConnections).SendAsync("ReceiveMessage", message);
        }

        public override async Task OnConnectedAsync()
        {
            /// single user groups
            var username = Context.User.Identity.Name;
            //var transport = Context.Items;

            Log.Information("[CUSTOM] User {Username} connected with {ConnectionId} at {Now}",
                username == null ? "<Anonymous>" : $"[{username}]",
                Context.ConnectionId,
                DateTime.Now);

            if (username != null)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, username);
                /// in-memory
                _connections.Add(username, Context.ConnectionId);
            }

            //await Clients.All.SendAsync("UserConnected", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            string username = Context.User.Identity.Name;

            Log.Information("[CUSTOM] User {Username} disconnected {ConnectionId} at {Now}",
                username == null ? "<Anonymous>" : $"[{username}]",
                Context.ConnectionId,
                DateTime.Now);

            if (username != null)
            {
                _connections.Remove(username, Context.ConnectionId);
            }

            await Clients.All.SendAsync("UserDisconnected", Context.ConnectionId);
            await base.OnDisconnectedAsync(ex);
        }
    }
}
