import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { Loader, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useNavigate } from "react-router-dom";

const LoginPage = () => {
	const navigate = useNavigate();
	const { user, login, isLoading } = useAuthStore();
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");

	if (user) return <Navigate to='/' replace />;

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		try {
			await login({ identifier, password });
			navigate("/");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Login failed");
		}
	};

	return (
		<main className='min-h-screen bg-black text-white flex items-center justify-center p-4'>
			<Card className='w-full max-w-md bg-zinc-900 border-zinc-800'>
				<CardHeader>
					<CardTitle className='text-2xl'>Sign in to Aurora</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<Input
							value={identifier}
							onChange={(event) => setIdentifier(event.target.value)}
							placeholder='Username or email'
							className='bg-zinc-800 border-zinc-700'
							required
						/>
						<Input
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							type='password'
							placeholder='Password'
							className='bg-zinc-800 border-zinc-700'
							required
						/>
						<Button type='submit' className='w-full bg-emerald-500 hover:bg-emerald-600 text-black' disabled={isLoading}>
							{isLoading ? <Loader className='size-4 animate-spin' /> : <LogIn className='size-4' />}
							Sign in
						</Button>
					</form>
					<p className='mt-4 text-sm text-zinc-400'>
						New here?{" "}
						<Link to='/register' className='text-emerald-400 hover:underline'>
							Create an account
						</Link>
					</p>
				</CardContent>
			</Card>
		</main>
	);
};

export default LoginPage;
