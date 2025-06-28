import { User } from "better-auth";

export type Meeting = {
  id: string;
  title: string;
  slug: string;
  hostId: string;
  guestId: string;
  createdAt: string;
  is_recording: boolean;
  _count: {
    takes: number;
  };
  host: {
    name: string;
    email: string;
    image: string;
  };
};

export type Take = {
  id: string;
};

export type FullMeeting = {
  id: string;
  title: string;
  slug: string;
  hostId: string;
  guestId: string;
  createdAt: string;
  is_recording: boolean;
  _count: {
    takes: number;
  };
  guest?: User;
  host: User;
  takes: Take[];
};
