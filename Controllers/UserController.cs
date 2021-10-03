using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
using ChatDemoSignalR.ViewModels;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ChatDemoSignalR.Controllers
{
    public class UserController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;
        private readonly IValidator<User> _userValidator;

        public UserController(IUnitOfWork unitOfWork,
                              UserManager<User> userManager,
                              IValidator<User> userValidator)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _userValidator = userValidator;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> InviteUsers(string roomName)
        {
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetByName(roomName);
            if (chatRoom == null)
                return BadRequest("Invalid room name!");

            return View(chatRoom);
        }

        [HttpGet]
        public async Task<IActionResult> GetUsersNotInRoomOrInvited(string roomName)
        {
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetByName(roomName);
            if (chatRoom == null)
                return BadRequest("Invalid room name!");

            List<User> users = (await _unitOfWork.Users.GetUsersNotInRoomOrInvited(chatRoom)).ToList();
            List<UserVM> list = new List<UserVM>();

            foreach (User user in users)
            {
                UserVM model = new UserVM
                {
                    Id = user.Id,
                    UserName = user.UserName
                };

                list.Add(model);
            }

            return Ok(list);
        }
        
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddFriend(string friendId)
        {
            string userId = _userManager.GetUserId(User);
            if (userId == null)
                return BadRequest("User must be logged in!");

            User user = await _unitOfWork.Users.GetUserWithFollowedAndFollowing(userId);
            User friend = await _unitOfWork.Users.GetUserWithFollowedAndFollowing(friendId);

            if (friend == null)
                return BadRequest("Invalid user selected!");

            if (friendId == userId)
                return BadRequest("Must select a different user!");

            ValidationResult result = await _userValidator.ValidateAsync(user, options => options.IncludeRuleSets("FriendsLimit"));
            List<string> errors = new List<string>();

            if (!result.IsValid)
            {
                foreach (var error in result.Errors)
                {
                    errors.Add(error.ErrorMessage);
                }

                return BadRequest(errors);
            }

            result = await _userValidator.ValidateAsync(friend, options => options.IncludeRuleSets("FriendsLimit"));

            if (!result.IsValid)
            {
                foreach (var error in result.Errors)
                {
                    errors.Add(error.ErrorMessage);
                }

                return BadRequest(errors);
            }

            //int userFriendsCount = await _unitOfWork.Users.UserFriendsCount(user.Id);
            //int friendFriendsCount = await _unitOfWork.Users.UserFriendsCount(friend.Id);

            //if (userFriendsCount >= user.FriendsLimit)
            //    return BadRequest("User cannot add more friends!");

            //if (friendFriendsCount >= friend.FriendsLimit)
            //    return BadRequest("User cannot accept more requests!");

            UserFriends friends1 = new UserFriends
            {
                User = user,
                UserId = user.Id,
                Friend = friend,
                FriendId = friend.Id
            };

            UserFriends friends2 = new UserFriends
            {
                User = friend,
                UserId = friend.Id,
                Friend = user,
                FriendId = user.Id
            };

            List<UserFriends> list = user.Following.Where(x => x.FriendId == friend.Id).ToList();
            if (list.Count == 0)
            {
                user.Following.Add(friends1);
                user.FollowedBy.Add(friends2);
            }

            list = friend.Following.Where(x => x.FriendId == user.Id).ToList();
            if (list.Count == 0)
            {
                friend.Following.Add(friends2);
                friend.FollowedBy.Add(friends1);
            }

            await _unitOfWork.Complete();
            return Ok();
        }
    }
}
