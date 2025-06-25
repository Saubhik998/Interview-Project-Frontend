import axios from 'axios';

const API = axios.create({
  baseURL: 'https://localhost:7080/api/Interview',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
