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
    }
}