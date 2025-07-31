import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.6.154:5035/api', 
});

export default api;
