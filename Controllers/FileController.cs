using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace ChatDemoSignalR.Controllers
{
    [Authorize]
    public class FileController : Controller
    {
        private IConfiguration _configuration;
        private int chunkSize;
        private string tempFolder;
        private readonly Response _responseData;

        public FileController(IConfiguration configuration)
        {
            _configuration = configuration;
            chunkSize = 1048576 * Int32.Parse(_configuration["ChunkSize"]);
            tempFolder = _configuration["TargetFolder"];
            _responseData = new Response();
        }

        public IActionResult Index()
        {
            return View();
        }

        public async Task<IActionResult> UploadChunks(string id, string fileName)
        {
            try
            {
                var chunkNumber = id;
                Log.Information("[CUSTOM] Uploading chunk: {Id} from file: {FileName} at {Now}", id, fileName, DateTime.Now);

                string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
                string fileExtension = Path.GetExtension(fileName);
                string tempFileName = "$" + chunkNumber + "$" + fileNameWithoutExtension + fileExtension;

                string targetFolder = tempFolder + "\\Temp";
                string newPath = Path.Combine(targetFolder, tempFileName);

                if (!Directory.Exists(targetFolder))
                {
                    Directory.CreateDirectory(targetFolder);
                }

                using (FileStream stream = System.IO.File.Create(newPath))
                {
                    byte[] bytes = new byte[chunkSize];
                    int bytesRead = 0;
                    while ((bytesRead = await Request.Body.ReadAsync(bytes, 0, bytes.Length)) > 0)
                    {
                        stream.Write(bytes, 0, bytesRead);
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "[CUSTOM] An error occurred at /File/UploadChunks at {Now}", DateTime.Now);
                _responseData.ErrorMessage = ex.Message;
                _responseData.IsSuccess = false;
            }

            return Ok(_responseData);
        }

        public IActionResult UploadComplete(string fileName, string fileTitle)
        {
            try
            {
                Log.Information("[CUSTOM] Upload of file {FileName} - {fileTitle} completed at {Now}", fileName, fileTitle, DateTime.UtcNow);
                string tempPath = tempFolder + "\\Temp";
                string newPath = Path.Combine(tempPath, fileName);

                string[] filePaths = Directory.GetFiles(tempPath)
                                              .Where(p => p.Contains(fileName))
                                              .OrderBy(p => Int32.Parse(p.Split("$")[1]))
                                              .ToArray();

                foreach (string filePath in filePaths)
                {
                    MergeChunks(newPath, filePath);
                }
                System.IO.File.Move(Path.Combine(tempPath, fileName), Path.Combine(tempFolder, fileTitle));
            }
            catch (Exception ex)
            {
                Log.Error(ex, "[CUSTOM] An error occurred at /File/UploadComplete while uploading file {FileName} at {Now}",
                    fileName, DateTime.Now);
                _responseData.ErrorMessage = ex.Message;
                _responseData.IsSuccess = false;
            }

            return Ok(_responseData);
        }

        private static void MergeChunks(string chunk1, string chunk2)
        {
            FileStream stream1 = null;
            FileStream stream2 = null;

            try
            {
                stream1 = System.IO.File.Open(chunk1, FileMode.Append);
                stream2 = System.IO.File.Open(chunk2, FileMode.Open);

                byte[] stream2Content = new byte[stream2.Length];
                stream2.Read(stream2Content, 0, (int)stream2.Length);
                stream1.Write(stream2Content, 0, (int)stream2.Length);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "[CUSTOM] An error occurred at /File/MergeChunks at {Now}", DateTime.Now);
            }
            finally
            {
                if (stream1 != null)
                    stream1.Close();
                if (stream2 != null)
                    stream2.Close();
                System.IO.File.Delete(chunk2);
            }
        }
    }
}
