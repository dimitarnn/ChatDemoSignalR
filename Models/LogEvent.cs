using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Models
{
    public class LogEvent
    {
        public int Id { get; set; }

        public string Message { get; set; }

        public string Exception { get; set; }

        public string Level { get; set; }

        public DateTime TimeStamp { get; set; }
    }
}
