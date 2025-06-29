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

export default function Lobbypagev1({meetingId}:{meetingId: string}) {
  const navigate = useRouter();

  // Zustand store hooks
  const currentView = useCurrentView();
  const currentRoom = useCurrentRoom();
  const userId = useSession().data?.user.id  || "N/A" ;
  const lobbyConfig = useLobbyConfig();

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
};
