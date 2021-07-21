using ChatDemoSignalR.Data;
using ChatDemoSignalR.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public class ChatRepository : Repository<ChatRoom>, IChatRepository
    {

        public ChatRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<bool> ContainsRoom(string roomName)
        {
            ChatRoom chatRoom =  await AppDbContext.ChatRooms.SingleOrDefaultAsync(x => x.RoomName == roomName);
            return chatRoom != null;
        }

        public async Task<IEnumerable<ChatRoom>> GetAllChatRooms()
        {
            return await AppDbContext.ChatRooms.Where(x => x.ChatType == ChatType.Room).ToListAsync();
        }

        public async Task<IEnumerable<ChatRoom>> GetAllPrivateRooms()
        {
            return await AppDbContext.ChatRooms.Where(x => x.ChatType == ChatType.Private).ToListAsync();
        }

        public async Task<ChatRoom> GetByName(string roomName)
        {
            return await AppDbContext.ChatRooms.SingleOrDefaultAsync(x => x.RoomName == roomName);
        }

        public async Task<IEnumerable<ChatRoom>> GetRoomsNotContainingUser(User user)
        {
            return await AppDbContext.ChatRooms
                .Where(x => !x.Users.Contains(user) && x.ChatType == ChatType.Room)
                .ToListAsync();
        }

        public async Task<ChatRoom> GetRoomWithMessages(string roomName)
        {
            return await AppDbContext.ChatRooms
                .Include(x => x.Messages)
                .SingleOrDefaultAsync(x => x.RoomName == roomName);
        }

        public async Task<ChatRoom> GetRoomWithUsers(string roomName)
        {
            return await AppDbContext.ChatRooms
                .Include(x => x.Users)
                .SingleOrDefaultAsync(x => x.RoomName == roomName);
        }

        public async Task<ChatRoom> GetRoomWithUsersAndMessages(string roomName)
        {
            return await AppDbContext.ChatRooms
                .Include(x => x.Users)
                .Include(x => x.Messages)
                .SingleOrDefaultAsync(x => x.RoomName == roomName);
        }

        public AppDbContext AppDbContext
        {
            get { return Context as AppDbContext;  }
        }
    }
}
