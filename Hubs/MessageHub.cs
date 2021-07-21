using ChatDemoSignalR.Data;
using ChatDemoSignalR.Helpers;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
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
        private readonly AppDbContext _context;
        private readonly static ConnectionMapping<string> _connections =
            new ConnectionMapping<string>();
        private readonly IUserRepository _userRepository;
        private readonly IChatRepository _chatRepository;
        private readonly IUnitOfWork _unitOfWork;

        public MessageHub(UserManager<User> userManager,
            AppDbContext context,
            IUserRepository userRepository,
            IChatRepository chatRepository,
            IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _context = context;
            _userRepository = userRepository;
            _chatRepository = chatRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task SendNotificationToGroup(string group, Notification notification)
        {
            //var chatRoom = _context.ChatRooms.SingleOrDefault(x => x.RoomName == group);
            //ChatRoom chatRoom = await _chatRepository.GetRoom(group);
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetByName(group);
            //var users = _context.Users.Where(x => x.ChatRooms.Contains(chatRoom)).ToList();
            IEnumerable<User> users = await _userRepository.GetUsersInRoom(chatRoom);

            foreach (User user in users)
            {
                var connections = _connections.GetConnections(user.UserName).ToList();
                if (!connections.Any() || user.Id == notification.UserId)
                    continue;

                Notification tmp = new Notification
                {
                    UserId = user.Id,
                    User = user,
                    Text = notification.Text,
                    CreationTime = notification.CreationTime
                };

                await Clients.Clients(connections).SendAsync("ReceiveNotification", notification); /// a call to update notifications
            }
        }

        public async Task SendNotificationToUser(string username)
        {
            var connections = _connections.GetConnections(username).ToList();
            await Clients.Clients(connections).SendAsync("ReceiveNotification");
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
            //var username = Context.User.Identity.Name;
            //var list = _connections.GetConnections(username);
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
