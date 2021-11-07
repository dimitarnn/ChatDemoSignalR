using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public interface ILogEventRepository : IRepository<LogEvent>
    {
        public Task<IEnumerable<LogEvent>> GetCustom();

        public Task<IEnumerable<LogEvent>> GetLast();   // gets the last logs since 'application start'

        public Task<IEnumerable<LogEvent>> GetLastCustom();
    }
}
