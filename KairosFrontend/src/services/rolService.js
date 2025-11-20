import api from './api';

export const rolService = {
    GetAll: async () => {
        const response = await api.get('/roles');
        return response.data;
    },

    GetById: async (id) => {
        const response = await api.get(`/roles/${id}`);
        return response.data;
    },

    Create: async (rolData) => {
        const response = await api.post('/roles', rolData);
        return response.data;
    },

    Update: async (id, rolData) => {
        const response = await api.put(`/roles/${id}`, rolData);
        return response.data;
    },

    Delete: async (id) => {
        const response = await api.delete(`/roles/${id}`);
        return response.data;
    }
}