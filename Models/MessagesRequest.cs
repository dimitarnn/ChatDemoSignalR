using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Models
{
    public class MessagesRequest
    {
        public MessagesRequest() { }

        public MessagesRequest(string _RoomName, int _Index, int _Size)
        {
            RoomName = _RoomName;
            Index = _Index;
            Size = _Size;
        }

        public string RoomName { get; set; }

        public int Index { get; set; }

        public int Size { get; set; }
    }
}
