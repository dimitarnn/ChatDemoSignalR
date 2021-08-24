using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public interface IChatRepository : IRepository<ChatRoom>
    {
        Task<IEnumerable<ChatRoom>> GetRoomsContaining(User user);
        
        Task<IEnumerable<ChatRoom>> GetAllChatRooms();

        Task<IEnumerable<ChatRoom>> GetPublicRooms();

        Task<IEnumerable<ChatRoom>> GetAllPrivateRooms();

        Task<IEnumerable<ChatRoom>> GetAllInviteOnly();

        Task<IEnumerable<ChatRoom>> GetAllEphemeral();

        Task<IEnumerable<ChatRoom>> GetAvailable(User user);

        Task<IEnumerable<ChatRoom>> GetRoomsNotContainingUser(User user);

        Task<IEnumerable<ChatRoom>> GetChatRoomsCreatedBy(string userId);

        Task<ChatRoom> GetByName(string roomName);

        Task<ChatRoom> GetRoomWithUsers(string roomName);

        Task<ChatRoom> GetRoomWithMessages(string roomName);

        Task<ChatRoom> GetRoomWithUsersAndMessages(string roomName);

        Task<bool> ContainsRoom(string roomName);

        Task<bool> RoomContainsUser(string roomName, User user);

        Task<int> UserRoomsCount(string userId);

    }
}
