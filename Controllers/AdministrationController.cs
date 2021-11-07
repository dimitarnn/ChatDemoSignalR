using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.ViewModels;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace ChatDemoSignalR.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdministrationController : Controller
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IValidator<CreateRoleVM> _roleValidator;
        private readonly IValidator<EditRoleVM> _editRoleValidator;
        private readonly IValidator<User> _userValidator;
        private readonly UserManager<User> _userManager;

        public AdministrationController(RoleManager<IdentityRole> roleManager,
                                        IValidator<CreateRoleVM> roleValidator,
                                        IValidator<User> userValidator,
                                        IValidator<EditRoleVM> editRoleValidator,
                                        UserManager<User> userManager)
        {
            _roleManager = roleManager;
            _roleValidator = roleValidator;
            _editRoleValidator = editRoleValidator;
            _userValidator = userValidator;
            _userManager = userManager;
        }

        [HttpGet]
        public IActionResult CreateRole()
        {
            CreateRoleVM model = new CreateRoleVM();
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody]CreateRoleVM model)
        {
            ValidationResult validationResult = _roleValidator.Validate(model);
            List<string> errors = new List<string>();

            if (!validationResult.IsValid)
            {
                foreach (var error in validationResult.Errors)
                {
                    errors.Add(error.ErrorMessage);
                }

                return BadRequest(errors);
            }

            Log.Information("[CUSTOM] Creating role with name '{RoleName}' at {Now}", model.RoleName, DateTime.UtcNow);
            
            IdentityRole role = new IdentityRole
            {
                Name = model.RoleName
            };

            var result = await _roleManager.CreateAsync(role);

            if (result.Succeeded)
            {
                Log.Information("[CUSTOM] Role with name '{RoleName}' successfully created.", model.RoleName);
                return Ok();
            }

            foreach (var error in result.Errors)
            {
                errors.Add(error.Description);
            }

            return BadRequest(errors);
        }

        [HttpGet]
        public IActionResult GetRoles()
        {
            return Ok(_roleManager.Roles);
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            return Ok(_userManager.Users);
        }

        [HttpGet]
        public IActionResult DisplayUsers()
        {
            return View();
        }

        [HttpGet]
        public IActionResult DisplayRoles()
        {
            return View();
        }

        [HttpGet]
        public IActionResult EditRole(string id)
        {
            RoleVM model = new RoleVM
            {
                RoleId = id
            };

            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> EditRole([FromBody]EditRoleVM model)
        {
            var role = await _roleManager.FindByIdAsync(model.Id);

            if (role == null)
            {
                return BadRequest("Invalid role!");
            }

            ValidationResult validationResult = _editRoleValidator.Validate(model);
            List<string> errors = new List<string>();

            if (!validationResult.IsValid)
            {
                foreach (var error in validationResult.Errors)
                {
                    errors.Add(error.ErrorMessage);
                }

                return BadRequest(errors);
            }

            Log.Information("[CUSTOM] Editting role '{RoleName}' at {Now}", role.Name, DateTime.UtcNow);

            role.Name = model.RoleName;
            var result = await _roleManager.UpdateAsync(role);
            
            if (result.Succeeded)
            {
                return Ok(role.Name);
            }

            foreach (var error in result.Errors)
            {
                errors.Add(error.Description);
            }

            return BadRequest(errors);
        }

        [HttpGet]
        public async Task<IActionResult> GetRole(string id)
        {
            var role = await _roleManager.FindByIdAsync(id);

            if (role == null)
            {
                return BadRequest("Invalid role id!");
            }

            var model = new EditRoleVM
            {
                Id = role.Id,
                RoleName = role.Name
            };

            foreach (var user in _userManager.Users)
            {
                if (await _userManager.IsInRoleAsync(user, role.Name))
                {
                    model.Users.Add(user.UserName);
                }
            }

            return Ok(model);
        }

        [HttpGet]
        public IActionResult EditUsersInRole(string roleId)
        {
            var model = new RoleVM
            {
                RoleId = roleId
            };

            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> GetUsersInRole(string roleId)
        {
            ViewBag.role = roleId;

            var role = await _roleManager.FindByIdAsync(roleId);

            if (role == null)
            {
                return BadRequest($"Role with Id = {roleId} cannot be found");
            }

            var model = new List<UserRoleVM>();

            foreach (var user in _userManager.Users)
            {
                var userRoleVM = new UserRoleVM
                {
                    UserId = user.Id,
                    UserName = user.UserName
                };

                if (await _userManager.IsInRoleAsync(user, role.Name))
                {
                    userRoleVM.IsSelected = true;
                }
                else
                {
                    userRoleVM.IsSelected = false;
                }

                model.Add(userRoleVM);
            }

            return Ok(model);
        }

        [HttpPost]
        public async Task<IActionResult> EditUsersInRole(string roleId, [FromBody]List<UserRoleVM> model)
         {
            var role = await _roleManager.FindByIdAsync(roleId);
            bool error = false;

            if (role == null)
            {
                return BadRequest($"Role with Id = {roleId} cannot be found");
            }

            Log.Information("[CUSTOM] Editting users in role '{RoleName}' at {Now}", role.Name, DateTime.UtcNow);

            for (int i = 0; i < model.Count; ++i)
            {
                User user = await _userManager.FindByIdAsync(model[i].UserId);
                IdentityResult result = null;

                if (model[i].IsSelected && !(await _userManager.IsInRoleAsync(user, role.Name)))
                {
                    result = await _userManager.AddToRoleAsync(user, role.Name);
                }
                else if (!model[i].IsSelected && await _userManager.IsInRoleAsync(user, role.Name))
                {
                    result = await _userManager.RemoveFromRoleAsync(user, role.Name);
                }
                else
                {
                    continue;
                }

                if (!result.Succeeded)
                {
                    error = true;
                }
            }

            if (error)
            {
                return BadRequest();
            }
            else
            {
                return Ok();
            }
        }

        [HttpGet]
        public async Task<IActionResult> EditUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return BadRequest("Invalid user id!");
                // add custom error view
            }

            UserVM model = new UserVM { Id = user.Id };
            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return BadRequest("Invalid user id!");
            }

            var userRoles = await _userManager.GetRolesAsync(user);

            EditUserVM model = new EditUserVM
            {
                Id = user.Id,
                Email = user.Email,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                RoomsLimit = user.RoomsLimit,
                FriendsLimit = user.FriendsLimit,
                Roles = userRoles,
            };

            return Ok(model);
        }

        [HttpPost]
        public async Task<IActionResult> EditUser([FromBody]EditUserVM model)
        {
            var user = await _userManager.FindByIdAsync(model.Id);

            if (user == null)
            {
                return BadRequest("Invalid user Id!");
            }

            Log.Information("[CUSTOM] Editting user '{UserName}' at {Now}", user.UserName, DateTime.UtcNow);

            user.UserName = model.UserName;
            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.RoomsLimit = model.RoomsLimit;
            user.FriendsLimit = model.FriendsLimit;

            var validationResult = _userValidator.Validate(user);
            List<string> errors = new List<string>();

            if (!validationResult.IsValid)
            {
                foreach (var error in validationResult.Errors)
                {
                    errors.Add(error.ErrorMessage);
                }

                return BadRequest(errors);
            }

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok();
            }

            foreach (var error in result.Errors)
            {
                errors.Add(error.Description);
            }

            return BadRequest(errors);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var loggedUser = await _userManager.GetUserAsync(User);
            string sender = loggedUser == null ? "Anonymous User" : loggedUser.UserName;
            var user = await _userManager.FindByIdAsync(id);

            Log.Information("[CUSTOM] User '{UserName}' attempts to delete user with Id: {Id} at {Now}",
                sender,
                id,
                DateTime.UtcNow);

            if (user == null)
            {
                return BadRequest("Invalid user Id!");
            }

            var result = await _userManager.DeleteAsync(user);

            if (result.Succeeded)
            {
                Log.Information("[CUSTOM] User '{UserName}' successfully deleted user: '{DeletedUser}' at {Now}",
                    loggedUser.UserName,
                    sender,
                    DateTime.UtcNow);

                return Ok();
            }

            List<string> errors = new List<string>();

            foreach (var error in result.Errors)
            {
                errors.Add(error.Description);
            }

            return BadRequest(errors);
        }

        //[Authorize]
        [HttpPost]
        public async Task<IActionResult> DeleteRole(string id)
        {
            var loggedUser = await _userManager.GetUserAsync(User);
            string sender = loggedUser == null ? "Anonymous User" : loggedUser.UserName;
            var role = await _roleManager.FindByIdAsync(id);

            Log.Information("[CUSTOM] User {UserName} attempts to delete role with Id: {Id} at {Now}",
                sender,
                id,
                DateTime.UtcNow);

            if (role == null)
            {
                return BadRequest("Invalid role Id!");
            }

            IdentityResult result;

            try
            {
                result = await _roleManager.DeleteAsync(role);
            }
            catch (DbUpdateException ex)
            {
                string message = $"Role '{role.Name}' is in use and cannot be deleted." +
                    "Please remove all users from the role before deleting";
                throw new AppException(message);
            }

            if (result.Succeeded)
            {
                Log.Information("[CUSTOM] User {UserName} successfully deleted role: {DeletedRole} at {Now}",
                    sender,
                    role.Name,
                    DateTime.UtcNow);

                return Ok();
            }

            List<string> errors = new List<string>();

            foreach (var error in result.Errors)
            {
                errors.Add(error.Description);
            }

            return BadRequest(errors);
        }

        [HttpGet]
        public async Task<IActionResult> EditUserRoles(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            // if user is null redirect to error view

            return View(user);
        }

        [HttpGet]
        public async Task<IActionResult> GetUserRoles(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return BadRequest("Invalid user id!");
            }
            
            List<UserRolesVM> model = new List<UserRolesVM>();

            foreach (var role in _roleManager.Roles)
            {
                UserRolesVM userRolesVM = new UserRolesVM
                {
                    RoleId = role.Id,
                    RoleName = role.Name,
                    IsSelected = (await _userManager.IsInRoleAsync(user, role.Name))
                };

                model.Add(userRolesVM);
            }

            return Ok(model);
        }

        [HttpPost]
        public async Task<IActionResult> EditUserRoles(string userId, [FromBody]List<UserRolesVM> model)
        {
            User user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return BadRequest("Invalid user id!");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var result = await _userManager.RemoveFromRolesAsync(user, roles);

            if (!result.Succeeded)
            {
                return BadRequest("Cannot remove user from existing roles!");
            }

            result = await _userManager.AddToRolesAsync(user, model.Where(x => x.IsSelected).Select(x => x.RoleName));

            if (!result.Succeeded)
            {
                return BadRequest("Cannot add user to selected roles!");
            }

            return Ok();
        }
    }
}
