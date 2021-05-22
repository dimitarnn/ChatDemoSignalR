using ChatDemoSignalR.Data;
using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly AppDbContext _context;

        public NotificationRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<Notification> GetUserNotifications(string userId)
        {
            return _context.Notifications.Where(x => x.UserId == userId && !x.IsRead).ToList();
        }

        public async Task Create(Notification notification)
        {
            _context.Notifications.Add(notification);
            //_context.SaveChanges();
            await _context.SaveChangesAsync();
        }

        public void ReadNotification(int notificationId)
        {
            var notification = _context.Notifications.SingleOrDefault(x => x.Id == notificationId);

            if (notification == null)
                return;

            notification.IsRead = true;
            _context.Notifications.Update(notification);
            _context.SaveChanges();
        }
    }
}
