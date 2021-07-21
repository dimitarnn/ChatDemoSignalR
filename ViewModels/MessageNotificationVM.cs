using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.ViewModels
{
    public class MessageNotificationVM
    {
        public Message Message { get; set; }

        public Notification Notification { get; set; }
    }
}
