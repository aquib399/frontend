"use client";

import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      redirect("/dashboard");
    }
  }, [session, isPending]);
  return <>{children}</>;
}
