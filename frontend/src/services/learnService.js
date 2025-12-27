import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const toUsefulError = (error) => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const message = data?.message || data?.error || error?.message || 'Request failed';
  const err = new Error(status ? `[${status}] ${message}` : message);
  err.status = status;
  err.data = data;
  return err;
};

export const getNextLearnItem = async ({
  langCode,
  mode,
  levelId,
  ballId,
  direction,
  difficulty,
  activityTypes,
  includeDetails
}) => {
  try {
    const params = {
      lang: langCode,
      mode,
      levelId,
      ballId,
      direction,
      difficulty,
      activityTypes,
      includeDetails: includeDetails ? 'true' : 'false'
    };

    const response = await axios.get(`${API_BASE_URL}/learn/next`, {
      headers: getAuthHeaders(),
      params
    });

    return response.data;
  } catch (error) {
    throw toUsefulError(error);
  }
};

export const getLearnProgress = async ({ langCode }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/learn/progress`, {
      headers: getAuthHeaders(),
      params: { lang: langCode },
    });

    return response.data;
  } catch (error) {
    throw toUsefulError(error);
  }
};

export const getLearnModes = async ({ langCode }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/learn/modes`, {
      headers: getAuthHeaders(),
      params: { lang: langCode },
    });

    return response.data;
  } catch (error) {
    throw toUsefulError(error);
  }
};

export const submitLearnAnswer = async ({
  langCode,
  wordId,
  activityType,
  difficulty,
  result,
  misspellOverride
}) => {
  try {
    const body = {
      lang: langCode,
      wordId,
      activityType,
      difficulty,
      result,
      misspellOverride: !!misspellOverride
    };

    const response = await axios.post(`${API_BASE_URL}/learn/answer`, body, {
      headers: getAuthHeaders()
    });

    return response.data;
  } catch (error) {
    throw toUsefulError(error);
  }
};
