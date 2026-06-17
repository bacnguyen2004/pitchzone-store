import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      !originalRequest ||
      originalRequest._retry ||
      status !== 401 ||
      originalRequest.url?.includes("/auth/login/") ||
      originalRequest.url?.includes("/auth/refresh/")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${api.defaults.baseURL}/auth/refresh/`, {
            refresh: refreshToken,
          })
          .then((response) => {
            localStorage.setItem("accessToken", response.data.access);
            return response.data.access;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const accessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return Promise.reject(refreshError);
    }
  },
);

export default api;