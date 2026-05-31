using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KairosPWA.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentTypeToClients : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DocumentType",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentType",
                table: "Clients");
        }
    }
}
