using ChatDemoSignalR.Data;
using ChatDemoSignalR.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public class FriendRequestRepository : Repository<FriendRequest>, IFriendRequestRepository
    {
        public FriendRequestRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<IEnumerable<FriendRequest>> GetAll(string userId)
        {
            return await AppDbContext.FriendRequests.Where(x => x.UserId == userId).ToListAsync();
        }

        public async Task<IEnumerable<FriendRequest>> GetAccepted(string userId)
        {
            return await AppDbContext
                .FriendRequests
                .Where(x => x.UserId == userId && x.Status == RequestStatus.Accepted)
                .Include(x => x.Sender)
                .ToListAsync();
        }

        public async Task<IEnumerable<FriendRequest>> GetDeclined(string userId)
        {
            return await AppDbContext
                .FriendRequests
                .Where(x => x.UserId == userId && x.Status == RequestStatus.Declined)
                .Include(x => x.Sender)
                .ToListAsync();
        }

        public async Task<IEnumerable<FriendRequest>> GetPending(string userId)
        {
            return await AppDbContext
                .FriendRequests
                .Where(x => x.UserId == userId && x.Status == RequestStatus.Pending)
                .Include(x => x.Sender)
                .ToListAsync();
        }

        public async Task Accept(int id)
        {
            FriendRequest request = await AppDbContext.FriendRequests.SingleOrDefaultAsync(x => x.Id == id);

            if (request == null)
                return;

            request.Status = RequestStatus.Accepted;
            AppDbContext.FriendRequests.Update(request);
        }

        public async Task Decline(int id)
        {
            FriendRequest request = await AppDbContext.FriendRequests.SingleOrDefaultAsync(x => x.Id == id);

            if (request == null)
                return;

            request.Status = RequestStatus.Declined;
            AppDbContext.FriendRequests.Update(request);
        }

        public async Task<bool> HasSent(string senderId, string userId)
        {
            List<FriendRequest> requests = await AppDbContext
                .FriendRequests
                .Where(x => x.UserId == userId && x.SenderId == senderId && x.Status == RequestStatus.Pending)
                .ToListAsync();

            return requests.Count > 0;
        }

        public AppDbContext AppDbContext
        {
            get { return Context as AppDbContext; }
        }
    }
}
