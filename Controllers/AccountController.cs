using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Hubs;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.ViewModels;
using ChatDemoSignalR.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace ChatDemoSignalR.Controllers
{
    public class AccountController : Controller
    {
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly IHubContext<MessageHub> _chat;
        private readonly AppDbContext _context;

        public AccountController(SignInManager<User> signInManager,
            UserManager<User> userManager,
            IHubContext<MessageHub> chat,
            AppDbContext context)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _chat = chat;
            _context = context;
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(string username, string password)
        {
            var user = await _userManager.FindByNameAsync(username);

            if (user != null)
            {
                var result = await _signInManager.PasswordSignInAsync(user, password, false, false);

                if (result.Succeeded)
                {
                    return RedirectToAction("Index", "Home");
                }
            }

            return RedirectToAction("Login", "Account");
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(string username, string firstName, string lastName, string password)
        {
            var user = new User
            {
                UserName = username,
                Email = username,
                FirstName = firstName,
                LastName = lastName
            };

            var result = await _userManager.CreateAsync(user, password);

            if (result.Succeeded)
            {
                await _signInManager.SignInAsync(user, isPersistent: false);
                //var userId = await _userManager.GetUserIdAsync(User);
                //var tmpUser = await _userManager.FindByIdAsync(userId);
                //var currUser = await _userManager.GetUserAsync(User);
                return RedirectToAction("Index", "Home");
            }

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error.Description);
            }

            return View();
        }

        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Index", "Home");
            //return View();
        }

        [Authorize]
        [HttpGet]
        public IActionResult ListUsers()
        {
            var userId = _userManager.GetUserId(User);
            var user = _context.Users.Include(x => x.Following).SingleOrDefault(x => x.Id == userId);

            //if (user.Friends == null)
            //    user.Friends = new List<User>();

            List<User> users;
            List<User> friends = new List<User>();

            foreach (var tmp in user.Following)
            {
                User friend = _context.Users.SingleOrDefault(x => x.Id == tmp.FriendId);
                if (friend == null)
                    continue;
                friends.Add(friend);
            }

            if (friends.Count() > 0)
                users = _context.Users.Where(x => x.Id != userId && !friends.Contains(x)).ToList();
            else
                users = _context.Users.Where(x => x.Id != userId).ToList();

            return View(users);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddFriend(string friendId)
        {
            //var user = await _userManager.GetUserAsync(User);
            var userId =  _userManager.GetUserId(User);
            var user = _context.Users.Include(x => x.Following).Include(x => x.FollowedBy).SingleOrDefault(x => x.Id == userId);
            var friend = _context.Users.Include(x => x.Following).Include(x => x.FollowedBy).SingleOrDefault(x => x.Id == friendId);

            if (friend == null)
                return RedirectToAction("ListUsers");

            //if (user.Friends == null)
            //    user.Friends = new List<User>();

            //if (friend.Friends == null)
            //    friend.Friends = new List<User>();

            if (friend.Id != user.Id)
            {
                UserFriends friends1 = new UserFriends { User = user, UserId = user.Id, Friend = friend, FriendId = friend.Id };
                UserFriends friends2 = new UserFriends { User = friend, UserId = friend.Id, Friend = user, FriendId = user.Id };

                if (!user.Following.Contains(friends1))
                {
                    user.Following.Add(friends1);
                    user.FollowedBy.Add(friends2);
                    //_context.UserFriends.Add(friends1);
                }

                

                if (!friend.Following.Contains(friends2))
                {
                    friend.Following.Add(friends2);
                    friend.FollowedBy.Add(friends1);
                    //_context.UserFriends.Add(friends2);
                }

                //if (!created)
                //{
                int cmp = String.Compare(user.Id, friend.Id);
                string roomName = (cmp <= 0 ? user.Id : friend.Id) + "_" + (cmp <= 0 ? friend.Id : user.Id);

                var room = await _context.ChatRooms.SingleOrDefaultAsync(x => x.RoomName == roomName);

                if (room == null)
                {
                    ChatRoom chat = new ChatRoom
                    {
                        ChatType = ChatType.Private
                    };


                    chat.RoomName = roomName;
                    chat.Users.Add(user);
                    chat.Users.Add(friend);

                    _context.ChatRooms.Add(chat);
                }
                //}

                await _context.SaveChangesAsync();
            }


            return RedirectToAction("ListUsers");
        }
    }
}
