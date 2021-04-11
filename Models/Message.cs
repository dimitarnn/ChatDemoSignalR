using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Models
{
    public class Message
    {
        public int Id { get; set; }

        public string Sender { get; set; }

        public string Text { get; set; }

        public DateTime SendTime { get; set; }

#nullable enable

        public string? UserId { get; set; }

        //public User? User { get; set; }

        public int? ChatRoomId { get; set; }

        //public ChatRoom? ChatRoom { get; set; }

#nullable disable

    }
}
