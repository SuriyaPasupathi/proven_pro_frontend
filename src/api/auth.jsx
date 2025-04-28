// src/api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Existing endpoints
export const register = (data) => axios.post(`${API_URL}/register/`, data);
export const login = (data) => axios.post(`${API_URL}/login/`, data);
export const forgotPassword = (data) => axios.post(`${API_URL}/forgot-password/`, data);
export const resetPassword = (data) => axios.post(`${API_URL}/reset-password/`, data);
export const getProfile = (token) =>
  axios.get(`${API_URL}/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// New profile sharing endpoints
export const shareProfile = (email, token) => 
  axios.post(
    `${API_URL}/share-profile/`,
    { email },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

export const verifyShare = (token) => 
  axios.get(`${API_URL}/verify-share/${token}/`);

export const submitReview = (token, reviewData) => 
  axios.post(`${API_URL}/submit-review/${token}/`, reviewData);
// src/api/auth.js
