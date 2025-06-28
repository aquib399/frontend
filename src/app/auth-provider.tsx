"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthProvider({
  children,
  requireAuth = false,
}: AuthProviderProps) {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && requireAuth && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, requireAuth, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-600">
          Authentication error: {error.message}
        </div>
      </div>
    );
  }

  if (requireAuth && !session?.user) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
