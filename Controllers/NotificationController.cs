using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ChatDemoSignalR.Controllers
{
    public class NotificationController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly INotificationRepository _notificationRepositroy;

        public NotificationController(UserManager<User> userManager,
            INotificationRepository notificationRepository)
        {
            _userManager = userManager;
            _notificationRepositroy = notificationRepository;
        }

        public IActionResult GetNotifications()
        {
            var userId = _userManager.GetUserId(User);
            var notifications = _notificationRepositroy.GetUserNotifications(userId);
            return Ok(new { Notifications = notifications, Count = notifications.Count });
        }

        public IActionResult ReadNotification(int notificationId)
        {
            _notificationRepositroy.ReadNotification(notificationId);
            return Ok();
        }
    }
}
