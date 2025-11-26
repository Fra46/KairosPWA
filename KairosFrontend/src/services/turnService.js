import api from './api';

export const turnService = {
    GetAll: async () => {
        const response = await api.get('/turns');
        return response.data;
    },

    GetById: async (id) => {
        const response = await api.get(`/turns/${id}`);
        return response.data;
    },

    Create: async (turnData) => {
        const response = await api.post('/turns', turnData);
        return response.data;
    },

    Update: async (id, turnData) => {
        const response = await api.put(`/turns/${id}`, turnData);
        return response.data;
    },

    Delete: async (id) => {
        const response = await api.delete(`/turns/${id}`);
        return response.data;
    },

    // Cliente solicita turno público
    CreatePublic: async (data) => {
        const response = await api.post('/turns/public', data);
        return response.data;
    },

    // Cliente cancela turno público
    CancelPublic: async (data) => {
        const response = await api.post('/turns/public/cancel', data);
        return response.data;
    },

    // Resumen para las cards de servicios
    GetServiceSummary: async (serviceId) => {
        const response = await api.get(`/turns/service/${serviceId}/summary`);
        return response.data;
    },

    // EMPLEADO/ADMIN: avanzar turno por servicio
    AdvanceByService: async (serviceId, userId) => {
        const response = await api.post(`/turns/service/${serviceId}/advance`, {
            userId,
        });
        return response.data;
    },

    // Turnos pendientes para la Pantalla
    GetPending: async (serviceId) => {
        const response = await api.get('/turns/pending', {
            params: serviceId ? { serviceId } : {},
        });
        return response.data;
    },

    // Estado del turno de un cliente para un servicio
    GetPublicStatus: async (document, serviceId) => {
        const response = await api.get('/turns/public/status', {
            params: { document, serviceId },
        });
        return response.data;
    },

    // Últimos turnos llamados para la Pantalla
    GetRecentCalled: async (count = 20) => {
        const response = await api.get('/turns/display/recent', {
            params: { count },
        });
        return response.data;
    },

    CompleteCurrent: async (serviceId, userId) => {
        const response = await api.post(`/turns/service/${serviceId}/complete`, {
            userId,
        });
        return response.data;
    },

    // Obtener turno actual en atención para un servicio y cliente
    GetCurrent: async (serviceId, userId) => {
        const response = await api.get(`/turns/service/${serviceId}/current`, {
            params: { userId },
        });
        return response.data;
    }
}