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
using ChatDemoSignalR.Repository;
using ChatDemoSignalR.Services;
using System.Net;
using System.Web;
using FluentValidation.Results;
using FluentValidation;

namespace ChatDemoSignalR.Controllers
{
    public class AccountController : Controller
    {
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly IHubContext<MessageHub> _chat;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMailService _mailService;
        private readonly IValidator<User> _userValidator;

        public AccountController(SignInManager<User> signInManager,
            UserManager<User> userManager,
            IHubContext<MessageHub> chat,
            IUnitOfWork unitOfWork,
            IMailService mailService,
            IValidator<User> userValidator)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _chat = chat;
            _unitOfWork = unitOfWork;
            _mailService = mailService;
            _userValidator = userValidator;
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
            List<string> errors = new List<string>();

            if (user != null)
            {
                var result = await _signInManager.PasswordSignInAsync(user, password, false, false);

                if (result.Succeeded)
                {
                    return Ok();
                    //return RedirectToAction("Index", "Home");
                }
                errors.Add("Invalid username or password!");
                return BadRequest(errors);
            }

            errors.Add("Specified username doesn't exist!");
            return BadRequest(errors);
            //return RedirectToAction("Login", "Account");
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(string username, string email, string firstName, string lastName, string password)
        {
            var user = new User
            {
                UserName = username,
                Email = email,
                FirstName = firstName,
                LastName = lastName
            };

            ValidationResult validationResult = _userValidator.Validate(user);
            List<string> errors = new List<string>();

            if (!validationResult.IsValid)
            {
                foreach (var error in validationResult.Errors)
                {
                    errors.Add(error.ErrorMessage);
                }

                return BadRequest(errors);
            }

            var result = await _userManager.CreateAsync(user, password);

            if (result.Succeeded)
            {
                // generate email token
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                //token = HttpUtility.UrlEncode(token);
                var link = Url.Action(nameof(VerifyEmail), "Account", new { userId = user.Id, token }, Request.Scheme, Request.Host.ToString());
                var newLink = @"https://localhost:44375/Account/VerifyEmail?userId=" +
                    user.Id + "&token=" + HttpUtility.UrlEncode(token);
                var productionLink = @"http://chatdemo.local/Account/VerifyEmail?userId=" +
                    user.Id + "&token=" + HttpUtility.UrlEncode(token);
                
                ConfirmationEmail request = new ConfirmationEmail
                {
                    ToEmail = user.Email,
                    UserName = user.UserName
                };

                await _mailService.SendConfirmationEmail(request, link);

                return Ok();
            }

            foreach (var error in result.Errors)
            {
                errors.Add(error.Description);
            }

            return BadRequest(errors);
        }

        public async Task<IActionResult> VerifyEmail(string userId, string token)
        {
            User user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return BadRequest();

            // decode token

            var result = await _userManager.ConfirmEmailAsync(user, token);

            if (result.Succeeded)
            {
                return View();
            }

            return BadRequest();
        }

        public IActionResult EmailVerification()
        {
            return View();
        }

        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> ListUsers()
        {
            var userId = _userManager.GetUserId(User);
            User user = await _unitOfWork.Users.GetUserWithFollowing(userId);

            IEnumerable<User> users;
            List<User> friends = new List<User>();

            foreach (var tmp in user.Following)
            {
                User friend = await _unitOfWork.Users.Get(tmp.FriendId);
                if (friend == null)
                    continue;
                friends.Add(friend);
            }

            friends.Add(user);

            if (friends.Count() > 0)
                users = await _unitOfWork.Users.GetUsersExcept(friends);
            else
                users = await _unitOfWork.Users.GetUsersExcept(friends);

            return View(users);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddFriend(string friendId)
        {
            var userId =  _userManager.GetUserId(User);
            User user = await _unitOfWork.Users.GetUserWithFollowedAndFollowing(userId);
            User friend = await _unitOfWork.Users.GetUserWithFollowedAndFollowing(friendId);

            if (friend == null)
                return RedirectToAction("ListUsers");

            if (friend.Id != user.Id)
            {
                UserFriends friends1 = new UserFriends { User = user, UserId = user.Id, Friend = friend, FriendId = friend.Id };
                UserFriends friends2 = new UserFriends { User = friend, UserId = friend.Id, Friend = user, FriendId = user.Id };

                if (!user.Following.Contains(friends1))
                {
                    user.Following.Add(friends1);
                    user.FollowedBy.Add(friends2);
                }

                if (!friend.Following.Contains(friends2))
                {
                    friend.Following.Add(friends2);
                    friend.FollowedBy.Add(friends1);
                }

                int cmp = String.Compare(user.Id, friend.Id);
                string roomName = (cmp <= 0 ? user.Id : friend.Id) + "_" + (cmp <= 0 ? friend.Id : user.Id);

                ChatRoom room = await _unitOfWork.ChatRooms.GetByName(roomName);

                if (room == null)
                {
                    ChatRoom chat = new ChatRoom
                    {
                        ChatType = ChatType.Private,
                        RoomName = roomName
                    };

                    chat.Users.Add(user);
                    chat.Users.Add(friend);

                    _unitOfWork.ChatRooms.Add(chat);
                    
                }
                await _unitOfWork.Complete();
            }

            return RedirectToAction("ListUsers");
        }
    }
}
