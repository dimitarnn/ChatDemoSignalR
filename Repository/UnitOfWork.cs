using ChatDemoSignalR.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
            ChatRooms = new ChatRepository(_context);
            Users = new UserRepository(_context);
            Messages = new MessageRepository(_context);
            Notifications = new NotificationRepository(_context);
            FriendRequests = new FriendRequestRepository(_context);
        }

        public IChatRepository ChatRooms { get; private set; }
        public IUserRepository Users { get; private set; }
        public IMessageRepository Messages { get; private set; }
        public INotificationRepository Notifications { get; private set; }
        public IFriendRequestRepository FriendRequests { get; private set; }

        public async Task<int> Complete()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
