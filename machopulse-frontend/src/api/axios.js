import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("machopulse_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only eject user if 401 happens outside the login screen
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      localStorage.removeItem("machopulse_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
