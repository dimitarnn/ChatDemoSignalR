using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Services
{
    public interface IImageService
    {
        Task<Image> Save(Image image);
    }
}
