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

        public async Task<IEnumerable<ChatRoom>> GetAvailable(User user)
        {
            return await AppDbContext.ChatRooms
                .Where(x => !x.Users.Contains(user) && x.ChatType == ChatType.Room)
                .ToListAsync();
        }

        public async Task<IEnumerable<ChatRoom>> GetRoomsContaining(User user) // not including private chats
        {
            return await AppDbContext.ChatRooms
                .Where(x => (x.ChatType == ChatType.InviteOnly || x.ChatType == ChatType.Room) && x.Users.Contains(user))
                .ToListAsync();
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

        public async Task<IEnumerable<ChatRoom>> GetPublicRooms()
        {
            return await AppDbContext.ChatRooms.Where(x => x.ChatType == ChatType.Room || x.ChatType == ChatType.Ephemeral).ToListAsync();
        }

        public async Task<IEnumerable<ChatRoom>> GetAllPrivateRooms()
        {
            return await AppDbContext.ChatRooms.Where(x => x.ChatType == ChatType.Private).ToListAsync();
        }

        public async Task<IEnumerable<ChatRoom>> GetAllEphemeral()
        {
            return await AppDbContext.ChatRooms.Where(x => x.ChatType == ChatType.Ephemeral).ToListAsync();
        }

        public async Task<IEnumerable<ChatRoom>> GetAllInviteOnly()
        {
            return await AppDbContext.ChatRooms.Where(x => x.ChatType == ChatType.InviteOnly).ToListAsync();
        }

        public async Task<IEnumerable<ChatRoom>> GetChatRoomsCreatedBy(string userId)
        {
            return await AppDbContext.ChatRooms
                .Where(x => x.ChatType == ChatType.InviteOnly && x.CreatorId == userId)
                .ToListAsync();
        }

        public async Task<ChatRoom> GetByName(string roomName)
        {
            return await AppDbContext.ChatRooms.SingleOrDefaultAsync(x => x.RoomName == roomName);
        }

        public async Task<IEnumerable<ChatRoom>> GetRoomsNotContainingUser(User user)
        {
            return await AppDbContext.ChatRooms
                .Where(x => !x.Users.Contains(user) && (x.ChatType == ChatType.Room || x.ChatType == ChatType.Ephemeral))
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

        public async Task<bool> RoomContainsUser(string roomName, User user)
        {
            ChatRoom room = await AppDbContext.ChatRooms.Include(x => x.Users).SingleOrDefaultAsync(x => x.RoomName == roomName);
            if (room == null)
                return false;

            return room.Users.Contains(user);
        }

        public AppDbContext AppDbContext
        {
            get { return Context as AppDbContext;  }
        }
    }
}
