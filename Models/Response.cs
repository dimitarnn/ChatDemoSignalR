using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Models
{
    public class Response
    {
        public dynamic Data { get; set; }

        public bool IsSuccess { get; set; } = true;

        public string ErrorMessage { get; set; }
    }
}
