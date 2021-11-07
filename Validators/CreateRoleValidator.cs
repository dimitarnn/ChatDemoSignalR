using ChatDemoSignalR.ViewModels;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Validators
{
    public class CreateRoleValidator : AbstractValidator<CreateRoleVM>
    {
        public CreateRoleValidator()
        {
            RuleFor(role => role.RoleName).NotEmpty().Length(2, 150).WithName("Role Name");
        }
    }
}
