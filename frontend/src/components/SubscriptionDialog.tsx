import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Music, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

interface SubscriptionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const SubscriptionDialog = ({ open, onOpenChange }: SubscriptionDialogProps) => {
	const navigate = useNavigate();
	const { user } = useAuthStore();

	const handleAction = () => {
		onOpenChange(false);
		if (!user) {
			navigate("/login");
		} else {
			navigate("/subscription");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
				<DialogHeader>
					<div className="flex justify-center mb-4">
						<div className="relative">
							<Crown className="w-16 h-16 text-yellow-400" />
							<Sparkles className="w-6 h-6 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
						</div>
					</div>
					<DialogTitle className="text-2xl text-center">
						{user ? "Upgrade to Premium" : "Sign In to Continue"}
					</DialogTitle>
					<DialogDescription className="text-center text-zinc-400 pt-2">
						{user
							? "Subscribe to a premium plan to unlock unlimited music streaming"
							: "You need to sign in and subscribe to play music"}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 pt-4">
					<div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
						<div className="flex items-center gap-3">
							<Music className="w-5 h-5 text-green-400" />
							<span className="text-sm text-zinc-300">Unlimited music streaming</span>
						</div>
						<div className="flex items-center gap-3">
							<Music className="w-5 h-5 text-green-400" />
							<span className="text-sm text-zinc-300">High quality audio</span>
						</div>
						<div className="flex items-center gap-3">
							<Music className="w-5 h-5 text-green-400" />
							<span className="text-sm text-zinc-300">Personalized recommendations</span>
						</div>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="flex-1 border-zinc-700 hover:bg-zinc-800"
						>
							Maybe Later
						</Button>
						<Button
							onClick={handleAction}
							className="flex-1 bg-green-500 hover:bg-green-400 text-black font-semibold"
						>
							{user ? "View Plans" : "Sign In"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
