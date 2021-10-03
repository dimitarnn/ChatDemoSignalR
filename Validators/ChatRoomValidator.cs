using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatDemoSignalR.Models;
using ChatDemoSignalR.Repository;
using FluentValidation;

namespace ChatDemoSignalR.Validators
{
    public class ChatRoomValidator : AbstractValidator<ChatRoom>
    {
        private readonly IChatRepository _chatRepository;
        public ChatRoomValidator(IChatRepository chatRepository)
        {
            _chatRepository = chatRepository;

            //RuleFor(room => room.RoomName).Must(name => name != "Force Error").WithMessage("Intentional error!");

            RuleFor(room => room.Description).Length(0, 100).WithMessage("Description cannot exceed 100 characters!");
            RuleFor(room => room.RoomName).NotEmpty();
            RuleFor(room => room.ChatType).NotNull();
            RuleFor(room => room.ChatType.ToString()).IsEnumName(typeof(ChatType));

            RuleSet("AlreadyCreated", () =>
            {
                RuleFor(room => room.RoomName).MustAsync(async (name, cancellation) =>
                {
                    bool isCreated = await _chatRepository.ContainsRoom(name);
                    return !isCreated;
                }).WithMessage("Room name is already taken!");
            });
        }
    }
}
