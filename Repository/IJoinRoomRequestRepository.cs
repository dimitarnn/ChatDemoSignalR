using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public interface IJoinRoomRequestRepository : IRepository<JoinRoomRequest>
    {
        Task<IEnumerable<JoinRoomRequest>> GetPending(string userId);

        Task<IEnumerable<JoinRoomRequest>> GetAccepted(string userId);

        Task<IEnumerable<JoinRoomRequest>> GetDeclined(string userId);

        Task<bool> HasSent(string senderId, string userId, string roomName);

        Task Accept(string id);

        Task Decline(string id);
    }
}
