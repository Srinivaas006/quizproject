import axios from 'axios';

const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000  // ← ADD THIS — fails after 15s instead of hanging forever
});

export const registerInit = data => API.post('/auth/register/init', data);
export const registerVerify = data => API.post('/auth/register/verify', data);
export const registerResend = data => API.post('/auth/register/resend', data);
export const login = data => API.post('/auth/login', data);
export const forgotPasswordSend = data => API.post('/auth/forgot-password', data);
export const forgotPasswordVerify = data => API.post('/auth/forgot-password/verify', data);

export const createQuiz = (data, token) => API.post('/quizzes', data, { 
  headers: { Authorization: `Bearer ${token}` } 
});
export const fetchQuiz = code => API.get(`/quizzes/${code}`);
export const saveResult = (code, data) => API.post(`/quizzes/${code}/result`, data);

export const register = registerInit;