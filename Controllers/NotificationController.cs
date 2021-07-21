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
        //private readonly INotificationRepository _notificationRepositroy;
        private readonly IUnitOfWork _unitOfWork;

        public NotificationController(UserManager<User> userManager,
            //INotificationRepository notificationRepository,
            IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            //_notificationRepositroy = notificationRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<IActionResult> GetNotifications()
        {
            var userId = _userManager.GetUserId(User);
            //List<Notification> notifications = (await _notificationRepositroy.GetUserNotifications(userId)).ToList();
            List<Notification> notifications = (await _unitOfWork.Notifications.GetUserNotifications(userId)).ToList();

            return Ok(new { Notifications = notifications, Count = notifications.Count });
        }

        public async Task<IActionResult> LoadNotifications(int skip, int size) // int index, int size
        {
            var userId = _userManager.GetUserId(User);
            //List<Notification> allNotifications = (await _notificationRepositroy.GetUserNotifications(userId)).ToList();
            //List<Notification> allNotifications = (await _unitOfWork.Notifications.GetUserNotifications(userId)).ToList();
            //int count = allNotifications.Count;
            //allNotifications.Reverse();

            //int offset = Math.Max(0, (index - 1) * size);
            //var notifications = allNotifications.Skip(offset).Take(Math.Min(size, count - offset)).ToList();

            List<Notification> notifications = (await _unitOfWork.Notifications.GetNext(userId, skip, size)).ToList();
            return Ok(notifications);
        }

        public async Task<List<Notification>> GetNotificationsList() // ?
        {
            var userId = _userManager.GetUserId(User);

            if (userId == null)
                return new List<Notification>();

            //List<Notification> notifications = (await _notificationRepositroy.GetUserNotifications(userId)).ToList();
            List<Notification> notifications = (await _unitOfWork.Notifications.GetUserNotifications(userId)).ToList();
            notifications.Reverse();

            return notifications;
        }

        public async Task<IActionResult> GetNotificationsCount()
        {
            var userId = _userManager.GetUserId(User);

            if (userId == null)
                return Ok(0);

            //List<Notification> notifications = (await _notificationRepositroy.GetUserNotifications(userId)).ToList();
            //return Ok(notifications.Count);

            int count = await _unitOfWork.Notifications.GetCount();
            return Ok(count);
        }

        public async Task<IActionResult> ReadNotification(int notificationId)
        {
            //await _notificationRepositroy.ReadNotification(notificationId);
            //await _notificationRepositroy.Save();
            await _unitOfWork.Notifications.ReadNotification(notificationId);
            await _unitOfWork.Complete();
            return Ok();
        }
    }
}
