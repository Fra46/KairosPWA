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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace KairosPWA.Tests.Services
{
    public class TurnServiceTests : IDisposable
    {
        private readonly ConnectionContext _context;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IHubContext<NotificationsHub>> _hubContextMock;
        private readonly Mock<IUserService> _userServiceMock;
        private readonly TurnService _turnService;

        public TurnServiceTests()
        {
            var options = new DbContextOptionsBuilder<ConnectionContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ConnectionContext(options);
            _mapperMock = new Mock<IMapper>();
            _mapperMock
                .Setup(m => m.Map<List<TurnDTO>>(It.IsAny<object>()))
                .Returns((object source) => ((IEnumerable<Turn>)source)
                    .Select(t => new TurnDTO { Number = t.Number, Priority = t.Priority, State = t.State, ClientId = t.ClientId, ServiceId = t.ServiceId })
                    .ToList());

            _userServiceMock = new Mock<IUserService>();

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

        public void Dispose() => _context.Dispose();

        private async Task<Service> AgregarServicioAsync(int id = 1)
        {
            var service = new Service
            {
                IdService = id,
                Name = "Consulta General",
                Description = "Servicio de prueba",
                State = "Activo"
            };
            _context.Services.Add(service);
            await _context.SaveChangesAsync();
            return service;
        }

        private async Task<Client> AgregarClienteAsync(string doc = "12345678")
        {
            var client = new Client
            {
                Id = doc,
                Name = "Juan P�rez",
                State = ClientState.Activo.ToString()
            };
            _context.Clients.Add(client);
            await _context.SaveChangesAsync();
            return client;
        }

        [Fact]
        public async Task CreatePublicTurnAsync_ServicioNoExiste_LanzaExcepcion()
        {
            var dto = new PublicTurnCreateDTO
            {
                ServiceId = 999,
                ClientDocument = "12345678",
                ClientName = "Juan"
            };

            var ex = await Assert.ThrowsAsync<Exception>(() => _turnService.CreatePublicTurnAsync(dto));
            Assert.Equal("Servicio no encontrado.", ex.Message);
        }

        [Fact]
        public async Task CreatePublicTurnAsync_ClienteNuevo_CreaClienteYTurno()
        {
            await AgregarServicioAsync(1);

            _mapperMock
                .Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>()))
                .Returns<Turn>(t => new TurnDTO { Number = t.Number, State = "Pendiente" });

            var dto = new PublicTurnCreateDTO
            {
                ServiceId = 1,
                ClientDocument = "99999999",
                ClientName = "Cliente Nuevo"
            };

            var result = await _turnService.CreatePublicTurnAsync(dto);
            var clienteEnBD = await _context.Clients.FirstOrDefaultAsync(c => c.Id == "99999999");

            Assert.NotNull(clienteEnBD);
            Assert.Equal(1, result.Number);
        }

        [Fact]
        public async Task CreatePublicTurnAsync_YaTienePendiente_LanzaExcepcion()
        {
            await AgregarServicioAsync(1);
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
                ClientName = "Juan P�rez"
            };

            var ex = await Assert.ThrowsAsync<Exception>(() => _turnService.CreatePublicTurnAsync(dto));
            Assert.Equal("Ya tienes un turno pendiente para este servicio.", ex.Message);
        }

        [Fact]
        public async Task CreatePublicTurnAsync_SegundoTurno_NumeroEsConsecutivo()
        {
            await AgregarServicioAsync(1);
            await AgregarClienteAsync("11111111");

            _context.Turns.Add(new Turn
            {
                Number = 5,
                State = TurnState.Atendido.ToString(),
                ClientId = 1,
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
                ClientDocument = "22222222",
                ClientName = "Pedro L�pez"
            };

            var result = await _turnService.CreatePublicTurnAsync(dto);
            Assert.Equal(6, result.Number);
        }

        [Fact]
        public async Task CreatePublicTurnAsync_PriorityAssigned_CreaTurnoConPrioridad()
        {
            await AgregarServicioAsync(1);

            _mapperMock
                .Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>()))
                .Returns<Turn>(t => new TurnDTO { Number = t.Number, Priority = t.Priority });

            var dto = new PublicTurnCreateDTO
            {
                ServiceId = 1,
                ClientDocument = "33333333",
                ClientName = "Ana G�mez",
                Priority = "Embarazada"
            };

            var result = await _turnService.CreatePublicTurnAsync(dto);

            Assert.Equal("Embarazada", result.Priority);

            var turnoEnBD = await _context.Turns.FirstOrDefaultAsync(t => t.Client.Id == "33333333" && t.ServiceId == 1);
            Assert.Equal("Embarazada", turnoEnBD!.Priority);
        }

        [Fact]
        public async Task GetAllPendingTurnsAsync_OrdenPorPrioridadYNumero()
        {
            await AgregarServicioAsync(1);
            var client = await AgregarClienteAsync("11111111");

            _context.Turns.AddRange(
                new Turn { Number = 1, Priority = "Normal", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 2, Priority = "Embarazada", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 3, Priority = "Discapacitado", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 4, Priority = "Mayor", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 5, Priority = "Embarazada", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now }
            );
            await _context.SaveChangesAsync();

            _mapperMock
                .Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>()))
                .Returns<Turn>(t => new TurnDTO { Number = t.Number, Priority = t.Priority });

            var result = await _turnService.GetAllPendingTurnsAsync();

            Assert.Equal(new[] { "Embarazada", "Embarazada", "Discapacitado", "Mayor", "Normal" }, result.Select(t => t.Priority));
            Assert.Equal(new[] { 2, 5, 3, 4, 1 }, result.Select(t => t.Number));
        }

        [Fact]
        public async Task GetPendingTurnsByServiceAsync_OrdenPorPrioridadYNumero()
        {
            await AgregarServicioAsync(1);
            var client = await AgregarClienteAsync("11111111");

            _context.Turns.AddRange(
                new Turn { Number = 1, Priority = "Normal", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 2, Priority = "Embarazada", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 3, Priority = "Discapacitado", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 4, Priority = "Mayor", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 5, Priority = "Embarazada", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now }
            );
            await _context.SaveChangesAsync();

            _mapperMock
                .Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>()))
                .Returns<Turn>(t => new TurnDTO { Number = t.Number, Priority = t.Priority });

            var result = await _turnService.GetPendingTurnsByServiceAsync(1);

            Assert.Equal(new[] { "Embarazada", "Embarazada", "Discapacitado", "Mayor", "Normal" }, result.Select(t => t.Priority));
            Assert.Equal(new[] { 2, 5, 3, 4, 1 }, result.Select(t => t.Number));
        }

        [Fact]
        public async Task GetCurrentPendingTurnByServiceAsync_SeleccionaTurnoConMayorPrioridad()
        {
            await AgregarServicioAsync(1);
            var client = await AgregarClienteAsync("55555555");

            _context.Turns.AddRange(
                new Turn { Number = 10, Priority = "Normal", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 11, Priority = "Mayor", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 12, Priority = "Embarazada", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now }
            );
            await _context.SaveChangesAsync();

            _mapperMock
                .Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>()))
                .Returns<Turn>(t => new TurnDTO { Number = t.Number, Priority = t.Priority });

            var result = await _turnService.GetCurrentPendingTurnByServiceAsync(1);

            Assert.NotNull(result);
            Assert.Equal("Embarazada", result!.Priority);
            Assert.Equal(12, result.Number);
        }

        [Fact]
        public async Task AdvanceTurnByServiceAsync_SeleccionaTurnoConMayorPrioridad()
        {
            await AgregarServicioAsync(1);
            var client = await AgregarClienteAsync("44444444");

            _context.Turns.AddRange(
                new Turn { Number = 10, Priority = "Normal", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 11, Priority = "Mayor", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now },
                new Turn { Number = 12, Priority = "Embarazada", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now }
            );
            await _context.SaveChangesAsync();

            _mapperMock
                .Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>()))
                .Returns<Turn>(t => new TurnDTO { Number = t.Number, Priority = t.Priority, State = t.State });

            var result = await _turnService.AdvanceTurnByServiceAsync(1, 1);

            Assert.NotNull(result);
            Assert.Equal("Embarazada", result!.Priority);
            Assert.Equal(TurnState.EnAtencion.ToString(), result.State);

            var turnInDb = await _context.Turns.FirstOrDefaultAsync(t => t.Number == 12 && t.ServiceId == 1);
            Assert.Equal(TurnState.EnAtencion.ToString(), turnInDb!.State);
        }

        [Fact]
        public async Task CancelPublicTurnAsync_ClienteNoExiste_RetornaFalse()
        {
            var dto = new PublicTurnCancelDTO { ClientDocument = "00000000", ServiceId = 1 };
            var result = await _turnService.CancelPublicTurnAsync(dto);
            Assert.False(result);
        }

        [Fact]
        public async Task CancelPublicTurnAsync_SinTurnoPendiente_RetornaFalse()
        {
            await AgregarClienteAsync("12345678");

            var dto = new PublicTurnCancelDTO { ClientDocument = "12345678", ServiceId = 1 };
            var result = await _turnService.CancelPublicTurnAsync(dto);
            Assert.False(result);
        }

        [Fact]
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
            Assert.True(result);
            Assert.Equal(TurnState.Cancelado.ToString(), enBD!.State);
        }

        [Fact]
        public async Task GetServiceQueueSummary_ColaVacia_RetornaCeros()
        {
            var result = await _turnService.GetServiceQueueSummaryAsync(1);
            Assert.Null(result.CurrentNumber);
            Assert.Equal(0, result.LastNumber);
            Assert.Equal(0, result.PendingCount);
        }

        [Fact]
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
            Assert.Equal(1, result.CurrentNumber);
            Assert.Equal(3, result.LastNumber);
            Assert.Equal(2, result.PendingCount);
        }

        [Fact]
        public async Task ChangeTurnState_TurnoNoExiste_RetornaFalse()
        {
            var result = await _turnService.ChangeTurnStateAsync(999, "Atendido");
            Assert.False(result);
        }

        [Fact]
        public async Task ChangeTurnState_EstadoInvalido_LanzaArgumentException()
        {
            var client = await AgregarClienteAsync();
            var turn = new Turn
            {
                Number = 1,
                State = TurnState.Pendiente.ToString(),
                ClientId = client.IdClient,
                ServiceId = 1,
                FechaHora = DateTime.Now
            };
            _context.Turns.Add(turn);
            await _context.SaveChangesAsync();

            await Assert.ThrowsAsync<ArgumentException>(() => _turnService.ChangeTurnStateAsync(turn.IdTurn, "EstadoFalso"));
        }

        [Fact]
        public async Task ChangeTurnState_EstadoValido_ActualizaCorrectamente()
        {
            var client = await AgregarClienteAsync();
            var turn = new Turn
            {
                Number = 1,
                State = TurnState.Pendiente.ToString(),
                ClientId = client.IdClient,
                ServiceId = 1,
                FechaHora = DateTime.Now
            };
            _context.Turns.Add(turn);
            await _context.SaveChangesAsync();

            var result = await _turnService.ChangeTurnStateAsync(turn.IdTurn, "Atendido");
            var enBD = await _context.Turns.FindAsync(turn.IdTurn);

            Assert.True(result);
            Assert.Equal(TurnState.Atendido.ToString(), enBD!.State);
        }

        [Fact]
        public async Task DeleteTurn_TurnoNoExiste_RetornaFalse()
        {
            var result = await _turnService.DeleteTurnAsync(999);
            Assert.False(result);
        }

        [Fact]
        public async Task DeleteTurn_TurnoExiste_EliminaYRetornaTrue()
        {
            var client = await AgregarClienteAsync();
            var turn = new Turn
            {
                Number = 1,
                State = TurnState.Pendiente.ToString(),
                ClientId = client.IdClient,
                ServiceId = 1,
                FechaHora = DateTime.Now
            };
            _context.Turns.Add(turn);
            await _context.SaveChangesAsync();

            var result = await _turnService.DeleteTurnAsync(turn.IdTurn);
            Assert.True(result);
            Assert.Null(await _context.Turns.FindAsync(turn.IdTurn));
        }

        [Fact]
        public async Task CreateTurnAsync_ClientOrServiceMissing_Throws()
        {
            var dto = new TurnCreateDTO { ClientId = 9999, ServiceId = 8888 };
            _mapperMock.Setup(m => m.Map<Turn>(It.IsAny<TurnCreateDTO>())).Returns(new Turn());
            await Assert.ThrowsAsync<Exception>(() => _turnService.CreateTurnAsync(dto));
        }

        [Fact]
        public async Task CreateTurnAsync_Success_ReturnsMapped()
        {
            var svc = await AgregarServicioAsync(1);
            var client = await AgregarClienteAsync("77777777");

            _mapperMock.Setup(m => m.Map<Turn>(It.IsAny<TurnCreateDTO>()))
                .Returns<TurnCreateDTO>(t => new Turn { ClientId = t.ClientId, ServiceId = t.ServiceId, Number = 5 });

            _mapperMock.Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>()))
                .Returns<Turn>(t => new TurnDTO { Number = t.Number, ClientId = t.ClientId, ServiceId = t.ServiceId });

            var dto = new TurnCreateDTO { ClientId = client.IdClient, ServiceId = svc.IdService };
            var result = await _turnService.CreateTurnAsync(dto);
            Assert.Equal(5, result.Number);
        }

        [Fact]
        public async Task GetPendingTurnsByServiceAndCurrentPending_Works()
        {
            var svc = await AgregarServicioAsync(1);
            var client = await AgregarClienteAsync("10101010");

            _context.Turns.AddRange(
                new Turn { Number = 1, Priority = "Normal", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = svc.IdService, FechaHora = DateTime.Now },
                new Turn { Number = 2, Priority = "Embarazada", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = svc.IdService, FechaHora = DateTime.Now }
            );
            await _context.SaveChangesAsync();

            _mapperMock.Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>())).Returns<Turn>(t => new TurnDTO { Number = t.Number, Priority = t.Priority });

            var list = await _turnService.GetPendingTurnsByServiceAsync(svc.IdService);
            Assert.Equal(2, list.Count);

            var current = await _turnService.GetCurrentPendingTurnByServiceAsync(svc.IdService);
            Assert.NotNull(current);
            Assert.Equal(2, current!.Number);
        }

        [Fact]
        public async Task GetPendingTurnForClientAsync_ClienteNoExiste_RetornaNull()
        {
            var result = await _turnService.GetPendingTurnForClientAsync("no-existe", 1);
            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateTurnAsync_InvalidState_Throws()
        {
            var client = await AgregarClienteAsync();
            var turn = new Turn { Number = 1, State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now };
            _context.Turns.Add(turn);
            await _context.SaveChangesAsync();

            var updated = new TurnCreateDTO { ClientId = client.IdClient, ServiceId = 1, State = "BadState" };
            await Assert.ThrowsAsync<ArgumentException>(() => _turnService.UpdateTurnAsync(turn.IdTurn, updated));
        }

        [Fact]
        public async Task UpdateTurnAsync_Valid_Updates()
        {
            var client = await AgregarClienteAsync();
            var turn = new Turn { Number = 1, State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now };
            _context.Turns.Add(turn);
            await _context.SaveChangesAsync();

            var updated = new TurnCreateDTO { ClientId = client.IdClient, ServiceId = 1, State = TurnState.Atendido.ToString() };
            var ok = await _turnService.UpdateTurnAsync(turn.IdTurn, updated);
            Assert.True(ok);
            var inDb = await _context.Turns.FindAsync(turn.IdTurn);
            Assert.Equal(TurnState.Atendido.ToString(), inDb!.State);
        }

        [Fact]
        public async Task CompleteCurrentTurnAsync_NoCurrent_ReturnsNull()
        {
            var res = await _turnService.CompleteCurrentTurnAsync(1, 1);
            Assert.Null(res);
        }

        [Fact]
        public async Task CompleteCurrentTurnAsync_Success_ChangesState()
        {
            var client = await AgregarClienteAsync("55555555");
            await AgregarServicioAsync(1);
            var t = new Turn { Number = 1, State = TurnState.EnAtencion.ToString(), ClientId = client.IdClient, ServiceId = 1, FechaHora = DateTime.Now };
            _context.Turns.Add(t);
            await _context.SaveChangesAsync();

            _mapperMock.Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>())).Returns<Turn>(x => new TurnDTO { Number = x.Number, State = x.State });

            var res = await _turnService.CompleteCurrentTurnAsync(1, 1);
            Assert.NotNull(res);
            Assert.Equal(TurnState.Atendido.ToString(), (await _context.Turns.FindAsync(t.IdTurn))!.State);
        }

        [Fact]
        public async Task GetPendingTurnForClientAsync_And_RecentCalled_GetCurrentByService()
        {
            var client = await AgregarClienteAsync("77777700");
            var svc = await AgregarServicioAsync(2);
            var t1 = new Turn { Number = 1, State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = svc.IdService, FechaHora = DateTime.Now };
            var t2 = new Turn { Number = 2, State = TurnState.EnAtencion.ToString(), ClientId = client.IdClient, ServiceId = svc.IdService, FechaHora = DateTime.Now };
            _context.Turns.AddRange(t1, t2);
            await _context.SaveChangesAsync();

            _mapperMock.Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>())).Returns<Turn>(x => new TurnDTO { Number = x.Number, State = x.State, ClientId = x.ClientId, ServiceId = x.ServiceId });
            _mapperMock.Setup(m => m.Map<List<TurnDTO>>(It.IsAny<object>())).Returns((object src) => ((IEnumerable<Turn>)src).Select(x => new TurnDTO { Number = x.Number }).ToList());

            var pending = await _turnService.GetPendingTurnForClientAsync(client.Id, svc.IdService);
            Assert.NotNull(pending);

            var recent = await _turnService.GetRecentCalledTurnsAsync(10);
            Assert.NotEmpty(recent);
            Assert.Contains(recent, r => r.Number == 2);

            var current = await _turnService.GetCurrentTurnByServiceAsync(svc.IdService);
            Assert.NotNull(current);
            Assert.Equal(TurnState.EnAtencion.ToString(), current!.State);
        }

        [Fact]
        public async Task GetAllTurnsAsync_ReturnsList()
        {
            var svc = await AgregarServicioAsync(10);
            var client = await AgregarClienteAsync("99900011");

            _context.Turns.AddRange(
                new Turn { Number = 1, State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = svc.IdService, FechaHora = DateTime.Now },
                new Turn { Number = 2, State = TurnState.Atendido.ToString(), ClientId = client.IdClient, ServiceId = svc.IdService, FechaHora = DateTime.Now }
            );
            await _context.SaveChangesAsync();

            var list = await _turnService.GetAllTurnsAsync();
            Assert.True(list.Count >= 2);
        }

        [Fact]
        public async Task CreatePublicTurnAsync_InvalidPriority_UsesNormal()
        {
            await AgregarServicioAsync(11);

            _mapperMock
                .Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>()))
                .Returns<Turn>(t => new TurnDTO { Number = t.Number, Priority = t.Priority });

            var dto = new PublicTurnCreateDTO
            {
                ServiceId = 11,
                ClientDocument = "44440000",
                ClientName = "No Pri",
                Priority = "NonExistingPriority"
            };

            var res = await _turnService.CreatePublicTurnAsync(dto);
            Assert.Equal("Normal", res.Priority);

            var enBD = await _context.Turns.FirstOrDefaultAsync(t => t.Client.Id == "44440000" && t.ServiceId == 11);
            Assert.Equal("Normal", enBD!.Priority);
        }

        [Fact]
        public async Task AdvanceTurnByServiceAsync_NoPending_ReturnsNull()
        {
            await AgregarServicioAsync(12);
            var res = await _turnService.AdvanceTurnByServiceAsync(12, 1);
            Assert.Null(res);
        }

        [Fact]
        public async Task GetCurrentByService_NoEntity_ReturnsNull()
        {
            var res = await _turnService.GetCurrentTurnByServiceAsync(9999);
            Assert.Null(res);
        }

        [Fact]
        public async Task CreatePublicTurnAsync_ExistingClient_NameUpdated()
        {
            await AgregarServicioAsync(21);
            var client = await AgregarClienteAsync("upd123");

            _mapperMock
                .Setup(m => m.Map<TurnDTO>(It.IsAny<Turn>()))
                .Returns<Turn>(t => new TurnDTO { Number = t.Number });

            var dto = new PublicTurnCreateDTO
            {
                ServiceId = 21,
                ClientDocument = "upd123",
                ClientName = "Nuevo Nombre"
            };

            var res = await _turnService.CreatePublicTurnAsync(dto);

            var clientDb = await _context.Clients.FirstOrDefaultAsync(c => c.Id == "upd123");
            Assert.NotNull(clientDb);
            Assert.Equal("Nuevo Nombre", clientDb!.Name);
        }

        [Fact]
        public async Task GetAllPendingTurnsAsync_WithUnknownPriority_HandlesDefaultOrder()
        {
            await AgregarServicioAsync(22);
            var client = await AgregarClienteAsync("p2");

            _context.Turns.AddRange(
                new Turn { Number = 1, Priority = "Normal", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 22, FechaHora = DateTime.Now },
                new Turn { Number = 2, Priority = "UnknownX", State = TurnState.Pendiente.ToString(), ClientId = client.IdClient, ServiceId = 22, FechaHora = DateTime.Now }
            );
            await _context.SaveChangesAsync();

            _mapperMock
                .Setup(m => m.Map<List<TurnDTO>>(It.IsAny<object>()))
                .Returns((object source) => ((IEnumerable<Turn>)source)
                    .Select(t => new TurnDTO { Number = t.Number, Priority = t.Priority }).ToList());

            var result = await _turnService.GetAllPendingTurnsAsync();
            Assert.Contains(result, r => r.Priority == "UnknownX");
            Assert.Equal(2, result.Count);
        }
    }
}
