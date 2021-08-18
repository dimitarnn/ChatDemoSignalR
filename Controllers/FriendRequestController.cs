using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
using ChatDemoSignalR.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ChatDemoSignalR.Controllers
{
    [Authorize]
    public class FriendRequestController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;

        public FriendRequestController(IUnitOfWork unitOfWork, UserManager<User> userManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
        }
        
        public async Task<IActionResult> GetAll()
        {
            User user = await _userManager.GetUserAsync(User);
            List<FriendRequest> requests = (await _unitOfWork.FriendRequests.GetAll(user.Id)).ToList();
            List<FriendRequestVM> response = new List<FriendRequestVM>();

            foreach (FriendRequest request in requests)
            {
                FriendRequestVM model = new FriendRequestVM
                {
                    Id = request.Id,
                    UserId = request.UserId,
                    UserName = request.User.UserName,
                    SenderId = request.SenderId,
                    SenderName = request.Sender.UserName,
                    SendTime = request.SendTime,
                    Status = request.Status
                };

                response.Add(model);
            }

            return Ok(response);
        }

        public async Task<IActionResult> GetPending()
        {
            User user = await _userManager.GetUserAsync(User);
            List<FriendRequest> requests = (await _unitOfWork.FriendRequests.GetPending(user.Id)).ToList();
            List<FriendRequestVM> response = new List<FriendRequestVM>();

            foreach (FriendRequest request in requests)
            {
                FriendRequestVM model = new FriendRequestVM
                {
                    Id = request.Id,
                    UserId = request.UserId,
                    UserName = request.User.UserName,
                    SenderId = request.SenderId,
                    SenderName = request.Sender.UserName,
                    SendTime = request.SendTime,
                    Status = request.Status
                };

                response.Add(model);
            }

            return Ok(response);
        }

        public async Task<IActionResult> GetAccepted()
        {
            User user = await _userManager.GetUserAsync(User);
            List<FriendRequest> requests = (await _unitOfWork.FriendRequests.GetAccepted(user.Id)).ToList();
            List<FriendRequestVM> response = new List<FriendRequestVM>();

            foreach (FriendRequest request in requests)
            {
                FriendRequestVM model = new FriendRequestVM
                {
                    Id = request.Id,
                    UserId = request.UserId,
                    UserName = request.User.UserName,
                    SenderId = request.SenderId,
                    SenderName = request.Sender.UserName,
                    SendTime = request.SendTime,
                    Status = request.Status
                };

                response.Add(model);
            }

            return Ok(response);
        }

        public async Task<IActionResult> GetDeclined()
        {
            User user = await _userManager.GetUserAsync(User);
            List<FriendRequest> requests = (await _unitOfWork.FriendRequests.GetDeclined(user.Id)).ToList();
            List<FriendRequestVM> response = new List<FriendRequestVM>();

            foreach (FriendRequest request in requests)
            {
                FriendRequestVM model = new FriendRequestVM
                {
                    Id = request.Id,
                    UserId = request.UserId,
                    UserName = request.User.UserName,
                    SenderId = request.SenderId,
                    SenderName = request.Sender.UserName,
                    SendTime = request.SendTime,
                    Status = request.Status
                };

                response.Add(model);
            }

            return Ok(response);
        }

        public async Task<IActionResult> GetAvailable()
        {
            string userId = _userManager.GetUserId(User);
            List<User> users = (await _unitOfWork.Users.GetAll()).ToList();
            List<User> available = new List<User>();

            foreach (User user in users)
            {
                if (user.Id == userId)
                    continue;

                bool hasSent = await _unitOfWork.FriendRequests.HasSent(userId, user.Id);
                bool hasReceived = await _unitOfWork.FriendRequests.HasSent(user.Id, userId);
                bool isFriendsWith = await _unitOfWork.Users.IsFriendsWith(userId, user.Id);

                if (!hasSent && !isFriendsWith && !hasReceived)
                    available.Add(user);
            }

            return Ok(available);
        }

        public async Task<IActionResult> SendFriendRequest(string userId)
        {
            User sender = await _userManager.GetUserAsync(User);
            User receiver = await _unitOfWork.Users.Get(userId);
            DateTime creationTime = DateTime.Now;

            if ((await _unitOfWork.FriendRequests.HasSent(sender.Id, receiver.Id)))
                return Ok(null);

            if ((await _unitOfWork.Users.IsFriendsWith(sender.Id, receiver.Id)))
                return Ok(null);

            FriendRequest request = new FriendRequest
            {
                SendTime = creationTime,
                UserId = receiver.Id,
                User = receiver,
                SenderId = sender.Id,
                Sender = sender
            };

            // notification
            Notification notification = new Notification
            {
                CreationTime = creationTime,
                User = receiver,
                UserId = receiver.Id,
                Text = $"{sender.UserName} has sent you a friend request!",
                Source = "/FriendRequest/ListPending"
            };

            _unitOfWork.Notifications.Add(notification);

            // send the notification, without the users model
            Notification response = new Notification
            {
                CreationTime = creationTime,
                UserId = receiver.Id,
                Text = $"{sender.UserName} has sent you a friend request!",
                Source = "/FriendRequest/ListPending"
            };

            receiver.FriendRequests.Add(request);
            await _unitOfWork.Complete();

            return Ok(response);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AcceptRequest(int id)
        {
            FriendRequest request = await _unitOfWork.FriendRequests.Get(id);
            User user = await _userManager.GetUserAsync(User);
            DateTime creationTime = DateTime.Now;

            if (request == null)
                return BadRequest();

            await _unitOfWork.FriendRequests.Accept(id);

            // notification
            Notification notification = new Notification
            {
                CreationTime = creationTime,
                UserId = request.SenderId,
                User = request.Sender,
                Text = $"{user.UserName} has accepted you friend request!",
                Source = "/Chat/DisplayAllPrivateChats"
            };

            _unitOfWork.Notifications.Add(notification);

            Notification response = new Notification    // adding user creates a loop, error 500
            {
                CreationTime = creationTime,
                Id = notification.Id,                   // ?
                UserId = request.SenderId,
                Text = $"{user.UserName} has accepted you friend request!",
                Source = "/Chat/DisplayAllPrivateChats"
            };

            await _unitOfWork.Complete();

            return Ok(response);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> DeclineRequest(int id)
        {
            await _unitOfWork.FriendRequests.Decline(id);
            await _unitOfWork.Complete();
            return Ok();
        }

        public IActionResult ListPending()
        {
            return View();
        }

        public IActionResult ListAvailable()
        {
            return View();
        }
    }
}
