"use client";

import { getSingleMeeting } from "@/lib/api/meeting";
import { useSession } from "@/lib/auth-client";
import { notFound } from "next/navigation";

export default function MainComponent({ slug }: { slug: string }) {
  const { data } = useSession();
  const user = data?.user;
  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  const meetingRes = getSingleMeeting({ params: {}, slug });

  const meeting = meetingRes.data?.meeting;

  if(!meetingRes.isPending && !meeting) {
    return notFound();
  }
  return (
    <div>
      Meeting:
      <pre>{JSON.stringify(meeting, null, 2)}</pre>
    </div>
  );
}
