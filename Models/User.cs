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
            //Following = new List<UserFriends>();
            //FollowedBy = new List<UserFriends>();

            //Friends = new List<User>();
        }

        [Required]
        [Display(Name = "First Name")]
        public string FirstName { get; set; }

        [Required]
        [Display(Name = "Last Name")]
        public string LastName { get; set; }

        public ICollection<Message> Messages { get; set; }

        public ICollection<ChatRoom> ChatRooms { get; set; }

        //public ICollection<ChatRoomUser> ChatRoomUsers { get; set; }

        public ICollection<UserFriends> Following { get; set; }

        public ICollection<UserFriends> FollowedBy { get; set; }

        public ICollection<Notification> Notifications { get; set; }

    }
}
