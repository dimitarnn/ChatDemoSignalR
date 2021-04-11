using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ChatDemoSignalR.Data;
using ChatDemoSignalR.Hubs;
using ChatDemoSignalR.Models;
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

        public ChatController(IHubContext<MessageHub> chat,
            AppDbContext context,
            SignInManager<User> signInManager,
            UserManager<User> userManager)
        {
            _chat = chat;
            _context = context;
            _signInManager = signInManager;
            _userManager = userManager;

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

        public IActionResult Index()
        {
            var rooms = _context.ChatRooms.ToList();
            return View(rooms);
        }

        public IActionResult DisplayRooms()
        {
            var rooms = _context.ChatRooms.Where(x => x.ChatType == ChatType.Room).ToList();
            return View(rooms);
        }

        [Authorize]
        public async Task<IActionResult> DisplayAllPrivateChats()
        {
            var userId =  _userManager.GetUserId(User);
            var user = await _context.Users.Include(x => x.Following).SingleOrDefaultAsync(x => x.Id == userId);

            //var user1 = await _context.Users.Include(x => x.Following).ThenInclude(y => y.Friend).SingleOrDefaultAsync(x => x.Id == userId);
            // possible to include Frinds as User Model

            List<User> friends = new List<User>();
            foreach (var tmp in user.Following)
            {
                var friend = await _context.Users.SingleOrDefaultAsync(x => x.Id == tmp.FriendId);
                if (friend != null)
                {
                    friends.Add(friend);
                }
            }

            return View(friends);
        }

        [Authorize]
        public async Task<IActionResult> DisplayPrivateChat(string friendId)
        {
            var userId = _userManager.GetUserId(User);

            int cmp = String.Compare(userId, friendId);
            string roomName = (cmp <= 0 ? userId : friendId) + "_" + (cmp <= 0 ? friendId : userId);

            var chatRoom = await _context.ChatRooms.Include(x => x.Users).Include(x => x.Messages).SingleOrDefaultAsync(x => x.RoomName == roomName);
            return View(chatRoom);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRoom(string roomName)
        {
            /*
             *  validation
             */

            if (roomName == null || roomName.Length == 0)
                return RedirectToAction("DisplayRooms");

            var result = await _context.ChatRooms.SingleOrDefaultAsync(x => x.RoomName == roomName);

            if (result != null)
                return RedirectToAction("DisplayRooms");

            var chatRoom = new ChatRoom
            {
                RoomName = roomName,
                ChatType = ChatType.Room
            };

            _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            return RedirectToAction("DisplayRooms", "Chat");
        }

        [Authorize]
        public async Task<IActionResult> PersonalPage()
        {
            var userId = _userManager.GetUserId(User);

            //_userManager.GetUser
            //var user = await _userManager.GetUserAsync(User);
            //var test_user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == User.Identity.Name);

            //var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == User.Identity.Name);
            var user = await _userManager.GetUserAsync(User);
            //var messagesArr = await _context.Users.Include(x => x.Messages).ToListAsync();
            //var messages_list = _context.Messages.Where(x => x.UserId == userId).ToList();

            List<Message> messages =_context.Messages.Where(x => x.UserId == userId).ToList();
            List<User> users = _context.Users.Where(x => x.Email != user.Email).ToList();

            var model = new PersonalPageVM { Messages = messages, Users = users};

            return View(model);
        }

        public async Task<IActionResult> SendMessageToUser(string text, string target)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
                return NotFound("Could not find sender"); /// parameter ?

            var userName = user.UserName;
            var receiver = await _context.Users.SingleOrDefaultAsync(x => x.UserName == target);

            if (receiver == null)
                return NotFound("Coulld not find target"); /// parameter ?

            var message = new Message { Text = text, Sender = userName, SendTime = DateTime.Now, UserId = receiver.Id };
            //var message = new Message { Text = text, Sender = userName, SendTime = DateTime.Now };

            _context.Messages.Add(message);
            //receiver.Messages.Add(message);
            await _context.SaveChangesAsync();

            var allMessages = _context.Messages.ToList();

            return Ok(message);
        }

        public async Task<IActionResult> SendMessage(string text, string roomName)
        {
            var userName = User.Identity.Name;
            var userId = _userManager.GetUserId(User);
            var user = await _userManager.FindByIdAsync(userId);
            var sender = "Anonymous";

            if (user != null) /// not needed ?
            {
                sender = user.UserName;
            }

            /// encrypt message
            //text = EncryptCeaser(text, 1);

            var message = new Message { Text = text, Sender = sender, SendTime = DateTime.Now };
            var chatRoom = _context.ChatRooms.SingleOrDefault(x => x.RoomName == roomName);

            if (chatRoom != null)
            {
                if (chatRoom.Messages == null)
                {
                    chatRoom.Messages = new List<Message>();
                }
                
                chatRoom.Messages.Add(message);
                await _context.SaveChangesAsync();
            }

            //var allMessages = _context.Messages.ToList();

            return Ok(message);
        }

        public IActionResult DisplayChatRoom(string roomName)
        {
            var chatRoom = _context.ChatRooms.Include(x => x.Messages).SingleOrDefault(x => x.RoomName == roomName);
            if (chatRoom == null)
            {
                return RedirectToAction("Index", "Home");
            }
            return View(chatRoom);
        }

        public async Task<IActionResult> JoinRoom(string roomName)
        {
            var user = await _userManager.GetUserAsync(User);
            var chatRoom = _context.ChatRooms.SingleOrDefault(x => x.RoomName == roomName);

            if (chatRoom != null && !chatRoom.Users.Contains(user))
            {
                chatRoom.Users.Add(user);
                await _context.SaveChangesAsync(); /// needed?
            }

            return Ok();
        }

        /// leave room
    }
}
