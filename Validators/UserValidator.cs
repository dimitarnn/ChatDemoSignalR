using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
using FluentValidation;

namespace ChatDemoSignalR.Validators
{
    public class UserValidator : AbstractValidator<User>
    {
        private readonly IUserRepository _userRepository;

        public UserValidator(IUserRepository userRepository)
        {
            _userRepository = userRepository;

            RuleFor(user => user.UserName).NotEmpty().Length(2, 150).WithName("Username");
            RuleFor(user => user.FirstName).NotEmpty().Length(2, 150).WithName("First Name");
            RuleFor(user => user.LastName).NotEmpty().Length(2, 150).WithName("Last name");
            RuleFor(user => user.Email).NotEmpty().EmailAddress();
            RuleFor(user => user.RoomsLimit).InclusiveBetween(1, 10000);
            RuleFor(user => user.FriendsLimit).InclusiveBetween(1, 10000);

            RuleSet("FriendsLimit", () =>
            {
                RuleFor(user => user.FriendsLimit).MustAsync(async (user, limit, cancellation) =>
                {
                    int userFriendsCount = await _userRepository.UserFriendsCount(user.Id);
                    return userFriendsCount < limit;
                }).WithMessage("User cannot add more more friends!");
            });

            RuleSet("RoomsLimit", () =>
            {
                RuleFor(user => user.RoomsLimit).MustAsync(async (user, limit, cancellattion) =>
                {
                    int userRoomsCount = await _userRepository.CreatedRoomsCount(user.Id);
                    return userRoomsCount < limit;
                }).WithMessage("User cannot create more rooms!");
            });
        }
    }
}
