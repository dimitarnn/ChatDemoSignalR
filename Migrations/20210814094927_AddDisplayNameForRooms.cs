using Microsoft.EntityFrameworkCore.Migrations;

namespace ChatDemoSignalR.Migrations
{
    public partial class AddDisplayNameForRooms : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "ChatRooms",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "ChatRooms");
        }
    }
}
