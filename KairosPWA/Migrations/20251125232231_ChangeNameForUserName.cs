using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KairosPWA.Migrations
{
    /// <inheritdoc />
    public partial class ChangeNameForUserName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Users",
                newName: "UserName");

            migrationBuilder.CreateTable(
                name: "UserServiceTurnCounters",
                columns: table => new
                {
                    IdUserServiceTurnCounter = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    ContTurns = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserServiceTurnCounters", x => x.IdUserServiceTurnCounter);
                    table.ForeignKey(
                        name: "FK_UserServiceTurnCounters_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "IdService",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserServiceTurnCounters_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "IdUser",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserServiceTurnCounters_ServiceId",
                table: "UserServiceTurnCounters",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_UserServiceTurnCounters_UserId",
                table: "UserServiceTurnCounters",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserServiceTurnCounters");

            migrationBuilder.RenameColumn(
                name: "UserName",
                table: "Users",
                newName: "Name");
        }
    }
}
