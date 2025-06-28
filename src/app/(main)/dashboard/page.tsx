"use client";

import ComboBox, { OptionsType } from "@/components/combo-box";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { createMeeting } from "@/lib/api/meeting";
import { listUsers } from "@/lib/api/user";
import { useSession } from "@/lib/auth-client";
import { Meeting } from "@/utils/types";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "better-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function Dashboard() {
  const session = useSession();
  const queryClient = useQueryClient();
  const { mutateAsync } = createMeeting({ params: {} });

  // const data  = queryClient.getQueryData(["meeting", "slug"]);

  const [data, setData] = useState<{ meeting: Meeting | null }>({
    meeting: null,
  });

  const handleCreateMeeting = async () => {
    if (!mutateAsync) return;
    const res = await mutateAsync({});
    setData(res.data);
  };
  return (
    <div className="mx-auto max-w-7xl space-y-10 p-10">
      <div className="flex flex-col justify-center space-y-5">
        <Link href={"dashboard/meetings"}>
          <Button>Meetings</Button>
        </Link>
        <Link href={"dashboard/invited-meetings"}>
          <Button>Invited Meetings</Button>
        </Link>
        <Button
          onClick={() => {
            handleCreateMeeting();
            queryClient.setQueryData(["meeting", "slug"], { data: "HELLO" });
          }}
        >
          New Meeting
        </Button>

        <div className="bg-blue-500 p-5">
          DATA:
          <NewMeetingRenderer meetingData={data.meeting} />
        </div>
      </div>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}

function NewMeetingRenderer({ meetingData }: { meetingData: Meeting | null }) {
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm.trim().toLowerCase());
  const { data, isError, isPending, isSuccess } = listUsers({
    params: { search: debouncedSearchTerm },
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const users = (data?.users as User[]) || [];

  const options: OptionsType = Array.isArray(users)
    ? users.map((user) => ({
        label: `${user.name} - ${user.email}`,
        data: user,
      }))
    : [];
  console.log({ meetingData });
  if (!meetingData) return null;

  return (
    <div className="bg-green-200 p-5">
      <h2>New Meeting Created</h2>
      <div>{selectedUser && <p>Selected User: {selectedUser.name}</p>}</div>
      <ComboBox
        searchTerm={searchTerm}
        options={options}
        setSearchTerm={setSearchTerm}
        isPending={isPending}
        isError={isError}
        isSuccess={isSuccess}
        onSelect={(user: User) => {
          setSelectedUser(user);
        }}
      />
      <Link href={"dashboard/meeting/" + meetingData.slug}>
        <Button>GO TO MEETING</Button>
      </Link>

      <pre>{JSON.stringify(meetingData, null, 2)}</pre>
    </div>
  );
}
