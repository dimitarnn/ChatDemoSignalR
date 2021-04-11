using Microsoft.EntityFrameworkCore.Migrations;

namespace ChatDemoSignalR.Migrations
{
    public partial class AddChatTypes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ChatType",
                table: "ChatRooms",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChatType",
                table: "ChatRooms");
        }
    }
}
