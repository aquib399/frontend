import useApiRequest from "@/utils/fetch-controller";
import { apiEndpoints } from "./endpoints";

export function listMeetings({ params }: { params: Record<string, string> }) {
  const res = useApiRequest({
    endpoint: apiEndpoints.meetings.base,
    queryKey: ["meetings", "list"],
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
    queryKey: ["meetings", "create"],
    params,
  });
  return res;
}

export function getSingleMeeting({
  params,
  meeting_id,
}: {
  params: Record<string, string>;
  meeting_id: string;
}) {
  const res = useApiRequest({
    method: "POST",
    endpoint: apiEndpoints.meetings.getSingleMeeting(meeting_id),
    queryKey: ["meetings", "getSingle", meeting_id],
    params,
  });
  return res;
}
