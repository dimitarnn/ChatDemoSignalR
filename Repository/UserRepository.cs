using ChatDemoSignalR.Data;
using ChatDemoSignalR.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context)
            : base(context)
        {
        }
        
        public async Task<IEnumerable<User>> GetOtherUsersNotInCollection(string id, IEnumerable<User> list)
        {
            return await AppDbContext.Users.Where(x => x.Id != id && !list.Contains(x)).ToListAsync();
        }

        public async Task<User> GetUserByName(string name)
        {
            return await AppDbContext.Users.SingleOrDefaultAsync(x => x.UserName == name);
        }

        public async Task<User> GetUserWithFollowedAndFollowing(string id)
        {
            return await AppDbContext.Users
                .Include(x => x.FollowedBy)
                .Include(x => x.Following)
                .SingleOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IEnumerable<User>> GetUsersExcept(string id)
        {
            return await AppDbContext.Users.Where(x => x.Id != id).ToListAsync();
        }

        public async Task<IEnumerable<User>> GetUsersExcept(IEnumerable<User> list)
        {
            return await AppDbContext.Users.Where(x => !list.Contains(x)).ToListAsync();
        }

        public async Task<IEnumerable<User>> GetUsersInRoom(ChatRoom room)
        {
            return await AppDbContext.Users.Where(x => x.ChatRooms.Contains(room)).ToListAsync();
        }

        public async Task<IEnumerable<User>> GetUsersNotInRoom(ChatRoom room)
        {
            return await AppDbContext.Users.Where(x => !x.ChatRooms.Contains(room)).ToListAsync();
        }

        public async Task<IEnumerable<User>> GetUsersNotInRoomOrInvited(ChatRoom room)
        {
            List<User> users = await AppDbContext.Users.Include(x => x.ChatRooms).Include(x => x.JoinRoomRequests).ToListAsync();
            List<User> list = new List<User>();

            foreach (User user in users)
            {
                if (user.ChatRooms.Contains(room))
                    continue;

                bool skip = false;
                foreach (JoinRoomRequest request in user.JoinRoomRequests)
                {
                    if (request.ChatRoom == room && request.Status == RequestStatus.Pending)
                    {
                        skip = true;
                        break;
                    }
                }

                if (skip)
                    continue;

                list.Add(user);
            }

            return list;
        }

        public async Task<IEnumerable<User>> GetUsersWithFollowedAndFollowing(string id)
        {
            return await AppDbContext.Users
                .Include(x => x.Following)
                .Include(x => x.FollowedBy)
                .Where(x => x.Id == id)
                .ToListAsync();
        }

        public async Task<int> CreatedRoomsCount(string id)
        {
            List<ChatRoom> createdRooms = await AppDbContext.ChatRooms.Where(x => x.CreatorId == id).ToListAsync();
            return createdRooms.Count;
        }

        public async Task<User> GetUserWithFollowing(string id)
        {
            return await AppDbContext.Users.Include(x => x.Following).SingleOrDefaultAsync(x => x.Id == id);
        }

        public async Task<bool> IsFriendsWith(string userId, string friendId)
        {
            User user = await AppDbContext.Users.Include(x => x.Following).SingleOrDefaultAsync(x => x.Id == userId);
            User friend = await AppDbContext.Users.SingleOrDefaultAsync(x => x.Id == friendId);

            if (user == null || friend == null)
                return true;

            List<UserFriends> common = user.Following.Where(x => x.FriendId == friend.Id).ToList();

            return common.Count > 0;
        }

        public async Task<int> UserFriendsCount(string userId)
        {
            User user = await AppDbContext.Users.Include(x => x.Following).SingleOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                return 0;

            return user.Following.Count;
        }

        public AppDbContext AppDbContext
        {
            get { return Context as AppDbContext; }
        }
    }
}
