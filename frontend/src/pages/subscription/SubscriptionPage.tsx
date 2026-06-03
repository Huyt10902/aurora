import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { Check, Crown, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const SubscriptionPage = () => {
	const { user } = useAuthStore();
	const {
		cancelSubscription,
		currentPlan,
		fetchCurrentSubscription,
		fetchPlans,
		features,
		isLoading,
		isPremium,
		plans,
		subscribeToPlan,
		subscription,
	} = useSubscriptionStore();

	useEffect(() => {
		fetchPlans();
	}, [fetchPlans]);

	useEffect(() => {
		if (user) fetchCurrentSubscription();
	}, [fetchCurrentSubscription, user]);

	return (
		<main className='h-full overflow-hidden rounded-md bg-gradient-to-b from-zinc-800 to-zinc-950'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6 lg:p-8'>
					<section className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
						<div>
							<div className='mb-3 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-300'>
								<Crown className='size-4' />
								Aurora Premium
							</div>
							<h1 className='text-3xl font-bold text-white sm:text-4xl'>Choose your listening plan</h1>
							<p className='mt-3 max-w-2xl text-zinc-400'>
								Unlock richer listening, better discovery, and premium profile benefits.
							</p>
						</div>

						{user && (
							<div className='rounded-md border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-300'>
								<p className='text-xs uppercase text-zinc-500'>Current plan</p>
								<div className='mt-1 flex items-center gap-2 text-lg font-semibold text-white'>
									{isPremium && <Crown className='size-5 text-yellow-400' />}
									{currentPlan?.name || "Free"}
								</div>
								{subscription?.currentPeriodEnd && (
									<p className='mt-1 text-zinc-400'>
										{subscription.cancelAtPeriodEnd ? "Ends" : "Renews"} {formatDate(subscription.currentPeriodEnd)}
									</p>
								)}
								{isPremium && !subscription?.cancelAtPeriodEnd && (
									<Button
										variant='ghost'
										size='sm'
										className='mt-3 text-zinc-300 hover:bg-zinc-800 hover:text-white'
										onClick={cancelSubscription}
										disabled={isLoading}
									>
										Cancel renewal
									</Button>
								)}
							</div>
						)}
					</section>

					<section className='grid gap-4 lg:grid-cols-3'>
						{plans.map((plan) => {
							const isCurrent = currentPlan?.code === plan.code;
							const isPaid = plan.priceAmount > 0;
							return (
								<div
									key={plan._id}
									className={`flex min-h-[360px] flex-col rounded-md border p-5 ${
										isPaid
											? "border-green-500/40 bg-zinc-900 shadow-[0_0_30px_rgba(34,197,94,0.12)]"
											: "border-zinc-800 bg-zinc-900/70"
									}`}
								>
									<div className='flex items-start justify-between gap-3'>
										<div>
											<h2 className='text-xl font-semibold text-white'>{plan.name}</h2>
											<p className='mt-2 min-h-12 text-sm text-zinc-400'>{plan.description}</p>
										</div>
										{isPaid ? (
											<Crown className='size-6 shrink-0 text-yellow-400' />
										) : (
											<ShieldCheck className='size-6 shrink-0 text-zinc-500' />
										)}
									</div>

									<div className='mt-5'>
										<div className='text-3xl font-bold text-white'>{formatPrice(plan.priceAmount, plan.currency)}</div>
										<p className='mt-1 text-sm text-zinc-500'>
											{plan.billingInterval === "none" ? "No billing" : `per ${plan.billingInterval}`}
										</p>
									</div>

									<div className='mt-5 flex-1 space-y-3'>
										{plan.features.length ? (
											plan.features.map((feature) => (
												<div key={feature._id} className='flex gap-2 text-sm text-zinc-300'>
													<Check className='mt-0.5 size-4 shrink-0 text-green-400' />
													<div>
														<p className='font-medium text-zinc-100'>{feature.name}</p>
														<p className='text-zinc-500'>{feature.description}</p>
													</div>
												</div>
											))
										) : (
											<div className='flex gap-2 text-sm text-zinc-400'>
												<Check className='mt-0.5 size-4 shrink-0 text-zinc-500' />
												Standard listening access
											</div>
										)}
									</div>

									{user ? (
										<Button
											className={isPaid ? "mt-6 bg-green-500 text-black hover:bg-green-400" : "mt-6"}
											variant={isPaid ? "default" : "outline"}
											disabled={isLoading || isCurrent || plan.code === "free"}
											onClick={() => subscribeToPlan(plan.code)}
										>
											{isCurrent ? (
												<>
													<Check className='size-4' />
													Current plan
												</>
											) : (
												<>
													<CreditCard className='size-4' />
													{isPaid ? "Upgrade" : "Free plan"}
												</>
											)}
										</Button>
									) : (
										<Link
											to='/login'
											className={cn(
												buttonVariants({
													variant: isPaid ? "default" : "outline",
													className: isPaid
														? "mt-6 bg-green-500 text-black hover:bg-green-400"
														: "mt-6",
												}),
											)}
										>
											Sign in to continue
										</Link>
									)}
								</div>
							);
						})}
					</section>

					{isPremium && (
						<section className='mt-6 rounded-md border border-zinc-800 bg-zinc-900/70 p-5'>
							<div className='mb-4 flex items-center gap-2'>
								<Sparkles className='size-5 text-green-400' />
								<h2 className='text-lg font-semibold text-white'>Unlocked features</h2>
							</div>
							<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
								{features.map((feature) => (
									<div key={feature._id} className='rounded-md bg-zinc-950/60 p-3'>
										<p className='font-medium text-white'>{feature.name}</p>
										<p className='mt-1 text-sm text-zinc-500'>{feature.description}</p>
									</div>
								))}
							</div>
						</section>
					)}
				</div>
			</ScrollArea>
		</main>
	);
};

export default SubscriptionPage;
