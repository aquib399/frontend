"use client";

import MeetingLobby from "@/components/meeting-lobby";
import { getSingleMeeting } from "@/lib/api/meeting";
import { useSession } from "@/lib/auth-client";
import { notFound } from "next/navigation";
import { Meeting } from "@/utils/types";

export default function MainComponent({ slug }: { slug: string }) {
  const { data } = useSession();
  const user = data?.user;
  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  const meetingRes = getSingleMeeting({ params: {}, slug });

  const meeting = meetingRes.data?.meeting as Meeting;

  if (!meetingRes.isPending && !meeting) {
    return notFound();
  }

  const onMeetingJoin = () => {
    alert("Meeting join functionality is not implemented yet.");
  };
  return <MeetingLobby onMeetingJoin={onMeetingJoin} />;
}
