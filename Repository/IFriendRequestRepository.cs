using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public interface IFriendRequestRepository : IRepository<FriendRequest>
    {
        Task<IEnumerable<FriendRequest>> GetAll(string userId);
        
        Task<IEnumerable<FriendRequest>> GetPending(string userId);

        Task<IEnumerable<FriendRequest>> GetAccepted(string userId);

        Task<IEnumerable<FriendRequest>> GetDeclined(string userId);

        Task Accept(int id);

        Task Decline(int id);

        Task<bool> HasSent(string senderId, string userId);
    }
}
