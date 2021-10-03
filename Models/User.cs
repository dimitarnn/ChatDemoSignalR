using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Models
{
    public class User : IdentityUser
    {
        public User()
        {
            Messages = new List<Message>();
            Notifications = new List<Notification>();
            FriendRequests = new List<FriendRequest>();
            JoinRoomRequests = new List<JoinRoomRequest>();
            RoomsLimit = 5000;
            FriendsLimit = 5000;
        }

        [Required]
        [Display(Name = "First Name")]
        public string FirstName { get; set; }

        [Required]
        [Display(Name = "Last Name")]
        public string LastName { get; set; }

        public int RoomsLimit { get; set; }

        public int FriendsLimit { get; set; }

        public ICollection<Message> Messages { get; set; }

        public ICollection<ChatRoom> ChatRooms { get; set; }

        public ICollection<UserFriends> Following { get; set; }

        public ICollection<UserFriends> FollowedBy { get; set; }

        public ICollection<Notification> Notifications { get; set; }

        public ICollection<FriendRequest> FriendRequests { get; set; }

        public ICollection<JoinRoomRequest> JoinRoomRequests { get; set; }

        public ICollection<Image> Images { get; set; }

    }
}
