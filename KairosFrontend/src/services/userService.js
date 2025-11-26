import api from './api';

export const userService = {
    Login: async (credentials) => {
        const response = await api.post('/users/login', {
            userName: credentials.userName,
            password: credentials.password,
        });
        return response.data;
    },

    GetAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    GetById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    Create: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    Update: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    Delete: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    GetTurnStats: async () => {
        const response = await api.get('/users/turns-by-service');
        return response.data;
    }
}