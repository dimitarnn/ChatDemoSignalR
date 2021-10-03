using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Models
{
    public class Image
    {
        public Image()
        {
            CreationDate = DateTime.Now;
            Description = "No description";
        }
        
        public int Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public string FileName { get; set; }

        [NotMapped]
        public IFormFile File { get; set; }

        public DateTime CreationDate { get; set; }

#nullable enable
        public string CreatorName { get; set; }

        public User Creator { get; set; }
#nullable disable
    }
}
