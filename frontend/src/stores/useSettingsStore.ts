import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

interface SettingsStore {
	rickRollMode: boolean;
	isLoading: boolean;
	fetchSettings: () => Promise<void>;
	updateRickRollMode: (value: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
	rickRollMode: false,
	isLoading: false,

	fetchSettings: async () => {
		set({ isLoading: true });
		try {
			// Public endpoint to get rick roll mode status
			const response = await axiosInstance.get("/admin/settings");
			set({ rickRollMode: response.data.rick_roll_mode || false });
		} catch (error) {
			// If error (not admin), default to false
			set({ rickRollMode: false });
		} finally {
			set({ isLoading: false });
		}
	},

	updateRickRollMode: async (value: boolean) => {
		set({ isLoading: true });
		try {
			await axiosInstance.put("/admin/settings", {
				rick_roll_mode: value,
			});
			set({ rickRollMode: value });
		} catch (error) {
			console.error("Failed to update rick roll mode:", error);
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},
}));

