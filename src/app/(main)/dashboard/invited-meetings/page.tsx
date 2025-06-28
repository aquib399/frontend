"use client";

import { listInvitedMeetings } from "@/lib/api/meeting";

export default function Dashboard() {
  const { data: invitedMeetings } = listInvitedMeetings({ params: {} });
  return (
    <div className="mx-auto max-w-7xl space-y-10 p-5">
      <div className="bg-yellow-100 p-10">
        INVITED MEETINGS:
        <pre>{JSON.stringify(invitedMeetings, null, 2)}</pre>
      </div>
    </div>
  );
}
