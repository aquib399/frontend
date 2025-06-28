"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { listMeetings } from "@/lib/api/meeting";
import { Meeting } from "@/utils/types";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/user-avatar";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Calendar,
  Mail,
  Users,
  Video,
  VideoOff,
  Loader2,
  AlertCircle,
  FileVideo,
  User,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { data, isPending, isError, isSuccess, error } = listMeetings({
    params: {},
  });
  const meetings = (data?.meetings as Meeting[]) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-br p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your meetings and stay organized
          </p>
        </div>

        {/* Loading State */}
        {isPending && (
          <Card className="border-muted border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                Loading your meetings
              </h3>
              <p className="text-muted-foreground">
                Please wait while we fetch your meetings...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error loading meetings:</strong>{" "}
              {error?.message ||
                "Something went wrong while fetching your meetings. Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        {/* Success State - Show meetings */}
        {isSuccess && (
          <>
            {/* Stats Card */}
            <Card className="border-primary/20 bg-primary/5 border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="text-primary h-5 w-5" />
                    <CardTitle className="text-foreground text-xl">
                      All Meetings
                    </CardTitle>
                  </div>
                  <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <FileVideo className="h-4 w-4" />
                      <span>
                        {meetings.reduce((acc, m) => acc + m._count.takes, 0)}{" "}
                        total recordings
                      </span>
                    </div>
                  </div>
                </div>
                <CardDescription>
                  You have {meetings.length} meeting
                  {meetings.length !== 1 ? "s" : ""} waiting for you
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Meetings Grid */}
            {meetings.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {meetings.map((meeting) => (
                  <Link key={meeting.id} href={"meetings/" + meeting.slug}>
                    <Card className="group hover:border-primary/40 border-muted hover:bg-accent/30 border-2 transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-1">
                            <CardTitle className="text-foreground group-hover:text-primary line-clamp-2 text-lg font-semibold transition-colors">
                              {meeting.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              /{meeting.slug}
                            </CardDescription>
                          </div>
                          <div className="ml-2 flex flex-col gap-2">
                            {meeting._count.takes > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <FileVideo className="mr-1 h-3 w-3" />
                                {meeting._count.takes} take
                                {meeting._count.takes !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Host Information */}
                        <div className="bg-muted/50 flex items-center space-x-3 rounded-lg p-3">
                          <UserAvatar
                            avatarUrl={meeting.host.image}
                            className="h-10 w-10"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground truncate text-sm font-medium">
                              {meeting.host.name}
                            </p>
                            <div className="text-muted-foreground flex items-center space-x-1 text-xs">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">
                                {meeting.host.email}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Host
                          </Badge>
                        </div>

                        {/* Meeting Details */}
                        <div className="space-y-3">
                          <div className="text-muted-foreground flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Created {formatDate(meeting.createdAt)}</span>
                          </div>

                          <div className="text-muted-foreground flex items-center text-sm">
                            <User className="mr-2 h-4 w-4" />
                            <span>
                              Guest ID:{" "}
                              <code className="bg-muted text-foreground rounded px-1 py-0.5 text-xs">
                                {meeting.guestId}
                              </code>
                            </span>
                          </div>
                        </div>

                        <div className="border-border border-t pt-2">
                          <p className="text-muted-foreground text-xs">
                            Meeting ID: {meeting.id}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-muted border-2">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-muted mb-4 rounded-full p-4">
                    <Calendar className="text-muted-foreground h-8 w-8" />
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    No meetings
                  </h3>
                  <p className="text-muted-foreground">
                    You don't have any meetings at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
