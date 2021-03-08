using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ChatDemoSignalR.Data;
using ChatDemoSignalR.Hubs;
using ChatDemoSignalR.Models;
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

        public IActionResult Index()
        {
            var rooms = _context.ChatRooms.ToList();
            return View(rooms);
        }

        public IActionResult DisplayRooms()
        {
            var rooms = _context.ChatRooms.ToList();
            return View(rooms);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRoom(string roomName)
        {
            var chatRoom = new ChatRoom
            {
                RoomName = roomName
            };

            _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            return RedirectToAction("DisplayRooms", "Chat");
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

            var message = new Message { Text = text, Sender = sender, SendTime = DateTime.Now };
            var chatRoom = _context.ChatRooms.SingleOrDefault(x => x.RoomName == roomName);

            if (chatRoom != null)
            {
                chatRoom.Messages.Add(message);
                await _context.SaveChangesAsync();
            }

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
            }

            return Ok();
        }

        /// leave room
    }
}
