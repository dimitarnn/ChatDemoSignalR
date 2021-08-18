using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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
            ChatType = ChatType.Ephemeral;
            JoinRoomRequests = new List<JoinRoomRequest>();
        }

        public int Id { get; set; }

        [Required]
        //[MaxLength(30)]
        public string RoomName { get; set; }

        [MaxLength(50)]
        public string DisplayName { get; set; }

        public ChatType ChatType { get; set; }

        public ICollection<User> Users { get; set; }

        public string CreatorId { get; set; }

        public string CreatorName { get; set; }

        [MaxLength(100)]
        public string Description { get; set; }

        public ICollection<JoinRoomRequest> JoinRoomRequests { get; set; }

        public ICollection<Message> Messages { get; set; }
    }
}
