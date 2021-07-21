using ChatDemoSignalR.Data;
using ChatDemoSignalR.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public class MessageRepository : Repository<Message>, IMessageRepository
    {
        public MessageRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<IEnumerable<Message>> GetNext(int roomId, int skip, int size)
        {
            List<Message> messages = await AppDbContext.Messages.Where(x => x.ChatRoomId == roomId).ToListAsync();
            int count = messages.Count;

            return messages.Skip(count - skip - size).Take(size).ToList();
        }

        public AppDbContext AppDbContext
        {
            get { return Context as AppDbContext;  }
        }
    }
}
