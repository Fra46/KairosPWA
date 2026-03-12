using AutoMapper;
using KairosPWA.Data;
using KairosPWA.DTOs;
using KairosPWA.Enums;
using KairosPWA.Hubs;
using KairosPWA.Models;
using KairosPWA.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;

namespace KairosWebAPI.Tests
{
    [TestFixture]
    public class TurnServiceTests
    {
        private ConnectionContext _context;
        private Mock<IMapper> _mapperMock;
        private Mock<IHubContext<NotificationsHub>> _hubContextMock;
        private Mock<IUserService> _userServiceMock;
        private TurnService _turnService;

        [SetUp]
        public void Setup()
        {
            // BD en memoria — cada test tiene su propia BD limpia
            var options = new DbContextOptionsBuilder<ConnectionContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new ConnectionContext(options);

            _mapperMock = new Mock<IMapper>();
            _userServiceMock = new Mock<IUserService>();

            // Mock de SignalR: simula el envío sin hacer nada real
            var clientProxyMock = new Mock<IClientProxy>();
            clientProxyMock
                .Setup(x => x.SendCoreAsync(
                    It.IsAny<string>(),
                    It.IsAny<object[]>(),
                    It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            var hubClientsMock = new Mock<IHubClients>();
            hubClientsMock.Setup(c => c.All).Returns(clientProxyMock.Object);

            _hubContextMock = new Mock<IHubContext<NotificationsHub>>();
            _hubContextMock.Setup(h => h.Clients).Returns(hubClientsMock.Object);

            _turnService = new TurnService(
                _context,
                _mapperMock.Object,
                _hubContextMock.Object,
                _userServiceMock.Object
            );
        }

        [TearDown]
        public void TearDown() => _context.Dispose();

        // ─── Helpers ───────────────────────────────────────────────

        private async Task<Service> AgregarServicioAsync(int id = 1)
        {
            var service = new Service { IdService = id, Name = "Consulta General" };
            _context.Services.Add(service);
            await _context.SaveChangesAsync();
            return service;
        }

        private async Task<Client> AgregarClienteAsync(string doc = "12345678")
        {
            var client = new Client
            {
                Id = doc,
                Name = "Juan Pérez",
                State = ClientState.Activo.ToString()
            };
            _context.Clients.Add(client);
            await _context.SaveChangesAsync();
            return client;
        }

        // ─── CreatePublicTurnAsync ──────────────────────────────────

        [Test]
        public async Task CreatePublicTurnAsync_ServicioNoExiste_LanzaExcepcion()
        {
            var dto = new PublicTurnCreateDTO
            {
                ServiceId = 999,
                ClientDocument = "12345678",
                ClientName = "Juan"
            };

            var ex = Assert.ThrowsAsync<Exception>(
                async () => await _turnService.CreatePublicTurnAsync(dto));

            Assert.That(ex!.Message, Is.EqualTo("Servicio no encontrado."));
        }

        [Test]
        public async Task CreatePublicTurnAsync_ClienteNuevo_CreaClienteYTurno()
        {
            await AgregarServicioAsync(1);
            _mapperMock
                .Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>()))
                .Returns(new TurnDTO { Number = 1, State = "Pendiente" });

            var dto = new PublicTurnCreateDTO
            {
                ServiceId = 1,
                ClientDocument = "99999999",
                ClientName = "Cliente Nuevo"
            };

            var result = await _turnService.CreatePublicTurnAsync(dto);

            var clienteEnBD = await _context.Clients.FirstOrDefaultAsync(c => c.Id == "99999999");
            Assert.That(clienteEnBD, Is.Not.Null, "Debería haber creado el cliente");
            Assert.That(result.Number, Is.EqualTo(1));
        }

        [Test]
        public async Task CreatePublicTurnAsync_YaTienePendiente_LanzaExcepcion()
        {
            var service = await AgregarServicioAsync(1);
            var client = await AgregarClienteAsync("12345678");

            _context.Turns.Add(new Turn
            {
                Number = 1,
                FechaHora = DateTime.Now,
                State = TurnState.Pendiente.ToString(),
                ClientId = client.IdClient,
                ServiceId = 1
            });
            await _context.SaveChangesAsync();

            var dto = new PublicTurnCreateDTO
            {
                ServiceId = 1,
                ClientDocument = "12345678",
                ClientName = "Juan Pérez"
            };

            var ex = Assert.ThrowsAsync<Exception>(
                async () => await _turnService.CreatePublicTurnAsync(dto));

            Assert.That(ex!.Message, Is.EqualTo("Ya tienes un turno pendiente para este servicio."));
        }

        [Test]
        public async Task CreatePublicTurnAsync_SegundoTurno_NumeroEsConsecutivo()
        {
            await AgregarServicioAsync(1);
            var client = await AgregarClienteAsync("11111111");

            _context.Turns.Add(new Turn
            {
                Number = 5,
                State = TurnState.Atendido.ToString(),
                ClientId = client.IdClient,
                ServiceId = 1,
                FechaHora = DateTime.Now
            });
            await _context.SaveChangesAsync();

            _mapperMock
                .Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>()))
                .Returns<Turn>(t => new TurnDTO { Number = t.Number });

