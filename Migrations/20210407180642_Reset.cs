using Microsoft.EntityFrameworkCore.Migrations;

namespace ChatDemoSignalR.Migrations
{
    public partial class Reset : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friends_AspNetUsers_FriendId",
                table: "Friends");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Friends",
                table: "Friends");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Friends");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Friends");

            migrationBuilder.RenameColumn(
                name: "FriendId",
                table: "Friends",
                newName: "RelatedUserId1");

            migrationBuilder.RenameIndex(
                name: "IX_Friends_FriendId",
                table: "Friends",
                newName: "IX_Friends_RelatedUserId1");

            migrationBuilder.AddColumn<string>(
                name: "PrimaryUserId",
                table: "Friends",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RelatedUserId",
                table: "Friends",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Friends",
                table: "Friends",
                columns: new[] { "PrimaryUserId", "RelatedUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_Friends_RelatedUserId",
                table: "Friends",
                column: "RelatedUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Friends_AspNetUsers_RelatedUserId",
                table: "Friends",
                column: "RelatedUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Friends_AspNetUsers_RelatedUserId1",
                table: "Friends",
                column: "RelatedUserId1",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friends_AspNetUsers_RelatedUserId",
                table: "Friends");

            migrationBuilder.DropForeignKey(
                name: "FK_Friends_AspNetUsers_RelatedUserId1",
                table: "Friends");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Friends",
                table: "Friends");

            migrationBuilder.DropIndex(
                name: "IX_Friends_RelatedUserId",
                table: "Friends");

            migrationBuilder.DropColumn(
                name: "PrimaryUserId",
                table: "Friends");

            migrationBuilder.DropColumn(
                name: "RelatedUserId",
                table: "Friends");

            migrationBuilder.RenameColumn(
                name: "RelatedUserId1",
                table: "Friends",
                newName: "FriendId");

            migrationBuilder.RenameIndex(
                name: "IX_Friends_RelatedUserId1",
                table: "Friends",
                newName: "IX_Friends_FriendId");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Friends",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Friends",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Friends",
                table: "Friends",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Friends_AspNetUsers_FriendId",
                table: "Friends",
                column: "FriendId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
