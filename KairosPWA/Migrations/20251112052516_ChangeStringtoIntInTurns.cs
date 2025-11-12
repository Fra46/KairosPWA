using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KairosPWA.Migrations
{
    /// <inheritdoc />
    public partial class ChangeStringtoIntInTurns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Turns_Clients_ClientIdClient",
                table: "Turns");

            migrationBuilder.DropForeignKey(
                name: "FK_Turns_Services_ServiceIdService",
                table: "Turns");

            migrationBuilder.DropIndex(
                name: "IX_Turns_ClientIdClient",
                table: "Turns");

            migrationBuilder.DropIndex(
                name: "IX_Turns_ServiceIdService",
                table: "Turns");

            migrationBuilder.DropColumn(
                name: "ClientIdClient",
                table: "Turns");

            migrationBuilder.DropColumn(
                name: "ServiceIdService",
                table: "Turns");

            migrationBuilder.AlterColumn<int>(
                name: "ServiceId",
                table: "Turns",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "ClientId",
                table: "Turns",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Turns_ClientId",
                table: "Turns",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Turns_ServiceId",
                table: "Turns",
                column: "ServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Turns_Clients_ClientId",
                table: "Turns",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "IdClient",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Turns_Services_ServiceId",
                table: "Turns",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "IdService",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Turns_Clients_ClientId",
                table: "Turns");

            migrationBuilder.DropForeignKey(
                name: "FK_Turns_Services_ServiceId",
                table: "Turns");

            migrationBuilder.DropIndex(
                name: "IX_Turns_ClientId",
                table: "Turns");

            migrationBuilder.DropIndex(
                name: "IX_Turns_ServiceId",
                table: "Turns");

            migrationBuilder.AlterColumn<string>(
                name: "ServiceId",
                table: "Turns",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "ClientId",
                table: "Turns",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "ClientIdClient",
                table: "Turns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ServiceIdService",
                table: "Turns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Turns_ClientIdClient",
                table: "Turns",
                column: "ClientIdClient");

            migrationBuilder.CreateIndex(
                name: "IX_Turns_ServiceIdService",
                table: "Turns",
                column: "ServiceIdService");

            migrationBuilder.AddForeignKey(
                name: "FK_Turns_Clients_ClientIdClient",
                table: "Turns",
                column: "ClientIdClient",
                principalTable: "Clients",
                principalColumn: "IdClient",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Turns_Services_ServiceIdService",
                table: "Turns",
                column: "ServiceIdService",
                principalTable: "Services",
                principalColumn: "IdService",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
