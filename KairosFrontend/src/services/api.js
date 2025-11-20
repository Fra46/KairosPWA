import axios from 'axios';

const api = axios.create({
  baseURL: `http://${window.location.hostname}:7299/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la petición:', error);
    return Promise.reject(error);
  }
);

export default api;