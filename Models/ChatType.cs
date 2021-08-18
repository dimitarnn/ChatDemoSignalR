namespace ChatDemoSignalR.Models
{
    public enum ChatType
    {
        Room, // multiple users can join, no need to send request
        Private, // friends chat between two users
        Ephemeral, // messages aren't saved
        InviteOnly // must be invited
    }
}
