using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Models
{
    public class JoinRoomRequest
    {
        public JoinRoomRequest()
        {
            Status = RequestStatus.Pending;
            SendTime = DateTime.Now;
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }

        public string UserId { get; set; }

        public User User { get; set; }

        public string SenderId { get; set; }

        public string SenderName { get; set; }

        public int ChatRoomId { get; set; }

        public ChatRoom ChatRoom { get; set; }

        public string Text { get; set; }

        public RequestStatus Status { get; set; }

        public DateTime SendTime { get; set; }
    }
}
