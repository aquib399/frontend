"use client";

import ComboBox, { type OptionsType } from "@/components/combo-box";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/useDebounce";
import { createMeeting, inviteUserToMeeting } from "@/lib/api/meeting";
import { listUsers } from "@/lib/api/user";
import { useSession } from "@/lib/auth-client";
import type { Meeting } from "@/utils/types";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "better-auth";
import Link from "next/link";
import { useState } from "react";
import {
  Calendar,
  Users,
  Plus,
  Video,
  UserPlus,
  Clock,
  Mail,
  ExternalLink,
  Loader2,
} from "lucide-react";
import RoomJoin from "@/components/RoomJoin";

export default function Dashboard() {
  const session = useSession();
  const queryClient = useQueryClient();
  const { mutateAsync, isPending: isCreatingMeeting } = createMeeting({
    params: {},
  });

  const [createdMeeting, setCreatedMeeting] = useState<Meeting | null>(null);
  const handleCreateMeeting = async () => {
    if (!mutateAsync) return;

    try {
      const res = await mutateAsync({});
      setCreatedMeeting(res.data.meeting);
    } catch (error) {
      console.error("Failed to create meeting:", error);
    }
  };

  return (
    <div className="bg-background min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {session.data?.user?.name}
          </h1>
          <p className="text-muted-foreground">
            Manage your meetings and collaborate with your team
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-base">Your Meetings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                View and manage all your scheduled meetings
              </CardDescription>
              <Link href="/dashboard/meetings">
                <Button variant="outline" className="w-full bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Meetings
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-base">Invitations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Check meetings you've been invited to
              </CardDescription>
              <Link href="/dashboard/invited-meetings">
                <Button variant="outline" className="w-full bg-transparent">
                  <UserPlus className="mr-2 h-4 w-4" />
                  View Invitations
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                  <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-base">Quick Start</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Create a new meeting instantly
              </CardDescription>
              <Button
                onClick={handleCreateMeeting}
                disabled={isCreatingMeeting}
                className="w-full"
              >
                {isCreatingMeeting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    New Meeting
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Created Meeting Section */}
        {createdMeeting && <NewMeetingCard meeting={createdMeeting} />}

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                <Users className="h-4 w-4" />
              </div>
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Name</p>
                <p className="text-muted-foreground text-sm">
                  {session.data?.user?.name}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Email</p>
                <div className="flex items-center space-x-2">
                  <p className="text-muted-foreground text-sm">
                    {session.data?.user?.email}
                  </p>
                  {session.data?.user?.emailVerified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  function NewMeetingCard({ meeting }: { meeting: Meeting }) {
    const [searchTerm, setSearchTerm] = useState("");
    const { mutateAsync } = inviteUserToMeeting({
      meeting_id: meeting.id,
      params: {},
    });
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const debouncedSearchTerm = useDebounce(searchTerm.trim().toLowerCase());

    const { data, isError, isPending, isSuccess } = listUsers({
      params: { search: debouncedSearchTerm },
    });

    const users = (data?.users as User[]) || [];
    const options: OptionsType = Array.isArray(users)
      ? users.map((user) => ({
          label: `${user.name} - ${user.email}`,
          data: user,
        }))
      : [];

    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
              <Video className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-green-800 dark:text-green-200">
                Meeting Created Successfully!
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                Your meeting is ready. Invite participants and start
                collaborating.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meeting Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Meeting Title
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {meeting.title}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Meeting ID
              </p>
              <p className="font-mono text-sm text-green-700 dark:text-green-300">
                {meeting.slug}
              </p>
            </div>
          </div>

          <hr className="bg-green-200 dark:bg-green-800" />

          {/* Invite Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-green-600 dark:text-green-400" />
              <h3 className="font-medium text-green-800 dark:text-green-200">
                Invite Participants
              </h3>
            </div>

            {selectedUser && (
              <div className="rounded-lg border border-green-200 bg-white p-3 dark:border-green-800 dark:bg-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <ComboBox
              searchTerm={searchTerm}
              options={options}
              setSearchTerm={setSearchTerm}
              isPending={isPending}
              isError={isError}
              isSuccess={isSuccess}
              onSelect={async (user: User) => {
                if (!mutateAsync) return;
                await mutateAsync({
                  email: user.email,
                });
                setSelectedUser(user);
              }}
            />
          </div>

          <hr className="bg-green-200 dark:bg-green-800" />

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/meeting/${meeting.slug}`} className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                <ExternalLink className="mr-2 h-4 w-4" />
                Join Meeting
              </Button>
            </Link>
            <Button
              variant="outline"
              className="flex-1 border-green-200 bg-transparent text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950"
            >
              <Clock className="mr-2 h-4 w-4" />
              Schedule for Later
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}
