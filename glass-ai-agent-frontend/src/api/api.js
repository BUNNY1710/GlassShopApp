
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

// 🔐 ADD JWT TOKEN TO EVERY REQUEST
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔄 HANDLE 401 UNAUTHORIZED - REDIRECT TO LOGIN
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and role
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      
      // Redirect to login (only if not already on login page)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;