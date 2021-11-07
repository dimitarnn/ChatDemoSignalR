using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.ViewModels
{
    public class EditUserVM
    {
        public EditUserVM()
        {
            Roles = new List<string>();
        }

        public string Id { get; set; }

        public string UserName { get; set; }

        public string Email { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public int RoomsLimit { get; set; }

        public int FriendsLimit { get; set; }

        public IList<string> Roles { get; set; }
    }
}
