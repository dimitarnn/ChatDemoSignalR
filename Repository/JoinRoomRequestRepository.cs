using ChatDemoSignalR.Data;
using ChatDemoSignalR.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public class JoinRoomRequestRepository : Repository<JoinRoomRequest>, IJoinRoomRequestRepository
    {
        public JoinRoomRequestRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<IEnumerable<JoinRoomRequest>> GetPending(string userId)
        {
            List<JoinRoomRequest> requests = await AppDbContext.JoinRoomRequests
                .Include(x => x.ChatRoom)
                .Where(x => x.UserId == userId && x.Status == RequestStatus.Pending)
                .ToListAsync();

            return requests;
        }

        public async Task<IEnumerable<JoinRoomRequest>> GetAccepted(string userId)
        {
            List<JoinRoomRequest> requests = await AppDbContext.JoinRoomRequests
                .Where(x => x.UserId == userId && x.Status == RequestStatus.Accepted)
                .ToListAsync();

            return requests;
        }

        public async Task<IEnumerable<JoinRoomRequest>> GetDeclined(string userId)
        {
            List<JoinRoomRequest> requests = await AppDbContext.JoinRoomRequests
                .Where(x => x.UserId == userId && x.Status == RequestStatus.Declined)
                .ToListAsync();

            return requests;
        }

        public async Task Accept(string id)
        {
            JoinRoomRequest request = await AppDbContext.JoinRoomRequests.SingleOrDefaultAsync(x => x.Id == id);

            if (request == null)
                return;

            request.Status = RequestStatus.Accepted;
            AppDbContext.JoinRoomRequests.Update(request);
        }

        public async Task Decline(string id)
        {
            JoinRoomRequest request = await AppDbContext.JoinRoomRequests.SingleOrDefaultAsync(x => x.Id == id);

            if (request == null)
                return;

            request.Status = RequestStatus.Declined;
            AppDbContext.JoinRoomRequests.Update(request);
        }

        public async Task<bool> HasSent(string senderId, string userId, string roomName)
        {
            JoinRoomRequest request = await AppDbContext.JoinRoomRequests
                .SingleOrDefaultAsync(x => x.SenderId == senderId &&
                                      x.UserId == userId &&
                                      x.ChatRoom.RoomName == roomName &&
                                      x.Status == RequestStatus.Pending);

            return request != null;
        }

        public AppDbContext AppDbContext
        {
            get { return Context as AppDbContext; }
        }
    }
}
