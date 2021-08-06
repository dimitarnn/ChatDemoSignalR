using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.ViewModels
{
    public class FriendRequestVM
    {
        public int Id { get; set; }
        
        public string UserId { get; set; }

        public string UserName { get; set; }

        public string SenderId { get; set; }

        public string SenderName { get; set; }

        public DateTime SendTime { get; set; }

        public RequestStatus Status { get; set; }
    }
}
