import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const fetchAllPosts = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/posts`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const deletePostAsModerator = async (postId) => {
  const response = await axios.delete(`${API_BASE_URL}/admin/posts/${postId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const fetchAllUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/users`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const deleteUserAsModerator = async (userId) => {
  const response = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};
