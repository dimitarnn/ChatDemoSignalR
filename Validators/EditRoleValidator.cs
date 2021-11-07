using ChatDemoSignalR.ViewModels;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Validators
{
    public class EditRoleValidator : AbstractValidator<EditRoleVM>
    {
        public EditRoleValidator()
        {
            RuleFor(x => x.RoleName).NotEmpty().Length(2, 150).WithName("Role Name");
        }
    }
}
