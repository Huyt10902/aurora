import Topbar from "@/components/Topbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/useAuthStore";
import { Camera, KeyRound, Save, UserRound } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const ProfilePage = () => {
	const { user, isLoading, updatePassword, updateProfile } = useAuthStore();
	const [fullName, setFullName] = useState(user?.fullName || "");
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	useEffect(() => {
		setFullName(user?.fullName || "");
	}, [user?.fullName]);

	const avatarPreview = useMemo(() => {
		if (!avatarFile) return user?.imageUrl || "";
		return URL.createObjectURL(avatarFile);
	}, [avatarFile, user?.imageUrl]);

	useEffect(() => {
		return () => {
			if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
		};
	}, [avatarPreview]);

	const handleProfileSubmit = async (event: FormEvent) => {
		event.preventDefault();
		try {
			await updateProfile({ fullName: fullName.trim(), avatarFile });
			setAvatarFile(null);
			toast.success("Profile updated");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to update profile");
		}
	};

	const handlePasswordSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		try {
			await updatePassword({ currentPassword, newPassword });
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			toast.success("Password updated");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to update password");
		}
	};

	if (!user) return null;

	return (
		<main className='h-full rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6 space-y-6 max-w-4xl'>
					<div>
						<h1 className='text-2xl sm:text-3xl font-bold'>Profile</h1>
						<p className='text-sm text-zinc-400 mt-1'>@{user.username} - {user.email}</p>
					</div>

					<form
						onSubmit={handleProfileSubmit}
						className='rounded-md border border-zinc-800 bg-zinc-900/60 p-5 space-y-5'
					>
						<div className='flex items-center gap-3'>
							<UserRound className='size-5 text-emerald-400' />
							<h2 className='text-lg font-semibold'>Public Profile</h2>
						</div>

						<div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
							<Avatar className='size-24 border border-zinc-800'>
								<AvatarImage src={avatarPreview} />
								<AvatarFallback>{user.fullName[0]}</AvatarFallback>
							</Avatar>
							<div className='space-y-2'>
								<Button asChild type='button' variant='outline'>
									<label className='cursor-pointer'>
										<Camera className='size-4' />
										Change Avatar
										<input
											type='file'
											accept='image/*'
											className='hidden'
											onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
										/>
									</label>
								</Button>
								{avatarFile && <p className='text-xs text-zinc-400'>{avatarFile.name}</p>}
							</div>
						</div>

						<div className='space-y-2'>
							<label htmlFor='fullName' className='text-sm font-medium text-zinc-300'>
								Display name
							</label>
							<Input
								id='fullName'
								value={fullName}
								onChange={(event) => setFullName(event.target.value)}
								className='bg-zinc-800 border-zinc-700'
								placeholder='Your display name'
							/>
						</div>

						<Button type='submit' disabled={isLoading || !fullName.trim()}>
							<Save className='size-4' />
							Save Profile
						</Button>
					</form>

					<form
						onSubmit={handlePasswordSubmit}
						className='rounded-md border border-zinc-800 bg-zinc-900/60 p-5 space-y-5'
					>
						<div className='flex items-center gap-3'>
							<KeyRound className='size-5 text-sky-400' />
							<h2 className='text-lg font-semibold'>Password</h2>
						</div>

						<div className='grid gap-4 md:grid-cols-3'>
							<div className='space-y-2'>
								<label htmlFor='currentPassword' className='text-sm font-medium text-zinc-300'>
									Current password
								</label>
								<Input
									id='currentPassword'
									type='password'
									value={currentPassword}
									onChange={(event) => setCurrentPassword(event.target.value)}
									className='bg-zinc-800 border-zinc-700'
								/>
							</div>
							<div className='space-y-2'>
								<label htmlFor='newPassword' className='text-sm font-medium text-zinc-300'>
									New password
								</label>
								<Input
									id='newPassword'
									type='password'
									value={newPassword}
									onChange={(event) => setNewPassword(event.target.value)}
									className='bg-zinc-800 border-zinc-700'
								/>
							</div>
							<div className='space-y-2'>
								<label htmlFor='confirmPassword' className='text-sm font-medium text-zinc-300'>
									Confirm password
								</label>
								<Input
									id='confirmPassword'
									type='password'
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
									className='bg-zinc-800 border-zinc-700'
								/>
							</div>
						</div>

						<Button
							type='submit'
							disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
						>
							<KeyRound className='size-4' />
							Update Password
						</Button>
					</form>
				</div>
			</ScrollArea>
		</main>
	);
};

export default ProfilePage;
