"use client";

import AuthProvider from "../auth-provider";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return <AuthProvider requireAuth={true}>{children}</AuthProvider>;
}
