using ChatDemoSignalR.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Data
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base (options)
        {
        }

        public DbSet<Message> Messages { get; set; }

        public DbSet<ChatRoom> ChatRooms { get; set; }

        public DbSet<UserFriends> UserFriends { get; set; }

        public DbSet<Notification> Notifications { get; set; }

        public DbSet<FriendRequest> FriendRequests { get; set; }

        public DbSet<JoinRoomRequest> JoinRoomRequests { get; set; }

        public DbSet<Image> Images { get; set; }

        public DbSet<LogEvent> LogEvents { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<FriendRequest>()
                .HasOne(fr => fr.User)
                .WithMany(u => u.FriendRequests);

            //builder.Entity<JoinRoomRequest>()
            //    .HasOne(r => r.User)
            //    .WithMany(u => u.JoinRoomRequests);

            builder.Entity<UserFriends>()
                .HasKey(uf => new { uf.UserId, uf.FriendId });

            builder.Entity<UserFriends>()
                .HasOne(uf => uf.Friend)
                .WithMany(fr => fr.FollowedBy)
                .HasForeignKey(fr => fr.FriendId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<UserFriends>()
                .HasOne(uf => uf.User)
                .WithMany(u => u.Following)
                .HasForeignKey(uf => uf.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            foreach (var foreignKey in builder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }
    }
}
