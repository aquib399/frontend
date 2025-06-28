"use client";

import { listInvitedMeetings, listMeetings } from "@/lib/api/meeting";

export default function Dashboard() {
  const { data: meetings } = listMeetings({ params: {} });
  return (
    <div className="mx-auto max-w-7xl space-y-10 p-5">
      <div className="bg-blue-100 p-10">
        MEETINGS ({meetings?.meetings?.length}):
        <pre>{JSON.stringify(meetings, null, 2)}</pre>
      </div>
    </div>
  );
}
