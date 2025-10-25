import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' 
});

export const register = data => API.post('/auth/register', data);

export const login = data => API.post('/auth/login', data);

export const createQuiz = (data, token) => API.post('/quizzes', data, { 
  headers: { Authorization: `Bearer ${token}` } 
});

export const fetchQuiz = code => API.get(`/quizzes/${code}`);

export const saveResult = (code, data) => API.post(`/quizzes/${code}/result`, data);
