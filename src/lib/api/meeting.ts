"use client";
import useApiRequest from "@/utils/fetch-controller";
import { apiEndpoints } from "./endpoints";

export function listMeetings({ params }: { params: Record<string, string> }) {
  const res = useApiRequest({
    endpoint: apiEndpoints.meetings.base,
    queryKey: ["meetings", "list", "base"],
    params,
  });
  return res;
}

export function listInvitedMeetings({
  params,
}: {
  params: Record<string, string>;
}) {
  const res = useApiRequest({
    endpoint: apiEndpoints.meetings.invited,
    queryKey: ["meetings", "list", "invited"],
    params,
  });
  return res;
}

export function createMeeting({ params }: { params: Record<string, string> }) {
  const res = useApiRequest({
    exact: false,
    method: "POST",
    endpoint: apiEndpoints.meetings.create,
    queryKey: ["meetings", "list"],
    params,
  });
  return res;
}


export function inviteUserToMeeting({ params,meeting_id }: { params: Record<string, string>,meeting_id: string }) {
  const res = useApiRequest({
    exact: false,
    method: "POST",
    endpoint: apiEndpoints.meetings.invite(meeting_id),
    queryKey: ["meetings", "invite", meeting_id],
    params,
  });
  return res;
}


export function getSingleMeeting({
  params,
  slug,
}: {
  params: Record<string, string>;
  slug: string;
}) {
  const res = useApiRequest({
    method: "GET",
    endpoint: apiEndpoints.meetings.getSingleMeeting(slug),
    queryKey: ["meetings", "single", slug],
    params,
  });
  return res;
}
