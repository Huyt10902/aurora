import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { Loader, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { user, register, isLoading } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await register({ fullName, username, email, password });
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl">Create your Aurora account</CardTitle>
          <p className="text-sm text-zinc-400">
            Enter your details to start listening and sharing music.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300" htmlFor="fullName">
                Full name
              </label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Full name"
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-300" htmlFor="username">
                Username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
                className="bg-zinc-800 border-zinc-700"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-300" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="Email"
                className="bg-zinc-800 border-zinc-700"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-300" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Password"
                className="bg-zinc-800 border-zinc-700"
                minLength={8}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Create account
            </Button>
          </form>
          <p className="mt-5 text-sm text-zinc-400">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
};

export default RegisterPage;
