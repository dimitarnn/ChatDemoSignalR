using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Data;
using ChatDemoSignalR.Exceptions;
using ChatDemoSignalR.Hubs;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
using ChatDemoSignalR.Services;
using ChatDemoSignalR.Settings;
using ChatDemoSignalR.Validators;
using ChatDemoSignalR.ViewModels;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ChatDemoSignalR
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews();

            services.AddMvc()
                    .AddFluentValidation();

            services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = true;
            });


            services.Configure<MailSettings>(Configuration.GetSection("MailSettings"));

            services.AddDbContext<AppDbContext>(options => 
                options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<AppDbContext>();

            services.AddIdentity<User, IdentityRole>(config =>
            {
                config.SignIn.RequireConfirmedEmail = true;
            })
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders();

            services.AddScoped<IChatRepository, ChatRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IMessageRepository, MessageRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IFriendRequestRepository, FriendRequestRepository>();
            services.AddScoped<ILogEventRepository, LogEventRepository>();
            services.AddScoped<IImageRepository, ImageRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddTransient<IMailService, MailService>();
            services.AddTransient<IValidator<User>, UserValidator>();
            services.AddTransient<IValidator<ChatRoom>, ChatRoomValidator>();
            services.AddTransient<IValidator<CreateRoleVM>, CreateRoleValidator>();
            services.AddTransient<IValidator<EditRoleVM>, EditRoleValidator>();
            services.AddTransient<IImageService, ImageService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            //app.UseForwardedHeaders(new ForwardedHeadersOptions
            //{
            //    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            //});

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            //else
            //{
            //    app.UseExceptionHandler("/Home/Error");
            //    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            //    app.UseHsts();
            //}

            //app.UseDeveloperExceptionPage();

            app.UseMiddleware<ErrorHandlerMiddleware>();

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
                endpoints.MapHub<MessageHub>("/messages");
                //endpoints.MapHub<TestHub>("/testhub");
            });
        }
    }
}
