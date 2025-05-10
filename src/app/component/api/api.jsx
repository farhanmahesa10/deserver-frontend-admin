import axios from "axios";
import { jwtDecode } from "jwt-decode";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
});

instance.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      const isExpired = decoded.exp && decoded.exp < now;

      // ✅ Token expired → refresh token (jika belum dicoba)
      if (isUnauthorized && isExpired && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          const res = await instance.post(
            `/api/v1/refresh-token/${refreshToken}`
          );
          const newAccessToken = res.data.data.accessToken;

          localStorage.setItem("token", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Refresh token gagal
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      // ❌ Jika tidak expired tapi 401 (berarti token tidak cocok di backend)
      if (isUnauthorized && !isExpired) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    } catch (decodeError) {
      // ❌ Token asal-asalan (tidak bisa didecode)
      if (isUnauthorized) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
