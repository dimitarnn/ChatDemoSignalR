using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public interface INotificationRepository
    {
        List<Notification> GetUserNotifications(string userId);
        Task Create(Notification notification);
        void ReadNotification(int notificationId);
    }
}
