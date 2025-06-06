import axios from 'axios';

const api = axios.create({
  baseURL: 'https://21391hr.shop/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
