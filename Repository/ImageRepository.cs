using ChatDemoSignalR.Data;
using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public class ImageRepository : Repository<Image>, IImageRepository
    {
        public ImageRepository(AppDbContext context)
            : base(context)
        {
        }

        // methods for getting images by name, user, title
    }
}
