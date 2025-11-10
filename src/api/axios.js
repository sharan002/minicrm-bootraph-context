import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5030/api",
  withCredentials: true,
});

// Interceptor for expired access token
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post("http://localhost:5030/api/refresh", {}, { withCredentials: true });
        return api(originalRequest); // retry the original request
      } catch (refreshError) {
        window.location.href = "/"; // redirect to login
      }
    }

    return Promise.reject(err);
  }
);

export default api;
