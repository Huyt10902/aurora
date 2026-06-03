import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User } from "@/types";

let refreshRequest: Promise<{ user: User; accessToken: string }> | null = null;

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api"
      : "/api",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.startsWith("/auth/");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;
      try {
        refreshRequest =
          refreshRequest ||
          axiosInstance
            .post("/auth/refresh")
            .then((response) => response.data)
            .finally(() => {
              refreshRequest = null;
            });

        const session = await refreshRequest;
        localStorage.setItem("accessToken", session.accessToken);
        localStorage.setItem("authUser", JSON.stringify(session.user));

        // Update Zustand store with new token
        useAuthStore.setState({
          user: session.user,
          accessToken: session.accessToken,
          isAdmin: session.user.isAdmin,
        });

        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - clear auth state
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authUser");
        const authStore = useAuthStore.getState();
        authStore.reset();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
