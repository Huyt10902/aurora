import { axiosInstance } from "@/lib/axios";
import {
	SubscriptionFeature,
	SubscriptionOrder,
	SubscriptionPlan,
	SubscriptionStatus,
	UserSubscription,
} from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface SubscriptionStore {
	plans: SubscriptionPlan[];
	currentPlan: SubscriptionPlan | null;
	subscription: UserSubscription | null;
	features: SubscriptionFeature[];
	isPremium: boolean;
	pendingOrder: SubscriptionOrder | null;
	isLoading: boolean;
	error: string | null;

	fetchPlans: () => Promise<void>;
	fetchCurrentSubscription: () => Promise<void>;
	subscribeToPlan: (planCode: string) => Promise<void>;
	cancelSubscription: () => Promise<void>;
	reset: () => void;
}

const applyStatus = (status: SubscriptionStatus) => ({
	currentPlan: status.plan,
	subscription: status.subscription,
	features: status.features,
	isPremium: status.isPremium,
});

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
	plans: [],
	currentPlan: null,
	subscription: null,
	features: [],
	isPremium: false,
	pendingOrder: null,
	isLoading: false,
	error: null,

	fetchPlans: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/subscriptions/plans");
			set({ plans: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchCurrentSubscription: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/subscriptions/me");
			set(applyStatus(response.data));
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	subscribeToPlan: async (planCode) => {
		set({ isLoading: true, error: null });
		try {
			const checkout = await axiosInstance.post("/subscriptions/checkout", { planCode });
			const order = checkout.data.order as SubscriptionOrder;
			set({ pendingOrder: order });

			const confirmed = await axiosInstance.post(`/subscriptions/orders/${order._id}/mock-confirm`);
			set({
				...applyStatus(confirmed.data),
				pendingOrder: null,
			});
			toast.success("Premium activated");
		} catch (error: any) {
			const message = error.response?.data?.message || "Failed to update subscription";
			set({ error: message });
			toast.error(message);
		} finally {
			set({ isLoading: false });
		}
	},

	cancelSubscription: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post("/subscriptions/cancel");
			set(applyStatus(response.data));
			toast.success("Subscription will end after the current period");
		} catch (error: any) {
			const message = error.response?.data?.message || "Failed to cancel subscription";
			set({ error: message });
			toast.error(message);
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () =>
		set({
			currentPlan: null,
			subscription: null,
			features: [],
			isPremium: false,
			pendingOrder: null,
			error: null,
		}),
}));
