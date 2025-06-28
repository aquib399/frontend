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
  MoreVertical,
} from "lucide-react";

export default function MeetingPageComponent({ slug }: { slug: string }) {
  const { data, isPending, isError } = getSingleMeeting({
    slug,
    params: {},
  });
  const meeting = (data?.meeting as FullMeeting) || null;

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-4 w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !meeting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-red-50">
        <div className="mx-4 w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Video className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Meeting Not Found
          </h2>
          <p className="text-gray-600">
            The meeting you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 font-medium text-white shadow-lg`}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {meeting.title}
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Video Area */}
            <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-900 shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-700">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-lg text-gray-300">
                    Video will appear here
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Meeting is{" "}
                    {meeting.is_recording ? "being recorded" : "not recording"}
                  </p>
                </div>
              </div>

              {/* Recording Indicator */}
              {meeting.is_recording && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                  <span>Recording</span>
                </div>
              )}
            </div>

            {/* Takes Section */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Takes ({meeting._count.takes})</span>
                </h3>
                <button className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                  <Download className="h-4 w-4" />
                  <span>Download All</span>
                </button>
              </div>

              {meeting.takes.length > 0 ? (
                <div className="space-y-3">
                  {meeting.takes.map((take, index) => (
                    <div
                      key={take.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-semibold text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Take {index + 1}
                          </p>
                          <p className="text-sm text-gray-500">ID: {take.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 transition-colors hover:text-blue-600">
                          <Play className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 transition-colors hover:text-blue-600">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Clock className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">No takes recorded yet</p>
                  <p className="text-sm text-gray-400">
                    Start recording to create your first take
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meeting Info */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center space-x-2 text-lg font-semibold text-gray-900">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Meeting Details</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-sm text-gray-500">Created</p>
                  <p className="text-gray-900">
                    {formatDate(meeting.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-500">Slug</p>
                  <p className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-900">
                    {meeting.slug}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      meeting.is_recording
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {meeting.is_recording ? "Recording" : "Ready"}
                  </span>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center space-x-2 text-lg font-semibold text-gray-900">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Participants</span>
              </h3>
              <div className="space-y-4">
                {/* Host */}
                <div className="flex items-center space-x-3">
                  <UserAvatar user={meeting.host} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {meeting.host.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {meeting.host.email}
                    </p>
                    <span className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      Host
                    </span>
                  </div>
                </div>

                {/* Guest */}
                <div className="flex items-center space-x-3">
                  <UserAvatar user={meeting.guest} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {meeting?.guest?.name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {meeting?.guest?.email || "N/A"}
                    </p>
                    <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                      Guest
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="flex w-full items-center space-x-3 rounded-lg p-3 text-left text-gray-700 transition-colors hover:bg-gray-50">
                  <Share2 className="h-5 w-5 text-gray-400" />
                  <span>Share Meeting</span>
                </button>
                <button className="flex w-full items-center space-x-3 rounded-lg p-3 text-left text-gray-700 transition-colors hover:bg-gray-50">
                  <Download className="h-5 w-5 text-gray-400" />
                  <span>Export Data</span>
                </button>
                <button className="flex w-full items-center space-x-3 rounded-lg p-3 text-left text-gray-700 transition-colors hover:bg-gray-50">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <span>Meeting Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
