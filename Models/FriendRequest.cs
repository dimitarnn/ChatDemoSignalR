using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Models
{
    public class FriendRequest
    {
        public FriendRequest()
        {
            Status = RequestStatus.Pending;
            SendTime = DateTime.Now; 
        }
        
        public int Id { get; set; }

        public string UserId { get; set; }

        public User User { get; set; }

        public string SenderId { get; set; }

        public User Sender { get; set; }

        public DateTime SendTime { get; set; }

        public RequestStatus Status { get; set; }
    }
}
