"use client";
import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  Camera,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaControlsProps {
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  disabled?: boolean;
  recordingStatus: boolean;
  toggleRecording?: () => void;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  isMuted,
  isCameraOn,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
  disabled = false,
  recordingStatus,
  toggleRecording = () => {},
}) => {
  return (
    <div className="bg-background flex items-center space-x-4 rounded-2xl border border-gray-700 px-8 py-4 shadow-xl">
      {/* Mute Button */}
      <button
        onClick={onToggleMute}
        disabled={disabled}
        className={`group relative transform rounded-2xl p-4 transition-all duration-300 hover:scale-110 ${
          isMuted
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-red-700"
            : "border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-sm hover:bg-white/20"
        }`}
        title={`${isMuted ? "Unmute" : "Mute"} (Press M)`}
      >
        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>

      {/* Camera Button */}
      <button
        onClick={onToggleCamera}
        disabled={disabled}
        className={`group relative transform rounded-2xl p-4 transition-all duration-300 hover:scale-110 ${
          !isCameraOn
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-red-700"
            : "border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-sm hover:bg-white/20"
        }`}
        title={`${isCameraOn ? "Turn off camera" : "Turn on camera"} (Press V)`}
      >
        {isCameraOn ? (
          <Video className="h-6 w-6" />
        ) : (
          <VideoOff className="h-6 w-6" />
        )}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>

      {/* Screen Share Button */}
      <button
        onClick={toggleRecording}
        disabled={disabled}
        className={`group relative transform rounded-2xl p-4 transition-all duration-300 hover:scale-110 ${
          recordingStatus
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700"
            : "border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-sm hover:bg-white/20"
        }`}
        title={`${recordingStatus ? "Stop recording" : "Record"} (Press S)`}
      >
        <Circle  className={cn("h-6 w-6",recordingStatus?"fill-red":"fill-none")} />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>

      {/* Separator Line */}
      <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        disabled={disabled}
        className="group relative transform rounded-2xl bg-gradient-to-r from-red-600 to-red-700 p-4 text-white shadow-lg shadow-red-600/40 transition-all duration-300 hover:scale-110 hover:from-red-700 hover:to-red-800"
        title="End call (Press E or Escape)"
      >
        <PhoneOff className="h-6 w-6" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>
    </div>
  );
};
