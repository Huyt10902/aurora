import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Laugh } from "lucide-react";
import toast from "react-hot-toast";

const SettingsTabContent = () => {
	const { rickRollMode, toggleRickRollMode } = useSettingsStore();

	const handleToggle = () => {
		toggleRickRollMode();
		toast.success(
			!rickRollMode
				? "Rick Roll Mode activated! 🎵 Non-subscribers will get a surprise!"
				: "Rick Roll Mode deactivated"
		);
	};

	return (
		<div className="space-y-6">
			<Card className="border-zinc-800 bg-zinc-900/50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Laugh className="size-5 text-pink-400" />
						Easter Egg Settings
					</CardTitle>
					<CardDescription>Fun features and surprises for your users</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between p-4 bg-zinc-800/40 rounded-lg border border-zinc-700/50">
						<div className="space-y-1 flex-1">
							<div className="font-medium flex items-center gap-2">
								Rick Roll Mode 🎵
								<span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full">
									Easter Egg
								</span>
							</div>
							<p className="text-sm text-zinc-400">
								When enabled, non-subscribers clicking play will be greeted with Rick Astley's
								"Never Gonna Give You Up" before the subscription prompt 😄
							</p>
						</div>
						<div className="ml-4">
							<Switch
								checked={rickRollMode}
								onCheckedChange={handleToggle}
								className="data-[state=checked]:bg-pink-500"
							/>
						</div>
					</div>

					{rickRollMode && (
						<div className="bg-gradient-to-r from-pink-600/10 to-purple-600/10 border border-pink-500/20 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<Laugh className="size-5 text-pink-400 mt-0.5" />
								<div className="space-y-2">
									<p className="font-medium text-pink-400">Rick Roll Mode is Active!</p>
									<p className="text-sm text-zinc-300">
										Non-subscribers attempting to play music will see Rick Astley's iconic music
										video before being prompted to upgrade. This adds a fun, lighthearted touch
										while still encouraging subscriptions.
									</p>
									<p className="text-xs text-zinc-400 italic">
										💡 Tip: This is perfect for creating viral moments and social media buzz!
									</p>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="border-zinc-800 bg-zinc-900/50">
				<CardHeader>
					<CardTitle>About Easter Eggs</CardTitle>
					<CardDescription>Adding personality to your music platform</CardDescription>
				</CardHeader>
				<CardContent className="text-sm text-zinc-400 space-y-2">
					<p>
						Easter eggs are hidden features that add character and fun to your application. They
						create memorable experiences and can boost user engagement when used appropriately.
					</p>
					<p>
						The Rick Roll easter egg is a classic internet meme that most users will recognize and
						appreciate for its humor. It's non-intrusive and only appears to non-subscribers,
						maintaining the professional experience for paying users.
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default SettingsTabContent;
