using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public interface IUnitOfWork : IDisposable
    {
        IChatRepository ChatRooms { get; }

        IUserRepository Users { get; }

        IMessageRepository Messages { get; }

        INotificationRepository Notifications { get; }

        IFriendRequestRepository FriendRequests { get; }

        Task<int> Complete();
    }
}
