using ChatDemoSignalR.Data;
using ChatDemoSignalR.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public class NotificationRepository : Repository<Notification>, INotificationRepository
    {
        public NotificationRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<IEnumerable<Notification>> GetUserNotifications(string userId)
        {
            return await AppDbContext.Notifications.Where(x => x.UserId == userId && !x.IsRead).ToListAsync();
        }

        public async Task<int> GetCount()
        {
            return await AppDbContext.Notifications.CountAsync();
        }

        public async Task<IEnumerable<Notification>> GetNext(string userId, int skip, int size)
        {
            List<Notification> allNotifications = await AppDbContext.Notifications.Where(x => x.UserId == userId).ToListAsync();
            int count = allNotifications.Count;

            List<Notification> notifications = allNotifications.Skip(count - skip - size).Take(size).ToList();
            notifications.Reverse();

            return notifications;
        }

        public async Task ReadNotification(int notificationId)  // is update?
        {
            Notification notification = await AppDbContext.Notifications.SingleOrDefaultAsync(x => x.Id == notificationId);

            if (notification == null)
                return;

            notification.IsRead = true;
            AppDbContext.Notifications.Update(notification);
        }

        public AppDbContext AppDbContext
        {
            get { return Context as AppDbContext; }
        }
    }
}
