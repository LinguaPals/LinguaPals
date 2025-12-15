import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

export const postMessage = async (text) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/messages/send`, {
            text,
        }, {
            headers: getAuthHeaders()
        });

        return response.data;
    } catch (error) {
        console.error('Error posting message:', error);
        throw error;
    }
}
