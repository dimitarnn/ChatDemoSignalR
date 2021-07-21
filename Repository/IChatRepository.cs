using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public interface IChatRepository : IRepository<ChatRoom>
    {

        Task<IEnumerable<ChatRoom>> GetAllChatRooms();

        Task<IEnumerable<ChatRoom>> GetAllPrivateRooms();

        Task<IEnumerable<ChatRoom>> GetRoomsNotContainingUser(User user);

        Task<ChatRoom> GetByName(string roomName);

        Task<ChatRoom> GetRoomWithUsers(string roomName);

        Task<ChatRoom> GetRoomWithMessages(string roomName);

        Task<ChatRoom> GetRoomWithUsersAndMessages(string roomName);

        Task<bool> ContainsRoom(string roomName);

    }
}
