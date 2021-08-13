using ChatDemoSignalR.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Services
{
    public interface IMailService
    {
        Task SendEmail(MailRequest mailRequest);

        Task SendConfirmationEmail(ConfirmationEmail request, string link);
    }
}
