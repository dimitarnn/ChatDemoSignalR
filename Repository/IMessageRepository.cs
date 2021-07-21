using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public interface IMessageRepository : IRepository<Message>
    {
        Task<IEnumerable<Message>> GetNext(int roomId, int skip, int size);
    }
}
