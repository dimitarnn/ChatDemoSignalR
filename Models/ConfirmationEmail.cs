using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Models
{
    public class ConfirmationEmail
    {
        public string ToEmail { get; set; }

        public string UserName { get; set; }
    }
}
