using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.ViewModels
{
    public class PersonalPageVM
    {
        public List<Message> Messages { get; set; }

        public List<User> Users { get; set; }
    }
}
