// utils/instance.js
import axios from "axios";
import Router from "next/router";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
});

// REQUEST INTERCEPTOR
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

// RESPONSE INTERCEPTOR
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika token expired dan belum pernah dicoba ulang
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await instance.post(
          `/api/v1/refresh-token/${refreshToken}`
        );

        const newAccessToken = res.data.data.accessToken;
        localStorage.setItem("token", newAccessToken);

        // Set ulang header Authorization dan ulangi request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (err) {
        // Refresh token invalid/expired
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
