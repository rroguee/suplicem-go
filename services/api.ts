import Constants from "expo-constants";
import axios from "axios";

export const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const hostUri = Constants.expoConfig?.hostUri || Constants.experienceUrl || "";
  const host = hostUri.split(":")[0];
  if (host && !host.includes("ngrok") && !host.includes("exp.direct")) {
    return `http://${host}:3000/api`;
  }
  return "http://localhost:3000/api";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

export default api;