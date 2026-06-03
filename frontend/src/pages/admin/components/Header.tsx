import MediaImage from "@/components/MediaImage";
import { useAuthStore } from "@/stores/useAuthStore";
import { Link } from "react-router-dom";

const Header = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="rounded-lg">
          <img
            src="/logo.png"
            className="size-10 text-black"
            alt="Aurora logo"
          />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Music Manager</h1>
          <p className="text-zinc-400 mt-1">Manage your music catalog</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/profile" className="flex items-center gap-2">
          <MediaImage
            src={user?.imageUrl || "/logo.png"}
            alt={user?.fullName || "Admin"}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm text-zinc-200">
            {user?.fullName || "Admin"}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Header;
