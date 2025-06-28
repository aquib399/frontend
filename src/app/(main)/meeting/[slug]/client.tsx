"use client";

import { getSingleMeeting } from "@/lib/api/meeting";
import { useSession } from "@/lib/auth-client";
import { notFound } from "next/navigation";
import { Meeting } from "@/utils/types";
import Lobby from "./lobby";
import useMeetingStore from "@/store/store";
import Room from "./room";

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

  const { isJoined } = useMeetingStore();
  if (isJoined) {
    return <Room />;
  }
  return <Lobby meetingSlug={slug} />;
}
