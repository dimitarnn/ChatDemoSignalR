using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
using ChatDemoSignalR.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace ChatDemoSignalR.Controllers
{
    public class ImageController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IImageService _imageService;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;

        public ImageController(IUnitOfWork unitOfWork,
                               IImageService imageService,
                               SignInManager<User> signInManager,
                               UserManager<User> userManager)
        {
            _unitOfWork = unitOfWork;
            _imageService = imageService;
            _signInManager = signInManager;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            List<Image> images = (await _unitOfWork.Images.GetAll()).ToList();

            return View(images);
        }

        [Authorize]
        [HttpGet]
        public IActionResult AddImage()
        {
            Image model = new Image();
            return View(model);
        }
        
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddImage(Image image)
        {
            User user = await _userManager.GetUserAsync(User);
            string username = (user == null ? "Anonymous" : user.UserName);
            Log.Information("[CUSTOM] User {User} sends request to add an image at {Now}", username, DateTime.Now);

            if (user != null)
            {
                image.Creator = user;
                image.CreatorName = user.UserName;
            }

            image = await _imageService.Save(image);
            _unitOfWork.Images.Add(image);

            await _unitOfWork.Complete();
            Log.Information("[CUSTOM] User {User} successfully added an image at {Now}", username, DateTime.Now);

            return RedirectToAction("Index", "Image");
        }
    }
}
