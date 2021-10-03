using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Data;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
using ChatDemoSignalR.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ChatDemoSignalR.Controllers
{
    [Authorize]
    public class JoinRoomRequestController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly IUnitOfWork _unitOfWork;

        public JoinRoomRequestController(IUnitOfWork unitOfWork, UserManager<User> userManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetJoinRoomRequests()
        {
            string userId = _userManager.GetUserId(User);

            if (userId == null)
                return BadRequest("User must be logged in!");

            List<JoinRoomRequest> requests = (await _unitOfWork.JoinRoomRequests.GetPending(userId)).ToList();
            List<JoinRoomRequestVM> list = new List<JoinRoomRequestVM>();

            foreach (JoinRoomRequest request in requests)
            {
                JoinRoomRequestVM model = new JoinRoomRequestVM
                {
                    Id = request.Id,
                    UserId = request.UserId,
                    SenderId = request.SenderId,
                    SenderName = request.SenderName,
                    ChatRoomId = request.ChatRoomId,
                    RoomName = request.ChatRoom.RoomName,
                    Text = request.Text,
                    Status = request.Status,
                    SendTime = request.SendTime
                };

                list.Add(model);
            }

            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> SendRequest(string userId, string roomName, string text = "")
        {
            User sender = await _userManager.GetUserAsync(User);
            User user = await _unitOfWork.Users.Get(userId);
            ChatRoom chatRoom = await _unitOfWork.ChatRooms.GetByName(roomName);
            DateTime creationTime = DateTime.Now;

            if (user == null)
                return BadRequest("Invalid user!");

            if (chatRoom == null)
                return BadRequest("Invalid room name!");

            // add validation for user

            if ((await _unitOfWork.JoinRoomRequests.HasSent(sender.Id, userId, roomName))) // already sent
                return BadRequest("User is already invited!");

            if ((await _unitOfWork.ChatRooms.RoomContainsUser(roomName, user)))
                return BadRequest("User has already joined!");

            if (text.Length == 0)
                text = $"I invite you to join room <{roomName}>";

            JoinRoomRequest request = new JoinRoomRequest
            {
                SendTime = creationTime,
                User = user,
                UserId = user.Id,
                SenderId = sender.Id,
                SenderName = sender.UserName,
                Text = text,
                ChatRoom = chatRoom,
                ChatRoomId = chatRoom.Id
            };

            //notification
            Notification notification = new Notification
            {
                CreationTime = creationTime,
                User = user,
                UserId = user.Id,
                Text = $"{sender.UserName} invites you to join room <{roomName}>",
                Source = "/JoinRoomRequest/Index"
            };

            _unitOfWork.Notifications.Add(notification);

            Notification response = new Notification
            {
                CreationTime = creationTime,
                UserId = user.Id,
                Text = $"{sender.UserName} invites you to join room <{roomName}>",
                Source = "/JoinRoomRequest/Index"
            };

            user.JoinRoomRequests.Add(request);
            await _unitOfWork.Complete();

            return Ok(response);
        }

        public async Task<IActionResult> Accept(string id)
        {
            JoinRoomRequest request = await _unitOfWork.JoinRoomRequests.Get(id);
            if (request == null)
                return BadRequest("Invalid request!");

            User receiver = await _unitOfWork.Users.Get(request.SenderId);    // notification receiver
            if (receiver == null)
                return BadRequest("Invalid request receiver!");

            User user = await _userManager.GetUserAsync(User);
            if (user == null)
                return BadRequest("User must be signed in!");

            ChatRoom room = await _unitOfWork.ChatRooms.Get(request.ChatRoomId);
            if (room == null)
                return BadRequest("Invalid chat room!");
            DateTime creationTime = DateTime.Now;

            if (request == null)
                return BadRequest("Invalid request!");

            await _unitOfWork.JoinRoomRequests.Accept(id);

            Notification notification = new Notification
            {
                User = receiver,
                UserId = receiver.Id,
                Text = $"{user.UserName} has accepted you invite and has joined room <{room.RoomName}>",
                CreationTime = creationTime,
                Source = $"/Chat/DisplayChatRoom?roomName={room.RoomName}"
            };

            _unitOfWork.Notifications.Add(notification);

            Notification response = new Notification
            {
                UserId = receiver.Id,
                Text = $"{user.UserName} has accepted you invite and has joined room <{room.RoomName}>",
                CreationTime = creationTime,
                Source = $"/Chat/DisplayChatRoom?roomName={room.RoomName}"
            };

            await _unitOfWork.Complete();

            return Ok(response);
        }

        public async Task<IActionResult> Decline(string id)
        {
            JoinRoomRequest request = await _unitOfWork.JoinRoomRequests.Get(id);

            if (request == null)
                return BadRequest("Invalid request!");

            await _unitOfWork.JoinRoomRequests.Decline(id);
            await _unitOfWork.Complete();

            return Ok();
        }

        public IActionResult Index()
        {
            return View();
        }
    }
}
