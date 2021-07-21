using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public interface INotificationRepository : IRepository<Notification>
    {
        Task<IEnumerable<Notification>> GetUserNotifications(string userId);

        Task<IEnumerable<Notification>> GetNext(string userId, int skip, int size);

        Task<int> GetCount();

        Task ReadNotification(int notificationId);
    }
}
