using Microsoft.EntityFrameworkCore.Migrations;

namespace ChatDemoSignalR.Migrations
{
    public partial class ChangeModels : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Friends");

            migrationBuilder.CreateTable(
                name: "UserFriends",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FriendId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFriends", x => new { x.UserId, x.FriendId });
                    table.ForeignKey(
                        name: "FK_UserFriends_AspNetUsers_FriendId",
                        column: x => x.FriendId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserFriends_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserFriends_FriendId",
                table: "UserFriends",
                column: "FriendId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserFriends");

            migrationBuilder.CreateTable(
                name: "Friends",
                columns: table => new
                {
                    PrimaryUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RelatedUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RelatedUserId1 = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Friends", x => new { x.PrimaryUserId, x.RelatedUserId });
                    table.ForeignKey(
                        name: "FK_Friends_AspNetUsers_RelatedUserId",
                        column: x => x.RelatedUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Friends_AspNetUsers_RelatedUserId1",
                        column: x => x.RelatedUserId1,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Friends_RelatedUserId",
                table: "Friends",
                column: "RelatedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Friends_RelatedUserId1",
                table: "Friends",
                column: "RelatedUserId1");
        }
    }
}
