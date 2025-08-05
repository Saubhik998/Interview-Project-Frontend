import axios from 'axios';

const api = axios.create({
  baseURL: 'http://pip-interviewerapi.personalbrandingcouncil.com/api', 
});

export default api;
