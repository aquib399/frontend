"use client";

import { signIn } from "@/lib/auth-client";
import { GithubIcon } from "lucide-react";
import { useState } from "react";

export default function GithubLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn.social({
        provider: "github",
        callbackURL: process.env.NEXT_PUBLIC_SUCESS_REDIRECT,
      });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      ) : (
        <GithubIcon />
      )}
      {isLoading ? "Signing in..." : "Continue with Google"}
    </button>
  );
}
