import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, updates, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
