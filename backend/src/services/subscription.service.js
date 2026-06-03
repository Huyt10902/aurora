import {
	serializeSubscriptionOrder,
	serializeSubscriptionPlan,
	serializeUserSubscription,
} from "../lib/serializers.js";

const PREMIUM_STATUSES = new Set(["trialing", "active"]);

const addBillingInterval = (date, interval) => {
	const nextDate = new Date(date);
	if (interval === "month") nextDate.setMonth(nextDate.getMonth() + 1);
	if (interval === "year") nextDate.setFullYear(nextDate.getFullYear() + 1);
	return nextDate;
};

export class SubscriptionService {
	constructor({ subscriptionRepository }) {
		this.subscriptionRepository = subscriptionRepository;
	}

	async getPlans() {
		const plans = await this.subscriptionRepository.findActivePlans();
		return plans.map(serializeSubscriptionPlan);
	}

	async getCurrent(userId) {
		await this.subscriptionRepository.expireElapsedSubscriptions(userId);

		const current = await this.subscriptionRepository.findCurrentSubscription(userId);
		const freePlan = current ? null : await this.subscriptionRepository.findPlanByCode("free");
		const plan = serializeSubscriptionPlan(current || freePlan);
		const subscription = serializeUserSubscription(current);
		const isPremium = Boolean(
			subscription &&
				plan?.code !== "free" &&
				PREMIUM_STATUSES.has(subscription.status) &&
				(!subscription.currentPeriodEnd || new Date(subscription.currentPeriodEnd) > new Date()),
		);

		return {
			plan,
			subscription,
			isPremium,
			features: plan?.features || [],
		};
	}

	async createCheckout({ userId, planCode }) {
		const plan = await this.subscriptionRepository.findPlanByCode(planCode);
		if (!plan) {
			const error = new Error("Subscription plan not found");
			error.status = 404;
			throw error;
		}

		if (plan.code === "free" || plan.price_amount <= 0) {
			const error = new Error("Free plan does not require checkout");
			error.status = 400;
			throw error;
		}

		const provider = await this.subscriptionRepository.findProviderByCode("mock");
		const order = await this.subscriptionRepository.createOrder({
			userId,
			planId: plan.id,
			providerId: provider?.id || null,
			amount: plan.price_amount,
			currency: plan.currency,
			checkoutUrl: "",
			externalOrderId: `mock_${Date.now()}`,
		});
		const checkoutUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/subscription?orderId=${order.id}`;
		const updatedOrder = await this.subscriptionRepository.updateOrderCheckoutUrl({
			orderId: order.id,
			checkoutUrl,
		});

		return {
			order: serializeSubscriptionOrder(updatedOrder),
			plan: serializeSubscriptionPlan(plan),
			provider: "mock",
		};
	}

	async confirmMockPayment({ userId, orderId }) {
		const order = await this.subscriptionRepository.findOrderForUser({ orderId, userId });
		if (!order) {
			const error = new Error("Subscription order not found");
			error.status = 404;
			throw error;
		}

		if (order.status === "paid") {
			return this.getCurrent(userId);
		}

		if (order.status !== "pending") {
			const error = new Error("Only pending subscription orders can be confirmed");
			error.status = 400;
			throw error;
		}

		const plan = await this.subscriptionRepository.findPlanById(order.plan_id);
		if (!plan) {
			const error = new Error("Subscription plan no longer exists");
			error.status = 404;
			throw error;
		}

		const now = new Date();
		const periodEnd = addBillingInterval(now, plan.billing_interval);

		await this.subscriptionRepository.expireCurrentPaidSubscriptions(userId);
		const subscription = await this.subscriptionRepository.createSubscription({
			userId,
			planId: plan.id,
			providerId: order.provider_id,
			periodStart: now,
			periodEnd,
		});
		await this.subscriptionRepository.markOrderPaid({
			orderId: order.id,
			userSubscriptionId: subscription.id,
		});

		return this.getCurrent(userId);
	}

	async cancel(userId) {
		await this.subscriptionRepository.expireElapsedSubscriptions(userId);
		const canceled = await this.subscriptionRepository.cancelCurrentSubscription(userId);
		if (!canceled) {
			const error = new Error("No active subscription to cancel");
			error.status = 404;
			throw error;
		}

		return this.getCurrent(userId);
	}
}
