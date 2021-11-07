using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Data;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChatDemoSignalR.Controllers
{
    [Authorize]
    public class LogsController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public LogsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IActionResult> Index()
        {
            List<LogEvent> logEvents = (await _unitOfWork.LogEvents.GetLastCustom()).ToList();

            return View(logEvents);
        }
    }
}
