"use client";

import { UserButton } from "@/components/user-button";
import AuthProvider from "../auth-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider requireAuth={true}>
      <div className="w-full">
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 px-5 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/80 dark:supports-[backdrop-filter]:bg-slate-950/60">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <span className="text-sm font-bold text-white">W</span>
              </div>
              <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Whsips
              </span>
            </div>

            {/* Right side - User controls */}
            <div className="flex items-center space-x-4">
              <UserButton />
            </div>
          </div>
        </nav>
        <main className="w-full">{children}</main>
      </div>
    </AuthProvider>
  );
}
