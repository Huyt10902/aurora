import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
	rickRollMode: boolean;
	toggleRickRollMode: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
	persist(
		(set) => ({
			rickRollMode: false,
			toggleRickRollMode: () => set((state) => ({ rickRollMode: !state.rickRollMode })),
		}),
		{
			name: "aurora-admin-settings", // Lưu vào localStorage
		}
	)
);

