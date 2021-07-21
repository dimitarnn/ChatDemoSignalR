using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatDemoSignalR.Controllers
{
    public class NotificationController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly IUnitOfWork _unitOfWork;

        public NotificationController(UserManager<User> userManager,
            IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _unitOfWork = unitOfWork;
        }

        public async Task<IActionResult> GetNotifications()
        {
            var userId = _userManager.GetUserId(User);
            List<Notification> notifications = (await _unitOfWork.Notifications.GetUserNotifications(userId)).ToList();

            return Ok(new { Notifications = notifications, Count = notifications.Count });
        }

        public async Task<IActionResult> LoadNotifications(int skip, int size) // int index, int size
        {
            var userId = _userManager.GetUserId(User);

            List<Notification> notifications = (await _unitOfWork.Notifications.GetNext(userId, skip, size)).ToList();
            return Ok(notifications);
        }

        public async Task<List<Notification>> GetNotificationsList() // ?
        {
            var userId = _userManager.GetUserId(User);

            if (userId == null)
                return new List<Notification>();

            List<Notification> notifications = (await _unitOfWork.Notifications.GetUserNotifications(userId)).ToList();
            notifications.Reverse();

            return notifications;
        }

        public async Task<IActionResult> GetNotificationsCount()
        {
            var userId = _userManager.GetUserId(User);

            if (userId == null)
                return Ok(0);

            int count = await _unitOfWork.Notifications.GetCount();
            return Ok(count);
        }

        public async Task<IActionResult> ReadNotification(int notificationId)
        {
            await _unitOfWork.Notifications.ReadNotification(notificationId);
            await _unitOfWork.Complete();

            return Ok();
        }
    }
}
