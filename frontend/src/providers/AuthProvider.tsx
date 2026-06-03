import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const { user, accessToken, refreshSession } = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();
  const { fetchCurrentSubscription, reset: resetSubscription } = useSubscriptionStore();

  useEffect(() => {
    const initAuth = async () => {
      await refreshSession();
      setLoading(false);
    };

    initAuth();
  }, [refreshSession]);

  useEffect(() => {
    if (user && accessToken) {
      initSocket(accessToken);
      fetchCurrentSubscription();
    } else {
      disconnectSocket();
      resetSubscription();
    }

    return () => disconnectSocket();
  }, [user, accessToken, initSocket, disconnectSocket, fetchCurrentSubscription, resetSubscription]);

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader className="size-8 text-emerald-500 animate-spin" />
      </div>
    );

  return <>{children}</>;
};

export default AuthProvider;
