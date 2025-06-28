"use client";

import { getSingleMeeting } from "@/lib/api/meeting";
import { FullMeeting } from "@/utils/types";
import {
  User,
  Play,
  Users,
  Clock,
  Video,
  Share2,
  Settings,
  Download,
  Calendar,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function MeetingPageComponent({ slug }: { slug: string }) {
  const { data, isPending, isError } = getSingleMeeting({
    slug,
    params: {},
  });

  const meeting = (data?.meeting as FullMeeting) || null;

  if (isPending) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="bg-card mx-4 w-full max-w-md rounded-xl border p-8">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-4 w-3/4 rounded"></div>
            <div className="bg-muted h-4 w-1/2 rounded"></div>
            <div className="bg-muted h-32 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !meeting) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="bg-card mx-4 w-full max-w-md rounded-xl border p-8 text-center">
          <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Video className="text-destructive h-8 w-8" />
          </div>
          <h2 className="text-foreground mb-2 text-xl font-semibold">
            Meeting Not Found
          </h2>
          <p className="text-muted-foreground">
            The meeting you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const UserAvatar = ({
    user,
    size = "md",
  }: {
    user: any;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClasses = {
      sm: "w-8 h-8 text-sm",
      md: "w-12 h-12 text-base",
      lg: "w-16 h-16 text-lg",
    };
    return (
      <div
        className={`${sizeClasses[size]} bg-primary flex items-center justify-center rounded-full border text-white`}
      >
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          user?.name?.charAt(0)?.toUpperCase() || (
            <User className="h-1/2 w-1/2" />
          )
        )}
      </div>
    );
  };

  return (
    <div className="bg-background px-5">
      <div className="mx-auto max-w-7xl py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="bg-card relative aspect-video overflow-hidden rounded-xl border">
              <h1 className="text-foreground absolute top-4 left-5 z-10 text-xl font-semibold">
                {meeting.title}
              </h1>
              <div className="bg-card absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
                    <Video className="text-muted-foreground h-12 w-12" />
                  </div>
                  <p className="text-muted-foreground text-lg">
                    Video will appear here
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Meeting is{" "}
                    {meeting.is_recording ? "being recorded" : "not recording"}
                  </p>
                </div>
              </div>
              {meeting.is_recording && (
                <div className="bg-destructive absolute top-4 left-4 flex items-center space-x-2 rounded-full px-3 py-1 text-sm font-medium text-white">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                  <span>Recording</span>
                </div>
              )}
              <div className="absolute bottom-4 flex w-full justify-center">
                <Button size={"lg"}>
                  <Link href={`/meeting/${meeting.slug}`}>Join Meeting</Link>
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-foreground flex items-center space-x-2 text-lg font-semibold">
                  <Clock className="text-primary h-5 w-5" />
                  <span>Takes ({meeting._count.takes})</span>
                </h3>
                <Button
                  disabled={!meeting.takes.length}
                  className="disabled:cusror-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>Download All</span>
                </Button>
              </div>
              {meeting.takes.length > 0 ? (
                <div className="space-y-3">
                  {meeting.takes.map((take, i) => (
                    <div
                      key={take.id}
                      className="bg-muted hover:bg-muted/80 flex items-center justify-between rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full">
                          <span className="text-primary text-sm font-semibold">
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-foreground font-medium">
                            Take {i + 1}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            ID: {take.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {[Play, Download].map((Icon, idx) => (
                          <button
                            key={idx}
                            className="text-muted-foreground hover:text-primary p-2"
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Clock className="text-muted mx-auto mb-3 h-12 w-12" />
                  <p className="text-muted-foreground">No takes recorded yet</p>
                  <p className="text-muted-foreground text-sm">
                    Start recording to create your first take
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meeting Info */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-foreground mb-4 flex items-center space-x-2 text-lg font-semibold">
                <Calendar className="text-primary h-5 w-5" />
                <span>Meeting Details</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">Created</p>
                  <p className="text-foreground">
                    {formatDate(meeting.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">
                    Meeting Id:{" "}
                  </p>
                  <p className="bg-muted text-foreground rounded px-3 py-1.5 font-mono text-sm">
                    {meeting.slug}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${meeting.is_recording ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
                  >
                    {meeting.is_recording ? "Recording" : "Ready"}
                  </span>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-foreground mb-4 flex items-center space-x-2 text-lg font-semibold">
                <Users className="text-primary h-5 w-5" />
                <span>Participants</span>
              </h3>
              <div className="space-y-4">
                {[
                  { user: meeting.host, label: "Host" },
                  { user: meeting.guest, label: "Guest" },
                ].map(({ user, label }, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <UserAvatar user={user} />
                    <div className="flex-1">
                      <p className="text-foreground font-medium">
                        {user?.name || "N/A"}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {user?.email || "N/A"}
                      </p>
                      <span className="bg-muted text-foreground mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {[
                  ["Share Meeting", Share2] as const,
                  ["Export Data", Download] as const,
                  ["Meeting Settings", Settings] as const,
                ].map(([label, Icon], idx) => (
                  <button
                    key={idx}
                    className="text-foreground hover:bg-muted flex w-full items-center space-x-3 rounded-lg p-3 text-left"
                  >
                    <Icon className="text-muted-foreground h-5 w-5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
