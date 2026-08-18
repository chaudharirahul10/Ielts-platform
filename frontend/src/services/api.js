import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 40000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ielts_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ielts_token');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || { message: 'Something went wrong.' });
  }
);

export const authAPI = {
  register: (d) => API.post('/auth/register', d),
  login: (d) => API.post('/auth/login', d),
  googleLogin: (idToken) => API.post('/auth/google', { idToken }),
  refreshToken: (refreshToken) => API.post('/auth/refresh-token', { refreshToken }),
  changePassword: (d) => API.post('/auth/change-password', d),
  verifyOTP: (d) => API.post('/auth/verify-otp', d),
  resendOTP: (d) => API.post('/auth/resend-otp', d),
  getMe: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
  forgotPassword: (d) => API.post('/auth/forgot-password', d),
  resetPassword: (d) => API.post('/auth/reset-password', d),
};

export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (d) => API.put('/users/profile', d),
};

export const questionAPI = {
  getAll: (params) => API.get('/questions', { params }),
  getById: (id) => API.get(`/questions/${id}`),
};

export const writingAPI = {
  submit: (d) => API.post('/writing/submit', d),
  quickCheck: (d) => API.post('/writing/ai-check', d),
  getHistory: () => API.get('/writing/history'),
  getById: (id) => API.get(`/writing/${id}`),
};

export const speakingAPI = {
  submitAudio: (formData) => API.post('/speaking/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getQuestions: (part) => API.get('/speaking/questions', { params: { part } }),
  getHistory: () => API.get('/speaking/history'),
};

export const aiAPI = {
  chat: (messages, weakAreas) => API.post('/ai/chat', { messages, weakAreas }),
  explainAnswer: (d) => API.post('/ai/explain-answer', d),
  generateVocab: (d) => API.post('/ai/generate-vocab', d),
  generateStudyPlan: (d) => API.post('/ai/study-plan', d),
};

export const analyticsAPI = {
  getOverview: () => API.get('/analytics/overview'),
  getWeakAreas: () => API.get('/analytics/weak-areas'),
  getLeaderboard: (period) => API.get('/analytics/leaderboard', { params: { period } }),
};

export const studyPlanAPI = {
  getActive: () => API.get('/studyplan'),
  toggleTask: (dayIndex, taskId) => API.put(`/studyplan/day/${dayIndex}/task/${taskId}`),
};

export const vocabAPI = {
  getWords: (params) => API.get('/vocabulary', { params }),
  getQuiz: (count) => API.get('/vocabulary/quiz', { params: { count } }),
  markMastery: (d) => API.post('/vocabulary/mastery', d),
};

export default API;
