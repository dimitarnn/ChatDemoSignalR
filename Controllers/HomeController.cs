using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ChatDemoSignalR.Models;
using System.Net;
using System.Web;
using Serilog;
using System.Threading;
using ChatDemoSignalR.Data;

namespace ChatDemoSignalR.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly AppDbContext _context;

        public HomeController(ILogger<HomeController> logger, AppDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public IActionResult WebUrl(string url)
        {
            return Ok(WebUtility.UrlEncode(url));
        }

        public IActionResult HttpUrl(string url)
        {
            return Ok(HttpUtility.UrlEncode(url));
        }

        public IActionResult Index()
        {
            //List<LogEvent> events = _context.LogEvents.ToList();

            //Log.Information("User with Thread {Thread} visited /Home/Index at {Now}", Thread.CurrentThread.ManagedThreadId, DateTime.Now);
            return View();
        }

        public IActionResult TestView()
        {
            return View();
        }

        public IActionResult Test()
        {
            return View();
        }

        public IActionResult GetUserName()
        {
            var username = User.Identity.Name;

            if (username == null)
                return NotFound();

            return Ok(username);
        }

        public IActionResult Chat()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
