const meetings = {
  base: "/api/meeting",
  create: "/api/meeting/create-meeting",
  invited: "/api/meeting/invited",
  getSingleMeeting: (id: string) => `/api/meeting/${id}`,
};

const users = {
  base: "/api/users",
};

const takes = {
  base: "/api/takes",
  getSingleTake: (id: string) => `/api/takes/${id}`,
};

export const apiEndpoints = {
  meetings,
  takes,
  users,
};
