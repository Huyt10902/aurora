import { BaseRepository } from "./base.repository.js";

const planSelect = `
	SELECT plan.*,
	       COALESCE(
	       	JSON_AGG(
	       		JSON_BUILD_OBJECT(
	       			'id', feature.id,
	       			'code', feature.code,
	       			'name', feature.name,
	       			'description', feature.description,
	       			'created_at', feature.created_at,
	       			'updated_at', feature.updated_at
	       		)
	       		ORDER BY feature.name ASC
	       	) FILTER (WHERE feature.id IS NOT NULL),
	       	'[]'::json
	       ) AS features
	FROM subscription_plans plan
	LEFT JOIN plan_features plan_feature ON plan_feature.plan_id = plan.id
	LEFT JOIN subscription_features feature ON feature.id = plan_feature.feature_id
`;

const planGroup = "GROUP BY plan.id";

export class SubscriptionRepository extends BaseRepository {
	findActivePlans() {
		return this.many(
			`${planSelect}
			 WHERE plan.is_active = true
			 ${planGroup}
			 ORDER BY plan.sort_order ASC, plan.price_amount ASC`,
		);
	}

	findPlanByCode(code) {
		return this.one(
			`${planSelect}
			 WHERE plan.code = $1 AND plan.is_active = true
			 ${planGroup}`,
			[code],
		);
	}

	findPlanById(id) {
		return this.one(
			`${planSelect}
			 WHERE plan.id = $1
			 ${planGroup}`,
			[id],
		);
	}

	findProviderByCode(code) {
		return this.one(
			`SELECT *
			 FROM payment_providers
			 WHERE code = $1 AND is_active = true`,
			[code],
		);
	}

	expireElapsedSubscriptions(userId) {
		return this.query(
			`UPDATE user_subscriptions
			 SET status = 'expired', updated_at = NOW()
			 WHERE user_id = $1
			   AND status IN ('trialing', 'active', 'past_due')
			   AND current_period_end IS NOT NULL
			   AND current_period_end <= NOW()`,
			[userId],
		);
	}

	findCurrentSubscription(userId) {
		return this.one(
			`${planSelect.replace("SELECT plan.*,", "SELECT subscription.id AS subscription_id,\n\t       subscription.status AS subscription_status,\n\t       subscription.user_id,\n\t       subscription.started_at,\n\t       subscription.current_period_start,\n\t       subscription.current_period_end,\n\t       subscription.cancel_at_period_end,\n\t       subscription.canceled_at,\n\t       subscription.created_at AS subscription_created_at,\n\t       subscription.updated_at AS subscription_updated_at,\n\t       plan.*,")}
			 JOIN user_subscriptions subscription ON subscription.plan_id = plan.id
			 WHERE subscription.user_id = $1
			   AND subscription.status IN ('trialing', 'active', 'past_due')
			   AND (subscription.current_period_end IS NULL OR subscription.current_period_end > NOW())
			 ${planGroup}, subscription.id
			 ORDER BY subscription.current_period_end DESC NULLS LAST, subscription.created_at DESC
			 LIMIT 1`,
			[userId],
		);
	}

	findOrderForUser({ orderId, userId }) {
		return this.one(
			`SELECT *
			 FROM subscription_orders
			 WHERE id = $1 AND user_id = $2`,
			[orderId, userId],
		);
	}

	createOrder({ userId, planId, providerId, amount, currency, checkoutUrl, externalOrderId }) {
		return this.one(
			`INSERT INTO subscription_orders (
			 	user_id,
			 	plan_id,
			 	provider_id,
			 	amount,
			 	currency,
			 	checkout_url,
			 	external_order_id
			 )
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 RETURNING *`,
			[userId, planId, providerId, amount, currency, checkoutUrl, externalOrderId],
		);
	}

	updateOrderCheckoutUrl({ orderId, checkoutUrl }) {
		return this.one(
			`UPDATE subscription_orders
			 SET checkout_url = $2, updated_at = NOW()
			 WHERE id = $1
			 RETURNING *`,
			[orderId, checkoutUrl],
		);
	}

	markOrderPaid({ orderId, userSubscriptionId }) {
		return this.one(
			`UPDATE subscription_orders
			 SET status = 'paid',
			     user_subscription_id = $2,
			     paid_at = NOW(),
			     updated_at = NOW()
			 WHERE id = $1
			 RETURNING *`,
			[orderId, userSubscriptionId],
		);
	}

	expireCurrentPaidSubscriptions(userId) {
		return this.query(
			`UPDATE user_subscriptions
			 SET status = 'expired', updated_at = NOW()
			 WHERE user_id = $1
			   AND status IN ('trialing', 'active', 'past_due')`,
			[userId],
		);
	}

	createSubscription({ userId, planId, providerId, periodStart, periodEnd }) {
		return this.one(
			`INSERT INTO user_subscriptions (
			 	user_id,
			 	plan_id,
			 	provider_id,
			 	status,
			 	started_at,
			 	current_period_start,
			 	current_period_end
			 )
			 VALUES ($1, $2, $3, 'active', $4, $4, $5)
			 RETURNING *`,
			[userId, planId, providerId, periodStart, periodEnd],
		);
	}

	cancelCurrentSubscription(userId) {
		return this.one(
			`UPDATE user_subscriptions
			 SET cancel_at_period_end = true,
			     canceled_at = NOW(),
			     updated_at = NOW()
			 WHERE id = (
			 	SELECT id
			 	FROM user_subscriptions
			 	WHERE user_id = $1
			 	  AND status IN ('trialing', 'active', 'past_due')
			 	  AND (current_period_end IS NULL OR current_period_end > NOW())
			 	ORDER BY current_period_end DESC NULLS LAST, created_at DESC
			 	LIMIT 1
			 )
			 RETURNING *`,
			[userId],
		);
	}
}
