import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import MediaImage from "@/components/MediaImage";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { Crown, LayoutDashboardIcon, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Topbar = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout, isLoading } = useAuthStore();
  const { isPremium } = useSubscriptionStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
      toast.success("Signed out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div
      className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 
      backdrop-blur-md z-10"
    >
      <Link to="/" className="flex gap-2 items-center">
        <img src="/logo.png" className="size-8" alt="Aurora logo" />
        Aurora
      </Link>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Link
            to="/admin"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <LayoutDashboardIcon className="size-4 mr-2" />
            Admin Dashboard
          </Link>
        )}

        {user ? (
          <>
            {isPremium && (
              <Link
                to="/subscription"
                className="hidden md:flex items-center gap-2 rounded-md bg-yellow-400/10 px-3 py-2 text-sm font-medium text-yellow-300 hover:bg-yellow-400/15"
              >
                <Crown className="size-4" />
                Premium
              </Link>
            )}
            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-2 rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <MediaImage
                src={user.imageUrl}
                alt={user.fullName}
                className="size-8 rounded-full bg-zinc-800"
              />
              <span>{user.fullName}</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="size-4 mr-2" />
              Sign out
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;
