"use client";

import { useSession } from "@/lib/auth-client";

export default function Dashboard() {
  const session = useSession();
  return (
    <div className="p-10">
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
