using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ChatDemoSignalR.Data;
using ChatDemoSignalR.Hubs;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
using ChatDemoSignalR.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChatDemoSignalR.Controllers
{
    public class ChatController : Controller
    {
        private readonly IHubContext<MessageHub> _chat;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly IUnitOfWork _unitOfWork;

        public ChatController(IHubContext<MessageHub> chat,
            SignInManager<User> signInManager,
            UserManager<User> userManager,
            IUnitOfWork unitOfWork)
        {
            _chat = chat;
            _signInManager = signInManager;
            _userManager = userManager;
            _unitOfWork = unitOfWork;
        }

        public string EncryptCeaser(string plaintext, int offset)
        {
            string ciphertext = "";

            foreach (char c in plaintext)
            {
                if (Char.IsLower(c))
                {
                    ciphertext += (char)('a' + ((c - 'a') + offset + 26) % 26);
                }
                else if (Char.IsUpper(c))
                {
                    ciphertext += (char)('A' + ((c - 'A') + offset + 26) % 26);
                }
                else
                {
                    ciphertext += c;
                }
            }

            return ciphertext;
        }

        [HttpGet]
        [Authorize]
        public IActionResult DisplayAvailableRooms()
        {
            return View();
        }

        public async Task<IActionResult> Index()
        {
            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetAll()).ToList();
            return View(rooms);
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailableRooms()
        {
            User user = await _userManager.GetUserAsync(User);

            if (user == null)
                return BadRequest();

            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetRoomsNotContainingUser(user)).ToList();

            return Ok(rooms);
        }

        public async Task<IActionResult> ListRooms()
        {
            var userId = _userManager.GetUserId(User);
            var user = await _userManager.GetUserAsync(User);

            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetRoomsNotContainingUser(user)).ToList();
            return View(rooms);
        }

        public async Task<IActionResult> DisplayRooms()
        {
            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetAllChatRooms()).ToList();
            return View(rooms);
        }

        [HttpGet]
        public async Task<IActionResult> GetChatRooms()
        {
            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetAllChatRooms()).ToList();
            return Ok(rooms);
        }

        [Authorize]
        public async Task<IActionResult> DisplayAllPrivateChats()
        {
            string userId =  _userManager.GetUserId(User);
            User user = await _unitOfWork.Users.GetUserWithFollowing(userId);

            List<User> friends = new List<User>();
            foreach (var tmp in user.Following)
            {
                User friend = await _unitOfWork.Users.Get(tmp.FriendId);
                if (friend != null)
                {
                    friends.Add(friend);
                }
            }

            return View(friends);
        }

        // for react test page
        [Authorize]
        public async Task<IActionResult> GetPrivateChats()
        {
            string userId = _userManager.GetUserId(User);
            User user = await _unitOfWork.Users.GetUserWithFollowing(userId);

            if (user == null)
                return NotFound();

            List<UserVM> friends = new List<UserVM>();
            foreach (var tmp in user.Following)
            {
                User friend = await _unitOfWork.Users.Get(tmp.FriendId);
                if (friend != null)
                {
                    friends.Add(new UserVM { Id = friend.Id, UserName = friend.UserName });
                }
            }

            return Ok(friends);
        }

        [Authorize]
        public async Task<IActionResult> DisplayPrivateChat(string friendId)
        {
            string userId = _userManager.GetUserId(User);
            User friend = await _unitOfWork.Users.Get(friendId);

            int cmp = String.Compare(userId, friendId);
            string roomName = (cmp <= 0 ? userId : friendId) + "_" + (cmp <= 0 ? friendId : userId);

            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetRoomWithUsersAndMessages(roomName);
            if (chatRoom == null)
            {
                return BadRequest();
            }

            PrivateChatVM model = new PrivateChatVM { ChatRoom = chatRoom, Friend = friend };

            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRoom(string roomName)
        {
            /*
             *  TODO:
             *  validation
             *  maybe ViewModel for a ChatRoom
             */

            if (roomName == null || roomName.Length == 0)
                return RedirectToAction("DisplayRooms");

            if (await _unitOfWork.ChatRooms.ContainsRoom(roomName))
                return RedirectToAction("DisplayRooms");

            var chatRoom = new ChatRoom
            {
                RoomName = roomName,
                ChatType = ChatType.Room
            };

            _unitOfWork.ChatRooms.Add(chatRoom);
            await _unitOfWork.Complete();

            return RedirectToAction("DisplayRooms", "Chat");
        }

        [HttpPost]
        public async Task<IActionResult> AddChatRoom([FromBody] ChatRoom room)
        {
            string roomName = room.RoomName;
            if (roomName == null || roomName.Length == 0)
                return BadRequest();

            if (await _unitOfWork.ChatRooms.ContainsRoom(roomName))
                return BadRequest();

            ChatRoom chatRoom = new ChatRoom
            {
                RoomName = roomName,
                ChatType = ChatType.Room
            };

            _unitOfWork.ChatRooms.Add(chatRoom);
            await _unitOfWork.Complete();

            return Ok(chatRoom);
        }

        [Authorize]
        public async Task<IActionResult> PersonalPage()
        {
            var userId = _userManager.GetUserId(User);
            var user = await _userManager.GetUserAsync(User);

            List<Message> messages = _unitOfWork.Messages.Find(x => x.UserId == userId).ToList();

            List<User> users = (await _unitOfWork.Users.GetUsersExcept(userId)).ToList();

            var model = new PersonalPageVM { Messages = messages, Users = users };

            return View(model);
        }
        
        public async Task<IActionResult> SendMessageToUser(string text, string target)
        {
            var user = await _userManager.GetUserAsync(User);
            var userId = _userManager.GetUserId(User);

            if (user == null)
                return NotFound("Could not find sender"); /// parameter ?

            var userName = user.UserName;
            User receiver = await _unitOfWork.Users.GetUserByName(target);

            if (receiver == null)
                return NotFound("Coulld not find target"); /// parameter ?

            var message = new Message { Text = text, Sender = userName, SendTime = DateTime.Now, UserId = receiver.Id };

            // notification
            string notificationText = $"You received a [private] message from {user.UserName} at " + String.Format("{0:HH:mm:ss dd/MM/yy}", DateTime.Now);
            var notification = new Notification { UserId = receiver.Id, User = receiver, Text = text };

            // adding notification
            _unitOfWork.Notifications.Add(notification);
            _unitOfWork.Messages.Add(message);
            await _unitOfWork.Complete();

            return Ok(message);
        }

        public async Task<IActionResult> SendMessage(string text, string roomName)
        {
            var userName = User.Identity.Name;
            var userId = _userManager.GetUserId(User);
            var user = await _userManager.FindByIdAsync(userId);
            var sender = "Anonymous";

            if (user != null)
            {
                sender = user.UserName;
            }

            /// encrypt message
            //text = EncryptCeaser(text, 1);

            var message = new Message { Text = text, Sender = sender, SendTime = DateTime.Now };
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetRoomWithUsers(roomName);

            if (chatRoom == null)
                return BadRequest();

            if (chatRoom.Messages == null)
            {
                chatRoom.Messages = new List<Message>();
            }

            chatRoom.Messages.Add(message);

            // notification
            Notification notification;
            string notificationText = "-";
            string source = "";

            if (_signInManager.IsSignedIn(User))
            {
                if (chatRoom.ChatType == ChatType.Room)
                {
                    notificationText = $"New message in {roomName} at " + String.Format("{0:HH:mm:ss dd/MM/yy}", DateTime.Now);
                    source = String.Format("/Chat/DisplayChatRoom?roomName={0}", roomName);
                }
                else if (chatRoom.ChatType == ChatType.Private)
                {
                    notificationText = $"New message from {sender} at " + String.Format("{0:HH:mm:ss dd/MM/yy}", DateTime.Now);
                    string friendId = userId ?? "";

                    source = String.Format("/Chat/DisplayPrivateChat?friendId={0}", friendId);
                }

                foreach (var member in chatRoom.Users)
                {
                    if (member.Id == userId)
                        continue;
                    notification = new Notification
                    {
                        UserId = member.Id,
                        User = member,
                        Text = notificationText,
                        Source = source
                    };
                    _unitOfWork.Notifications.Add(notification);
                }
            }

            await _unitOfWork.Complete();


            notification = null;

            if (_signInManager.IsSignedIn(User))
                notification = new Notification { UserId = userId, Text = notificationText, Source = source };

            MessageNotificationVM model = new MessageNotificationVM
            {
                Message = message,
                Notification = notification
            };

            return Ok(model);
        }

        public async Task<IActionResult> DisplayChatRoom(string roomName)
        {
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetRoomWithMessages(roomName);
            
            if (chatRoom == null)
            {
                return RedirectToAction("Index", "Home");
            }
            return View(chatRoom);
        }

        // for react
        public async Task<IActionResult> GetMessagesInRoom(string roomName)
        {
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetByName(roomName);

            if (chatRoom == null)
            {
                return NotFound();
            }

            List<Message> messages = _unitOfWork.Messages.Find(x => x.ChatRoomId == chatRoom.Id).ToList();

            return Ok(messages);
        }

        // infinite scroll
        public async Task<IActionResult> GetMessages(string roomName, int skip, int size)
        {
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetByName(roomName);

            if (chatRoom == null)
            {
                return NotFound();
            }

            List<Message> messages = (await _unitOfWork.Messages.GetNext(chatRoom.Id, skip, size)).ToList();

            return Ok(messages);
        }

        public async Task<IActionResult> GetMessageCount(string roomName)
        {
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetByName(roomName);

            if (chatRoom == null)
            {
                return NotFound();
            }

            List<Message> messages = _unitOfWork.Messages.Find(x => x.ChatRoomId == chatRoom.Id).ToList();
            return Ok(messages.Count);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> JoinRoom(string roomName)
        {
            var user = await _userManager.GetUserAsync(User);

            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetRoomWithUsers(roomName);

            if (chatRoom.ChatType == ChatType.Private)
                return BadRequest();

            if (chatRoom == null)
            {
                return NotFound("Room not found");
            }

            if (chatRoom != null && !chatRoom.Users.Contains(user))
            {
                chatRoom.Users.Add(user);
                await _unitOfWork.Complete();
            }

            return Ok();
        }

        public async Task<IActionResult> CreatePrivateRoom(string user1Id, string user2Id)
        {
            User user1 = await _unitOfWork.Users.Get(user1Id);
            User user2 = await _unitOfWork.Users.Get(user2Id);

            int cmp = String.Compare(user1.Id, user2.Id);
            string roomName = (cmp <= 0 ? user1.Id : user2.Id) + "_" + (cmp <= 0 ? user2.Id : user1.Id);

            ChatRoom room = await _unitOfWork.ChatRooms.GetByName(roomName);

            if (room != null)
                return BadRequest();

            room = new ChatRoom
            {
                ChatType = ChatType.Private,
                RoomName = roomName
            };

            room.Users.Add(user1);
            room.Users.Add(user2);

            _unitOfWork.ChatRooms.Add(room);
            await _unitOfWork.Complete();

            return Ok();
        }

        /// leave room
    }
}
