import api from './api';

export const rolService = {
    GetAll: async () => {
        const response = await api.get('/rols');
        return response.data;
    },

    GetById: async (id) => {
        const response = await api.get(`/rols/${id}`);
        return response.data;
    },

    Create: async (rolData) => {
        const response = await api.post('/rols', rolData);
        return response.data;
    },

    Update: async (id, rolData) => {
        const response = await api.put(`/rols/${id}`, rolData);
        return response.data;
    },

    Delete: async (id) => {
        const response = await api.delete(`/rols/${id}`);
        return response.data;
    }
}