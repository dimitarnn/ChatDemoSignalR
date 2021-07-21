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
        private readonly AppDbContext _context;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        //private readonly INotificationRepository _notificationRepository;
        //private readonly IChatRepository _chatRepository;
        //private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ChatController(IHubContext<MessageHub> chat,
            AppDbContext context,
            SignInManager<User> signInManager,
            UserManager<User> userManager,
            //INotificationRepository notificationRepository,
            //IChatRepository chatRepository,
            //IUserRepository userRepository,
            IUnitOfWork unitOfWork)
        {
            _chat = chat;
            _context = context;
            _signInManager = signInManager;
            _userManager = userManager;
            //_notificationRepository = notificationRepository;
            //_chatRepository = chatRepository;
            //_userRepository = userRepository;
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

        public async Task<IActionResult> Index()
        {
            //var rooms = await _chatRepository.GetAllRooms();
            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetAll()).ToList();
            return View(rooms);
        }

        public async Task<IActionResult> ListRooms()
        {
            var userId = _userManager.GetUserId(User);
            var user = await _userManager.GetUserAsync(User);

            //var rooms = await _chatRepository.GetRoomsNotContainingUser(user);
            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetRoomsNotContainingUser(user)).ToList();
            return View(rooms);
        }

        public async Task<IActionResult> DisplayRooms()
        {
            //var rooms = await _chatRepository.GetAllChatRooms();
            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetAllChatRooms()).ToList();
            return View(rooms);
        }

        public async Task<IActionResult> GetChatRooms()
        {
            //var rooms = await _chatRepository.GetAllChatRooms();
            List<ChatRoom> rooms = (await _unitOfWork.ChatRooms.GetAllChatRooms()).ToList();
            return Ok(rooms);
        }

        [Authorize]
        public async Task<IActionResult> DisplayAllPrivateChats()
        {
            string userId =  _userManager.GetUserId(User);
            //User user = await _userRepository.GetUserWithFollowing(userId);
            User user = await _unitOfWork.Users.GetUserWithFollowing(userId);

            List<User> friends = new List<User>();
            foreach (var tmp in user.Following)
            {
                //User friend = await _userRepository.GetUser(tmp.FriendId);
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
        public async Task<IActionResult> GetAllUsers()
        {
            string userId = _userManager.GetUserId(User);
            //User user = await _userRepository.GetUserWithFollowing(userId);
            User user = await _unitOfWork.Users.GetUserWithFollowing(userId);

            if (user == null)
                return NotFound();

            List<UserVM> friends = new List<UserVM>();
            foreach (var tmp in user.Following)
            {
                //User friend = await _userRepository.GetUser(tmp.FriendId);
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
            //User friend = await _userRepository.GetUser(friendId);
            User friend = await _unitOfWork.Users.Get(friendId);

            int cmp = String.Compare(userId, friendId);
            string roomName = (cmp <= 0 ? userId : friendId) + "_" + (cmp <= 0 ? friendId : userId);

            //ChatRoom chatRoom = await _chatRepository.GetRoomWithUsersAndMessages(roomName);
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetRoomWithUsersAndMessages(roomName);
            if (chatRoom == null)
            {
                return BadRequest();
            }

            PrivateChatVM model = new PrivateChatVM { ChatRoom = chatRoom, Friend = friend };

            return View(model);
            //return View(chatRoom);
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


            //if (await _chatRepository.ContainsRoom(roomName))
            if (await _unitOfWork.ChatRooms.ContainsRoom(roomName))
                return RedirectToAction("DisplayRooms");

            var chatRoom = new ChatRoom
            {
                RoomName = roomName,
                ChatType = ChatType.Room
            };

            //await _chatRepository.Add(chatRoom);
            //await _chatRepository.Save();

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

            //if (await _chatRepository.ContainsRoom(roomName))
            if (await _unitOfWork.ChatRooms.ContainsRoom(roomName))
                return BadRequest();

            ChatRoom chatRoom = new ChatRoom
            {
                RoomName = roomName,
                ChatType = ChatType.Room
            };

            //await _chatRepository.Add(chatRoom);
            //await _chatRepository.Save();

            _unitOfWork.ChatRooms.Add(chatRoom);
            await _unitOfWork.Complete();

            return Ok(chatRoom);
        }

        [Authorize]
        public async Task<IActionResult> PersonalPage()
        {
            var userId = _userManager.GetUserId(User);
            var user = await _userManager.GetUserAsync(User);

            //List<Message> messages =_context.Messages.Where(x => x.UserId == userId).ToList();
            List<Message> messages = _unitOfWork.Messages.Find(x => x.UserId == userId).ToList();

            //IEnumerable<User> users = await _userRepository.GetUsersExcept(userId);
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
            //User receiver = await _userRepository.GetUserByName(target);
            User receiver = await _unitOfWork.Users.GetUserByName(target);

            if (receiver == null)
                return NotFound("Coulld not find target"); /// parameter ?

            var message = new Message { Text = text, Sender = userName, SendTime = DateTime.Now, UserId = receiver.Id };

            // notification
            string notificationText = $"You received a [private] message from {user.UserName} at " + String.Format("{0:HH:mm:ss dd/MM/yy}", DateTime.Now);
            var notification = new Notification { UserId = receiver.Id, User = receiver, Text = text };

            // adding notification
            //await _notificationRepository.Create(notification);
            //await _notificationRepository.Save();
            _unitOfWork.Notifications.Add(notification);

            //_context.Messages.Add(message);
            //await _context.SaveChangesAsync();

            _unitOfWork.Messages.Add(message);
            await _unitOfWork.Complete();
            
            //var allMessages = _context.Messages.ToList();

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
            //ChatRoom chatRoom = await _chatRepository.GetRoomWithUsers(roomName);
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetRoomWithUsers(roomName);

            if (chatRoom != null)
            {
                if (chatRoom.Messages == null)
                {
                    chatRoom.Messages = new List<Message>();
                }
                
                chatRoom.Messages.Add(message);
                ///await _unitOfWork.Complete();

                //await _context.SaveChangesAsync();
            }

            // notification
            string notificationText = $"New message in {roomName} at " + String.Format("{0:HH:mm:ss dd/MM/yy}", DateTime.Now);
            Notification notification;

            foreach (var member in chatRoom.Users)
            {
                if (member.Id == userId)
                    continue;
                notification = new Notification { UserId = member.Id, User = member, Text = notificationText };
                //await _notificationRepository.Create(notification);
                //await _notificationRepository.Save();
                _unitOfWork.Notifications.Add(notification);
            }

            //await _context.SaveChangesAsync();
            await _unitOfWork.Complete();

            notification = null;

            if (_signInManager.IsSignedIn(User))
                notification = new Notification { UserId = userId, Text = notificationText };

            //notification = unitOfWork.Notification.Find(x => x.UserId == userId)

            MessageNotificationVM model = new MessageNotificationVM
            {
                Message = message,
                Notification = notification
            };

            return Ok(model);
        }

        public async Task<IActionResult> DisplayChatRoom(string roomName)
        {
            //var chatRoom = await _chatRepository.GetRoomWithMessages(roomName);
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
            //var chatRoom = await _chatRepository.GetRoom(roomName);
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetByName(roomName);

            if (chatRoom == null)
            {
                return NotFound();
            }

            //var messages = await _context.Messages.Where(x => x.ChatRoomId == chatRoom.Id).ToListAsync();
            List<Message> messages = _unitOfWork.Messages.Find(x => x.ChatRoomId == chatRoom.Id).ToList();

            return Ok(messages);
        }

        // infinite scroll
        public async Task<IActionResult> GetMessages(string roomName, int skip, int size)
        {
            //var chatRoom = await _chatRepository.GetRoom(roomName);
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetByName(roomName);

            if (chatRoom == null)
            {
                return NotFound();
            }

            //var allMessages = await _context.Messages.Where(x => x.ChatRoomId == chatRoom.Id).ToListAsync();
            //List<Message> allMessages = _unitOfWork.Messages.Find(x => x.ChatRoomId == chatRoom.Id).ToList();
            //int count = allMessages.Count;

            //List<Message> messages = allMessages.Skip(count - (skip + size)).Take(size).ToList();

            List<Message> messages = (await _unitOfWork.Messages.GetNext(chatRoom.Id, skip, size)).ToList();

            return Ok(messages);
        }

        public async Task<IActionResult> GetMessageCount(string roomName)
        {
            //var chatRoom = await _chatRepository.GetRoom(roomName);
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetByName(roomName);

            if (chatRoom == null)
            {
                return NotFound();
            }

            //var messages = await _context.Messages.Where(x => x.ChatRoomId == chatRoom.Id).ToListAsync();
            List<Message> messages = _unitOfWork.Messages.Find(x => x.ChatRoomId == chatRoom.Id).ToList();
            return Ok(messages.Count);
        }

        [Authorize]
        public async Task<IActionResult> JoinRoom(string roomName)
        {
            var user = await _userManager.GetUserAsync(User);

            //var chatRoom = await _chatRepository.GetRoomWithUsers(roomName);
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetRoomWithUsers(roomName);

            if (chatRoom == null)
            {
                return NotFound("Room not found");
            }

            if (chatRoom != null && !chatRoom.Users.Contains(user))
            {
                //_chatRepository.AddUserToRoom(chatRoom, user);
                //await _chatRepository.Save();

                chatRoom.Users.Add(user);
                await _unitOfWork.Complete();

                //chatRoom.Users.Add(user);
                //await _context.SaveChangesAsync();
            }

            return Ok();
        }

        /// leave room
    }
}
