import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

let learningLangPromise = null;

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

export const getUserState = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/state/me`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user state:', error);
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

export const getLearningLang = async () => {
  const cachedName = localStorage.getItem('learningLanguageName');
  const cachedCode = localStorage.getItem('learningLangCode');

  if (cachedName && cachedCode) {
    return { languageName: cachedName, langCode: cachedCode };
  }

  if (!learningLangPromise) {
    learningLangPromise = axios
      .get(`${API_BASE_URL}/users/me/learning-language`, {
        headers: getAuthHeaders()
      })
      .then((response) => {
        const data = response.data?.data;
        const languageName = data?.languageName;
        const langCode = data?.langCode;

        if (languageName) localStorage.setItem('learningLanguageName', languageName);
        if (langCode) localStorage.setItem('learningLangCode', langCode);

        return { languageName, langCode };
      })
      .finally(() => {
        learningLangPromise = null;
      });
  }

  return learningLangPromise;
};
