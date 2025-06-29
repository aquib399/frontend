const meetings = {
  base: "/api/meeting",
  create: "/api/meeting/create-meeting",

  invited: "/api/meeting/invited",
  invite: (meeting_id: string) => `/api/meeting/invite/${meeting_id}`,
  getSingleMeeting: (slug: string) => `/api/meeting/${slug}`,
};

const users = {
  base: "/api/users",
};

const takes = {
  base: "/api/takes",
  create: (meeting_id:string)=>`/api/takes/create/${meeting_id}`,

  getSingleTake: (id: string) => `/api/takes/${id}`,
};

export const apiEndpoints = {
  meetings,
  takes,
  users,
};
