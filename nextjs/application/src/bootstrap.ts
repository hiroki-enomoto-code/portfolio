import axios from 'axios';

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  response => response,
  error => error.response || error
)