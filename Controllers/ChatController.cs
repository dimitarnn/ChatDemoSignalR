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

        [HttpGet]
        public async Task<IActionResult> GetAvailableRooms()
        {
            User user = await _userManager.GetUserAsync(User);

            if (user == null)
                return BadRequest("User must be logged in!");

            //List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetRoomsNotContainingUser(user)).ToList();
            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetAvailable(user)).ToList();

            return Ok(rooms);
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

        [HttpGet]
        public async Task<IActionResult> GetPublicRooms()
        {
            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetPublicRooms()).ToList();
            return Ok(rooms);
        }

        [Authorize]
        public IActionResult DisplayAllPrivateChats()
        {
            return View();
        }

        [Authorize]
        public async Task<IActionResult> GetPrivateChats()
        {
            string userId = _userManager.GetUserId(User);
            User user = await _unitOfWork.Users.GetUserWithFollowing(userId);

            if (user == null)
                return BadRequest("User must be logged in!");

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

        [HttpGet]
        public IActionResult GetChatTypes()
        {
            string[] array = Enum.GetNames(typeof(ChatType));
            List<string> list = new List<string>(array);

            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRoom(string roomName, string description, ChatType chatType)
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
                DisplayName = roomName,
                ChatType = ChatType.Room
            };

            _unitOfWork.ChatRooms.Add(chatRoom);
            await _unitOfWork.Complete();

            return RedirectToAction("DisplayRooms", "Chat");
        }

        //[Authorize]
        [HttpPost]
        public async Task<IActionResult> AddChatRoom(string roomName, string description, ChatType chatType)
        {
            User user = await _userManager.GetUserAsync(User);

            if (user == null)
                return BadRequest("User must be logged in!");

            if (roomName == null || roomName.Length == 0)
                return BadRequest("Ivalid room name!");

            int userRoomsCnt = await _unitOfWork.ChatRooms.UserRoomsCount(user.Id);
            if (userRoomsCnt >= user.RoomsLimit)
                return BadRequest("User cannot add any more rooms!");

            bool isCreated = await _unitOfWork.ChatRooms.ContainsRoom(roomName);
            if (isCreated)
                return BadRequest("Room name must be unique!");

            if (description == null)
                description = "No description";

            if (description.Length == 0)
                description = "No description";

            ChatRoom chatRoom = new ChatRoom
            {
                RoomName = roomName,
                ChatType = chatType,
                DisplayName = roomName,
                Description = description,
                CreatorId = user.Id,
                CreatorName = user.UserName
            };

            chatRoom.Users.Add(user); // add the creator user

            _unitOfWork.ChatRooms.Add(chatRoom);
            await _unitOfWork.Complete();

            //ChatRoom response = await _unitOfWork.ChatRooms.GetByName(roomName);  // get the room without the other connected models
            // to avaoid loops and error 500 
            // roomVM ?

            ChatRoom response = new ChatRoom
            {
                Id = chatRoom.Id,
                RoomName = roomName,
                ChatType = chatType,
                DisplayName = roomName,
                Description = description,
                CreatorId = user.Id,
                CreatorName = user.UserName
            };

            return Ok(response);
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetRoomsContainingUser()
        {
            User user = await _userManager.GetUserAsync(User);
            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetRoomsContaining(user)).ToList();

            return Ok(rooms);
        }

        [Authorize]
        [HttpGet]
        public IActionResult DisplayRoomsContainingUser()
        {
            return View();
        }
        
        public async Task<IActionResult> SendMessageToUser(string text, string target)
        {
            var user = await _userManager.GetUserAsync(User);
            var userId = _userManager.GetUserId(User);

            if (user == null)
                return BadRequest("User must be logged in!");

            var userName = user.UserName;
            User receiver = await _unitOfWork.Users.GetUserByName(target);

            if (receiver == null)
                return NotFound("Invalid target!");

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
                return BadRequest("Invalid room name!");

            if (chatRoom.ChatType == ChatType.Ephemeral)
                return Ok(new MessageNotificationVM { Message = message, Notification = null });


            if (chatRoom.Messages == null)  // ?
            {
                chatRoom.Messages = new List<Message>();
            }

            chatRoom.Messages.Add(message);

            // notification
            Notification notification;
            string notificationText = "-";
            string source = "";
            DateTime creationTime = DateTime.Now;

            if (_signInManager.IsSignedIn(User))
            {
                if (chatRoom.ChatType == ChatType.Room || chatRoom.ChatType == ChatType.InviteOnly)
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
                        CreationTime = creationTime,
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
            // messages in ephemeral rooms do not send notifications

            if (_signInManager.IsSignedIn(User) && chatRoom.ChatType != ChatType.Ephemeral)
                notification = new Notification { CreationTime = creationTime, UserId = userId, Text = notificationText, Source = source };

            MessageNotificationVM model = new MessageNotificationVM
            {
                Message = message,
                Notification = notification
            };

            return Ok(model);
        }
        
        [HttpGet]
        public async Task<IActionResult> DisplayChatRoom(string roomName)
        {
            User user = await _userManager.GetUserAsync(User);
            bool contains = await _unitOfWork.ChatRooms.RoomContainsUser(roomName, user);
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetRoomWithMessages(roomName);

            if (!contains && (chatRoom.ChatType == ChatType.InviteOnly || chatRoom.ChatType == ChatType.Private))
                return BadRequest();

            //if (!(await _unitOfWork.ChatRooms.RoomContainsUser(roomName, user)))
            //    return BadRequest();

            
            // check if the user is included in the room

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
                return BadRequest("Invalid room name!");
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
                return BadRequest("Invalid room name");
            }

            List<Message> messages = (await _unitOfWork.Messages.GetNext(chatRoom.Id, skip, size)).ToList();

            return Ok(messages);
        }

        public async Task<IActionResult> GetMessageCount(string roomName)
        {
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetByName(roomName);

            if (chatRoom == null)
            {
                return BadRequest("Invalid room name!");
            }

            List<Message> messages = _unitOfWork.Messages.Find(x => x.ChatRoomId == chatRoom.Id).ToList();
            return Ok(messages.Count);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> JoinRoom(string roomName) // Any Room
        {
            var user = await _userManager.GetUserAsync(User);
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetRoomWithUsers(roomName);

            if (chatRoom == null)
                return BadRequest("Invalid room name!");

            if (!chatRoom.Users.Contains(user))
            {
                chatRoom.Users.Add(user);
                await _unitOfWork.Complete();
            }

            return Ok();
        }

        [HttpGet]
        [Authorize]
        public IActionResult DisplayRoomsCreatedBy()
        {
            return View();
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetRoomsCreatedBy()
        {
            string userId = _userManager.GetUserId(User);
            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetChatRoomsCreatedBy(userId)).ToList();

            return Ok(rooms);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> JoinChatRoom(string roomName)  // Room or Ephemeral
        {
            var user = await _userManager.GetUserAsync(User);

            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetRoomWithUsers(roomName);

            if (chatRoom.ChatType == ChatType.InviteOnly || chatRoom.ChatType == ChatType.Private)
                return BadRequest();

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

        public async Task<IActionResult> CreatePrivateRoom(string user1Id, string user2Id) // user2 is the request sender
        {
            User user1 = await _unitOfWork.Users.Get(user1Id);
            if (user1 == null)
                return BadRequest("Invalid user!");

            User user2 = await _unitOfWork.Users.Get(user2Id);
            if (user2 == null)
                return BadRequest("Invalid user!");

            int cmp = String.Compare(user1.Id, user2.Id);
            string roomName = (cmp <= 0 ? user1.Id : user2.Id) + "_" + (cmp <= 0 ? user2.Id : user1.Id);

            ChatRoom room = await _unitOfWork.ChatRooms.GetByName(roomName);

            if (room != null)
                return BadRequest("Private room already exists");

            room = new ChatRoom
            {
                ChatType = ChatType.Private,
                RoomName = roomName,
                DisplayName = user1.UserName + " - " + user2.UserName
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
