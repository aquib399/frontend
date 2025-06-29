"use client";
import React, { useEffect } from "react";
import { MeetingLobby } from "@/components/MeetingLobby";
import VideoCall from "@/components/VideoCall";
import {
  useAppStore,
  useCurrentView,
  useCurrentRoom,
  useUserId,
  useLobbyConfig,
} from "@/stores/useAppStore";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getSingleMeeting } from "@/lib/api/meeting";
import { Meeting } from "@/utils/types";

export default function Lobbypagev1({ meetingId }: { meetingId: string }) {
  const navigate = useRouter();

  const meetingRes = getSingleMeeting({ slug: meetingId, params: {} });

  // Zustand store hooks
  const currentView = useCurrentView();
  const currentRoom = useCurrentRoom();
  const userId = useSession().data?.user.id || "N/A";
  const lobbyConfig = useLobbyConfig();

  const meeting = meetingRes?.data?.meeting as Meeting;
  if (meeting && !meetingRes.isPending && meetingRes.isSuccess) {
    if (![meeting?.guestId, meeting?.hostId].includes(userId)) {
      // er is not a guest or host of the meeting, redirect to home
      navigate.push("/dashboard");
      return null;
    }
  }
  // Store actions
  const {
    setCurrentRoom,
    joinMeeting,
    leaveRoom,
    getDeviceConfig,
    setCurrentView,
  } = useAppStore();

  useEffect(() => {
    if (!meetingId) {
      navigate.push("/");
      return;
    }

    // Set the meeting ID as the current room
    setCurrentRoom(meetingId);
    setCurrentView("lobby");
  }, [meetingId, navigate, setCurrentRoom, setCurrentView]);

  const handleBackToHome = () => {
    leaveRoom();
    navigate.push("/");
  };

  if (!meetingId || !currentRoom) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {currentView === "lobby" && (
        <MeetingLobby
          roomId={currentRoom}
          userName=""
          onJoinMeeting={joinMeeting}
          isCreatingRoom={false} // In this flow, we're always joining an existing meeting ID
          onBack={handleBackToHome}
        />
      )}

      {currentView === "call" && lobbyConfig && (
        <VideoCall
          roomId={currentRoom}
          userId={userId}
          onLeaveRoom={handleBackToHome}
          deviceConfig={
            getDeviceConfig() || {
              videoDeviceId: "",
              audioDeviceId: "",
              initialVideoEnabled: false,
              initialAudioEnabled: false,
            }
          }
        />
      )}
    </div>
  );
}
