import axios from 'axios';

const API = axios.create({
  baseURL: 'http://172.20.10.2:5000/api',
});

export default API;
