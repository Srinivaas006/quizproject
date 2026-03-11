import axios from 'axios'

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
})

export const register = d => API.post('/auth/register', d)
export const login = d => API.post('/auth/login', d)

export const createQuiz = (d, token) => API.post('/quizzes', d, {
  headers: { Authorization: `Bearer ${token}` }
})

export const fetchQuiz = code => API.get(`/quizzes/${code}`)
export const saveResult = (code, d) => API.post(`/quizzes/${code}/result`, d)