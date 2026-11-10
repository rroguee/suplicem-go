import axios from "axios";

// Backend de desarrollo local (fallback si no hay variable de entorno)
const LOCAL_API_URL = "http://10.0.0.190:3000/api";

export const getBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL || LOCAL_API_URL;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 45000,
});

export default api;