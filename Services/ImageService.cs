using ChatDemoSignalR.Models;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Services
{
    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _hostEnvironment;

        public ImageService(IWebHostEnvironment hostEnvironment)
        {
            _hostEnvironment = hostEnvironment;
        }

        public async Task<Image> Save(Image image)
        {
            string wwwRootPath = _hostEnvironment.WebRootPath;
            string fileName;

            if (image.FileName != null && image.FileName.Length > 0)
            {
                fileName = image.FileName;
            }
            else
            {
                fileName = Path.GetFileNameWithoutExtension(image.File.FileName);
                string extension = Path.GetExtension(image.File.FileName);
                fileName = String.Format("{0}_{1:dd/MM/yyyy HH-mm-ss}{2}", fileName, image.CreationDate, extension);
                image.FileName = fileName;
            }

            string path = Path.Combine(wwwRootPath + "/images/", fileName);
            image.CreationDate = DateTime.Now;

            using (var fileStream = new FileStream(path, FileMode.Create))
            {
                await image.File.CopyToAsync(fileStream);
            }

            return image;
        }
    }
}
