using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChatDemoSignalR.Controllers
{
    public class MailController : Controller
    {
        private readonly IMailService _mailService;
        
        public MailController(IMailService mailService)
        {
            _mailService = mailService;
        }

        [HttpPost]
        public async Task<IActionResult> SendMail(MailRequest request)
        {
            try
            {
                await _mailService.SendEmail(request);
                return Ok();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public IActionResult Index()
        {
            return View();
        }
    }
}