            var dto = new PublicTurnCreateDTO
            {
                ServiceId = 1,
                ClientDocument = "22222222", // cliente diferente
                ClientName = "Pedro López"
            };

            var result = await _turnService.CreatePublicTurnAsync(dto);

            Assert.That(result.Number, Is.EqualTo(6)); // debe ser 5 + 1
        }

        // ─── CancelPublicTurnAsync ──────────────────────────────────

        [Test]
        public async Task CancelPublicTurnAsync_ClienteNoExiste_RetornaFalse()
        {
            var dto = new PublicTurnCancelDTO { ClientDocument = "00000000", ServiceId = 1 };

            var result = await _turnService.CancelPublicTurnAsync(dto);

            Assert.That(result, Is.False);
        }

        [Test]
        public async Task CancelPublicTurnAsync_SinTurnoPendiente_RetornaFalse()
        {
            await AgregarClienteAsync("12345678");

            var dto = new PublicTurnCancelDTO { ClientDocument = "12345678", ServiceId = 1 };

            var result = await _turnService.CancelPublicTurnAsync(dto);

            Assert.That(result, Is.False);
        }

        [Test]
        public async Task CancelPublicTurnAsync_TurnoPendiente_MarcaCanceladoYRetornaTrue()
        {
            var client = await AgregarClienteAsync("12345678");
            await AgregarServicioAsync(1);

            var turn = new Turn
            {
                Number = 1,
                FechaHora = DateTime.Now,
                State = TurnState.Pendiente.ToString(),
                ClientId = client.IdClient,
                ServiceId = 1
            };
            _context.Turns.Add(turn);
            await _context.SaveChangesAsync();

            var dto = new PublicTurnCancelDTO { ClientDocument = "12345678", ServiceId = 1 };

            var result = await _turnService.CancelPublicTurnAsync(dto);

            var enBD = await _context.Turns.FindAsync(turn.IdTurn);
            Assert.That(result, Is.True);
            Assert.That(enBD!.State, Is.EqualTo(TurnState.Cancelado.ToString()));
        }

        // ─── GetServiceQueueSummaryAsync ────────────────────────────

        [Test]
        public async Task GetServiceQueueSummary_ColaVacia_RetornaCeros()
        {
            var result = await _turnService.GetServiceQueueSummaryAsync(1);

            Assert.That(result.CurrentNumber, Is.Null);
            Assert.That(result.LastNumber, Is.EqualTo(0));
            Assert.That(result.PendingCount, Is.EqualTo(0));
        }

        [Test]
        public async Task GetServiceQueueSummary_ConTurnos_RetornaDatosCorrectos()
        {
            var client = await AgregarClienteAsync();
            await AgregarServicioAsync(1);

            _context.Turns.AddRange(
                new Turn { Number = 1, State = TurnState.Atendido.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 2, State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 3, State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now }
            );
            await _context.SaveChangesAsync();

            var result = await _turnService.GetServiceQueueSummaryAsync(1);

            Assert.That(result.CurrentNumber, Is.EqualTo(1)); // último atendido
            Assert.That(result.LastNumber, Is.EqualTo(3));
            Assert.That(result.PendingCount, Is.EqualTo(2));
        }

        // ─── ChangeTurnStateAsync ───────────────────────────────────

        [Test]
        public async Task ChangeTurnState_TurnoNoExiste_RetornaFalse()
        {
            var result = await _turnService.ChangeTurnStateAsync(999, "Atendido");
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task ChangeTurnState_EstadoInvalido_LanzaArgumentException()
        {
            var client = await AgregarClienteAsync();
            var turn = new Turn { Number = 1, State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now };
            _context.Turns.Add(turn);
            await _context.SaveChangesAsync();

            Assert.ThrowsAsync<ArgumentException>(
                async () => await _turnService.ChangeTurnStateAsync(turn.IdTurn, "EstadoFalso"));
        }

        [Test]
        public async Task ChangeTurnState_EstadoValido_ActualizaCorrectamente()
        {
            var client = await AgregarClienteAsync();
            var turn = new Turn { Number = 1, State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now };
            _context.Turns.Add(turn);
            await _context.SaveChangesAsync();

            var result = await _turnService.ChangeTurnStateAsync(turn.IdTurn, "Atendido");

            var enBD = await _context.Turns.FindAsync(turn.IdTurn);
            Assert.That(result, Is.True);
            Assert.That(enBD!.State, Is.EqualTo(TurnState.Atendido.ToString()));
        }

        // ─── DeleteTurnAsync ────────────────────────────────────────

        [Test]
        public async Task DeleteTurn_TurnoNoExiste_RetornaFalse()
        {
            var result = await _turnService.DeleteTurnAsync(999);
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task DeleteTurn_TurnoExiste_EliminaYRetornaTrue()
        {
            var client = await AgregarClienteAsync();
            var turn = new Turn { Number = 1, State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now };
            _context.Turns.Add(turn);
            await _context.SaveChangesAsync();

            var result = await _turnService.DeleteTurnAsync(turn.IdTurn);

            Assert.That(result, Is.True);
            Assert.That(await _context.Turns.FindAsync(turn.IdTurn), Is.Null);
        }
    }
}
