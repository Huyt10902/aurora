import { axiosInstance } from "@/lib/axios";
import { User } from "@/types";
import { create } from "zustand";

interface LoginPayload {
  identifier: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

interface UpdateProfilePayload {
  fullName: string;
  avatarFile?: File | null;
}

interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkAdminStatus: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  updatePassword: (payload: UpdatePasswordPayload) => Promise<void>;
  reset: () => void;
}

const readStoredUser = () => {
  const value = localStorage.getItem("authUser");
  if (!value) return null;

  try {
    return JSON.parse(value) as User;
  } catch {
    localStorage.removeItem("authUser");
    return null;
  }
};

const persistSession = (user: User | null, accessToken: string | null) => {
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  else localStorage.removeItem("accessToken");

  if (user) localStorage.setItem("authUser", JSON.stringify(user));
  else localStorage.removeItem("authUser");
};

export const useAuthStore = create<AuthStore>((set, get) => {
  const storedUser = readStoredUser();
  const storedToken = localStorage.getItem("accessToken");

  return {
    user: storedUser,
    accessToken: storedToken,
    isAdmin: storedUser?.isAdmin ?? false,
    isLoading: false,
    error: null,

    login: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axiosInstance.post("/auth/login", payload);
        persistSession(response.data.user, response.data.accessToken);
        set({
          user: response.data.user,
          accessToken: response.data.accessToken,
          isAdmin: response.data.user.isAdmin,
        });
      } catch (error: any) {
        set({ error: error.response?.data?.message || "Login failed" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    register: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axiosInstance.post("/auth/register", payload);
        persistSession(response.data.user, response.data.accessToken);
        set({
          user: response.data.user,
          accessToken: response.data.accessToken,
          isAdmin: response.data.user.isAdmin,
        });
      } catch (error: any) {
        set({ error: error.response?.data?.message || "Registration failed" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    logout: async () => {
      set({ isLoading: true, error: null });
      try {
        await axiosInstance.post("/auth/logout");
        persistSession(null, null);
        set({
          user: null,
          accessToken: null,
          isAdmin: false,
          isLoading: false,
        });
      } catch (error: any) {
        // Even if logout fails on server, clear client state
        console.warn(
          "Logout API error:",
          error.response?.data?.message || error.message,
        );
        persistSession(null, null);
        set({
          user: null,
          accessToken: null,
          isAdmin: false,
          isLoading: false,
          error: "Logout error",
        });
      }
    },

    refreshSession: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await axiosInstance.post("/auth/refresh");
        persistSession(response.data.user, response.data.accessToken);
        set({
          user: response.data.user,
          accessToken: response.data.accessToken,
          isAdmin: response.data.user.isAdmin,
          isLoading: false,
        });
      } catch (error: any) {
        // Token refresh failed - clear session
        const errorMsg = error.response?.data?.message || "Session expired";
        persistSession(null, null);
        set({
          user: null,
          accessToken: null,
          isAdmin: false,
          error: null,
          isLoading: false,
        });
        console.warn("Session refresh failed:", errorMsg);
      }
    },

    checkAdminStatus: async () => {
      const user = get().user;
      set({ isAdmin: user?.isAdmin ?? false });
    },

    updateProfile: async ({ fullName, avatarFile }) => {
      set({ isLoading: true, error: null });
      try {
        const formData = new FormData();
        formData.append("fullName", fullName);
        if (avatarFile) formData.append("avatarFile", avatarFile);

        const response = await axiosInstance.put("/users/me/profile", formData);
        const accessToken = get().accessToken;
        persistSession(response.data, accessToken);
        set({
          user: response.data,
          isAdmin: response.data.isAdmin,
        });
      } catch (error: any) {
        set({ error: error.response?.data?.message || "Profile update failed" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    updatePassword: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        await axiosInstance.put("/users/me/password", payload);
      } catch (error: any) {
        set({ error: error.response?.data?.message || "Password update failed" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    reset: () => {
      persistSession(null, null);
      set({
        user: null,
        accessToken: null,
        isAdmin: false,
        isLoading: false,
        error: null,
      });
    },
  };
});
