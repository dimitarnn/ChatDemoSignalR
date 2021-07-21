using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.ViewModels
{
    public class PrivateChatVM
    {
        public ChatRoom ChatRoom { get; set; }
        
        public User Friend { get; set; }
    }
}
