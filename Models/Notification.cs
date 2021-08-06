using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Models
{
    public class Notification
    {
        public Notification()
        {
            CreationTime = DateTime.Now;
        }

        public int Id { get; set; }

        public string UserId { get; set; }

        public User User { get; set; }

        public string Text { get; set; }

        public DateTime CreationTime { get; set; }

        public bool IsRead { get; set; } = false;

        public string Source { get; set; }
    }
}
