"use client";

import { getSingleMeeting } from "@/lib/api/meeting";
import { useSession } from "@/lib/auth-client";
import { notFound } from "next/navigation";
import { Meeting } from "@/utils/types";
import { useState } from "react";
import Lobby from "@/components/Meeting/Lobby";
import useMeetingStore from "@/store/store";

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
}
