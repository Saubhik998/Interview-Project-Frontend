import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7080/api', // Make sure 7080 matches your .NET backend port
});

export default api;