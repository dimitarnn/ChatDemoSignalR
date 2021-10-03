using ChatDemoSignalR.Models;
using ChatDemoSignalR.Settings;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;


namespace ChatDemoSignalR.Services
{
    public class MailService : IMailService
    {
        private MailSettings _mailSettings;
        private readonly IWebHostEnvironment _hostEnvironment;
        public MailService(IOptions<MailSettings> mailSettings,
                           IWebHostEnvironment hostEnvironment)
        {
            _mailSettings = mailSettings.Value;
            _hostEnvironment = hostEnvironment;
        }
        
        public async Task SendEmail(MailRequest mailRequest)
        {
            var email = new MimeMessage();
            email.Sender = MailboxAddress.Parse(_mailSettings.Mail);
            email.To.Add(MailboxAddress.Parse(mailRequest.ToEmail));
            email.Subject = mailRequest.Subject;

            var builder = new BodyBuilder();
            if (mailRequest.Attachments != null)
            {
                byte[] fileBytes;
                foreach (var file in mailRequest.Attachments)
                {
                    if (file.Length > 0)
                    {
                        using (var ms = new MemoryStream())
                        {
                            file.CopyTo(ms);
                            fileBytes = ms.ToArray();
                        }
                        builder.Attachments.Add(file.FileName, fileBytes, ContentType.Parse(file.ContentType));
                    }
                }
            }

            builder.HtmlBody = mailRequest.Body;
            email.Body = builder.ToMessageBody();
            using var smtp = new SmtpClient();
            smtp.Connect(_mailSettings.Host, _mailSettings.Port, SecureSocketOptions.StartTls);
            smtp.Authenticate(_mailSettings.Mail, _mailSettings.Password);
            await smtp.SendAsync(email);
            smtp.Disconnect(true);
        }

        public async Task SendConfirmationEmail(ConfirmationEmail request, string link)
        {
            //string filePath = Directory.GetCurrentDirectory() + "\\Templates\\ConfirmationEmailTemplate.html";
            string wwwRootPath = _hostEnvironment.WebRootPath;
            string path = wwwRootPath + "/templates/ConfirmationEmailTemplate.html";
            StreamReader reader = new StreamReader(path);
            string mailText = reader.ReadToEnd();
            reader.Close();
            mailText = mailText
                .Replace("[username]", request.UserName)
                .Replace("[email]", request.ToEmail)
                .Replace("[link]", link);

            // check html

            var email = new MimeMessage();
            email.Sender = MailboxAddress.Parse(_mailSettings.Mail);
            email.To.Add(MailboxAddress.Parse(request.ToEmail));
            email.Subject = $"Email verification for {request.ToEmail}";
            var builder = new BodyBuilder();
            builder.HtmlBody = mailText;
            email.Body = builder.ToMessageBody();
            using var smtp = new SmtpClient();
            smtp.Connect(_mailSettings.Host, _mailSettings.Port, SecureSocketOptions.StartTls);
            smtp.Authenticate(_mailSettings.Mail, _mailSettings.Password);
            await smtp.SendAsync(email);
            smtp.Disconnect(true);
        }
    }
}
