export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export type Meeting = {
  id: string;
  title: string;
  slug: string;
  hostId: string;
  guestId: string | null;
  createdAt: string;
  is_recording: boolean;
};
