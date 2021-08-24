using Microsoft.EntityFrameworkCore.Migrations;

namespace ChatDemoSignalR.Migrations
{
    public partial class AddRoomsPerUserLimit : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FriendsLimit",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RoomsLimit",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FriendsLimit",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "RoomsLimit",
                table: "AspNetUsers");
        }
    }
}
