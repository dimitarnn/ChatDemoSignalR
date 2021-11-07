using ChatDemoSignalR.Data;
using ChatDemoSignalR.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public class LogEventRepository : Repository<LogEvent>, ILogEventRepository
    {
        public LogEventRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<IEnumerable<LogEvent>> GetCustom()
        {
            List<LogEvent> logs = await AppDbContext.LogEvents.Where(x => x.Message.Contains("[CUSTOM]")).ToListAsync();
            return logs;
        }

        public async Task<IEnumerable<LogEvent>> GetLast()
        {
            LogEvent applicationStart = await AppDbContext.LogEvents.OrderBy(x => x.Id).LastOrDefaultAsync(x => x.Message.Contains("Application Started"));
            int id = applicationStart.Id;

            List<LogEvent> logs = await AppDbContext.LogEvents.Where(x => x.Id >= id).ToListAsync();
            return logs;
        }

        public async Task<IEnumerable<LogEvent>> GetLastCustom()
        {
            LogEvent applicationStart = await AppDbContext.LogEvents.OrderBy(x => x.Id)
                .LastOrDefaultAsync(x => x.Message.StartsWith("[CUSTOM] Application Started"));
            int id = applicationStart.Id;

            List<LogEvent> logs = await AppDbContext.LogEvents.Where(x => x.Id >= id && x.Message.Contains("[CUSTOM]")).ToListAsync();
            return logs;
        }

        public AppDbContext AppDbContext
        {
            get { return Context as AppDbContext; }
        }
    }
}
