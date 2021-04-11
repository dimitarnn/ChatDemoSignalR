using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Models
{

    public class ChatRoom
    {
        public ChatRoom()
        {
            Users = new List<User>();
            Messages = new List<Message>();
        }

        public int Id { get; set; }

        public string RoomName { get; set; }

        public ChatType ChatType { get; set; }

        public ICollection<User> Users { get; set; }

        public ICollection<Message> Messages { get; set; }
    }
}
