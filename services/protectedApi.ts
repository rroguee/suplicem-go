import { getValidToken } from "@/utils/refreshToken";
import axios from "axios";
import { getBaseUrl } from "./api";

const protectedApi = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

// Interceptor
protectedApi.interceptors.request.use(async (config) => {
  const token = await getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default protectedApi;
