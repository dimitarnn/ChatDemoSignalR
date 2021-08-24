using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User> GetUserByName(string name);

        Task<User> GetUserWithFollowing(string id);

        Task<User> GetUserWithFollowedAndFollowing(string id);

        Task<IEnumerable<User>> GetUsersInRoom(ChatRoom room);

        Task<IEnumerable<User>> GetUsersNotInRoom(ChatRoom room);

        Task<IEnumerable<User>> GetUsersNotInRoomOrInvited(ChatRoom room);

        Task<IEnumerable<User>> GetUsersExcept(string id);

        Task<IEnumerable<User>> GetUsersExcept(IEnumerable<User> list);

        Task<IEnumerable<User>> GetOtherUsersNotInCollection(string id, IEnumerable<User> list);

        Task<IEnumerable<User>> GetUsersWithFollowedAndFollowing(string id);

        Task<int> UserFriendsCount(string userId);

        Task<bool> IsFriendsWith(string userId, string friendId);

    }
}
