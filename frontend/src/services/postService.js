import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Get all posts
export const getPosts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Create a new post
export const createPost = async (postData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/posts`, postData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Update a post
export const updatePost = async (postId, updates) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/posts/${postId}`, updates, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Get my daily post
export const getMyDailyPost = async (dateId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts/daily`, {
      params: { dateId },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching daily post:', error);
    throw error;
  }
};

// Get partner's daily post
export const getPartnerDailyPost = async (dateId, matchId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts/partner`, {
      params: { dateId, matchId },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching partner post:', error);
    throw error;
  }
};

// Play a post (get playback info)
export const playPost = async (postId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts/${postId}/play`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error playing post:', error);
    throw error;
  }
};
