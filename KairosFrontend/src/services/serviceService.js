import api from './api';

export const serviceService = {
    GetAll: async () => {
        const response = await api.get('/services');
        return response.data;
    },

    GetById: async (id) => {
        const response = await api.get(`/services/${id}`);
        return response.data;
    },

    Create: async (serviceData) => {
        const response = await api.post('/services', serviceData);
        return response.data;
    },
    
    Update: async (id, serviceData) => {
        const response = await api.put(`/services/${id}`, serviceData);
        return response.data;
    },

    Delete: async (id) => {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    }
}