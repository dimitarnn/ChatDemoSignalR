using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Sinks.MSSqlServer;

namespace ChatDemoSignalR
{
    public class Program
    {
        private const string _schemaName = "dbo";
        private const string _tableName = "LogEvents";
        
        public static void Main(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json")
                .Build();

            var options = new ColumnOptions();
            options.Store.Add(StandardColumn.LogEvent);

            var _connectionString = configuration.GetConnectionString("DefaultConnection");

            Log.Logger = new LoggerConfiguration()
                            .WriteTo.MSSqlServer(
                                connectionString: _connectionString,
                                sinkOptions: new MSSqlServerSinkOptions
                                {
                                    TableName = _tableName,
                                    SchemaName = _schemaName,
                                    AutoCreateSqlTable = true
                                },
                                columnOptions: options)
                            .CreateLogger();

            try
            {
                Log.Information("[CUSTOM] Application Started Up at {Now} Thread {Thread}",
                    DateTime.Now, Thread.CurrentThread.ManagedThreadId);
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "The application failed to start correctly!");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                //.UseSystemd()
                .UseSerilog()
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                        //.UseUrls("" + Environment.GetEnvironmentVariable("PORT"));
                });
    }
}
