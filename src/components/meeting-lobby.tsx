"use client";
import React, { memo } from "react";
import {
  Camera,
  Mic,
  CameraOff,
  MicOff,
  Settings,
  Users,
  ArrowLeft,
  Video,
  VideoOff,
} from "lucide-react";
import { useMeetingLobby } from "../hooks/useMeetingLobby";
import { Button } from "./ui/button";

const LobbyPreview = memo(
  ({
    previewStream,
    isCameraEnabled,
    isMicEnabled,
    toggleCamera,
    toggleMic,
  }: {
    previewStream: MediaStream | null;
    isCameraEnabled: boolean;
    isMicEnabled: boolean;
    toggleCamera: () => void;
    toggleMic: () => void;
  }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
      if (videoRef.current && previewStream && isCameraEnabled) {
        videoRef.current.srcObject = previewStream;
        videoRef.current.play().catch(() => {});
      } else if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }, [previewStream, isCameraEnabled]);

    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-gray-700 bg-[#111111] shadow-lg">
        {previewStream && isCameraEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full -scale-x-100 object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center text-gray-400">
              <CameraOff className="mx-auto mb-2 h-12 w-12" />
              <p>
                {!isCameraEnabled
                  ? "Camera disabled"
                  : "Camera preview unavailable"}
              </p>
            </div>
          </div>
        )}
        {/* Camera and Microphone Controls */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-4">
          <button
            onClick={toggleCamera}
            className={`flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 ${
              isCameraEnabled
                ? "bg-input hover:bg-secondary text-white"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
            title={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isCameraEnabled ? (
              <Video className="h-8 w-8" />
            ) : (
              <VideoOff className="h-8 w-8" />
            )}
          </button>
          <button
            onClick={toggleMic}
            className={`flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 ${
              isMicEnabled
                ? "bg-input hover:bg-secondary text-white"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
            title={isMicEnabled ? "Turn off microphone" : "Turn on microphone"}
          >
            {isMicEnabled ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
    );
  },
);
LobbyPreview.displayName = "LobbyPreview";

export default function MeetingLobby({
  onMeetingJoin,
}: {
  onMeetingJoin: () => void;
}) {
  const {
    cameras,
    microphones,
    selectedCamera,
    selectedMicrophone,
    previewStream,
    isLoading,
    error,
    isCameraEnabled,
    isMicEnabled,
    setSelectedCamera,
    setSelectedMicrophone,
    toggleCamera,
    toggleMic,
    getMeetingConfig,
    cleanup,
  } = useMeetingLobby();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br">
        <div className="text-xl text-white">Setting up your devices...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className="h-fit w-full max-w-[1440px] rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-7">
          {/* Preview Section */}
          <div className="col-span-5 flex aspect-video flex-col space-y-6">
            <LobbyPreview
              previewStream={previewStream}
              isCameraEnabled={isCameraEnabled}
              isMicEnabled={isMicEnabled}
              toggleCamera={toggleCamera}
              toggleMic={toggleMic}
            />

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/20 p-3 text-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="col-span-2 flex h-full min-w-full flex-col justify-center space-y-6">
            <div className="rounded-xl backdrop-blur-sm">
              <h2 className="mb-4 flex items-center text-xl font-semibold text-white">
                <Settings className="mr-2 h-5 w-5" />
                Device Settings
              </h2>

              {/* Camera Selection */}
              <div className="mb-6 space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  <Camera className="mr-2 inline h-4 w-4" />
                  Camera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="bg-popover w-full rounded-lg border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {cameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Microphone Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  <Mic className="mr-2 inline h-4 w-4" />
                  Microphone
                </label>
                <select
                  value={selectedMicrophone}
                  onChange={(e) => setSelectedMicrophone(e.target.value)}
                  className="bg-popover w-full rounded-lg border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {microphones.map((mic) => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Join Button */}
            <Button
              variant="ghost"
              onClick={() => {
                onMeetingJoin();
              }}
              disabled={!selectedCamera || !selectedMicrophone}
              className="!bg-primary !text-primary-foreground hover:bg-primary/80 w-full rounded-xl py-6 text-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed"
            >
              Join Meeting
            </Button>

            <div className="text-center text-sm text-gray-400">
              Make sure your camera and microphone are working properly before
              joining.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
