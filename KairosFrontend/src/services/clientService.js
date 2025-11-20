import api from './api';

export const clientService = {
    GetAll: async () => {
        const response = await api.get('/clients');
        return response.data;
    },

    GetById: async (id) => {
        const response = await api.get(`/clients/${id}`);
        return response.data;
    },

    Create: async (clientData) => {
        const response = await api.post('/clients', clientData);
        return response.data;
    },

    Update: async (id, clientData) => {
        const response = await api.put(`/clients/${id}`, clientData);
        return response.data;
    },

    Delete: async (id) => {
        const response = await api.delete(`/clients/${id}`);
        return response.data;
    }
}