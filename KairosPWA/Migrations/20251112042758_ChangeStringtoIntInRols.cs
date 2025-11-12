using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KairosPWA.Migrations
{
    /// <inheritdoc />
    public partial class ChangeStringtoIntInRols : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Rols_RolIdRol",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_RolIdRol",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RolIdRol",
                table: "Users");

            migrationBuilder.AlterColumn<int>(
                name: "RolId",
                table: "Users",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RolId",
                table: "Users",
                column: "RolId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Rols_RolId",
                table: "Users",
                column: "RolId",
                principalTable: "Rols",
                principalColumn: "IdRol",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Rols_RolId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_RolId",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "RolId",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "RolIdRol",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Users_RolIdRol",
                table: "Users",
                column: "RolIdRol");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Rols_RolIdRol",
                table: "Users",
                column: "RolIdRol",
                principalTable: "Rols",
                principalColumn: "IdRol",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
