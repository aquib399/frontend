'use client';
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
import { useMeetingLobby } from "@/hooks/useMeetingLobby";
import { Button } from "./ui/button";

interface MeetingLobbyProps {
  roomId: string;
  userName: string;
  onJoinMeeting: (config: {
    cameraDeviceId: string;
    micDeviceId: string;
    cameraEnabled: boolean;
    micEnabled: boolean;
  }) => void;
  isCreatingRoom: boolean;
  onBack: () => void;
  meetingTitle?: string;
  participantCount?: number;
}

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
      <div className="relative overflow-hidden bg-[#111111] border border-gray-700 shadow-lg aspect-video rounded-2xl">
        {previewStream && isCameraEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center text-gray-400">
              <CameraOff className="w-12 h-12 mx-auto mb-2" />
              <p>
                {!isCameraEnabled
                  ? "Camera disabled"
                  : "Camera preview unavailable"}
              </p>
            </div>
          </div>
        )}
        {/* Camera and Microphone Controls */}
        <div className="absolute flex space-x-4 -translate-x-1/2 bottom-4 left-1/2">
          <button
            onClick={toggleCamera}
            className={`flex items-center justify-center w-16 h-16  rounded-full transition-all duration-200 ${
              isCameraEnabled
                ? "bg-input hover:bg-secondary text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
            title={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isCameraEnabled ? (
              <Video className="w-8 h-8" />
            ) : (
              <VideoOff className="w-8 h-8" />
            )}
          </button>
          <button
            onClick={toggleMic}
            className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 ${
              isMicEnabled
                ? "bg-input hover:bg-secondary text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
            title={isMicEnabled ? "Turn off microphone" : "Turn on microphone"}
          >
            {isMicEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    );
  }
);
LobbyPreview.displayName = "LobbyPreview";
export const MeetingLobby: React.FC<MeetingLobbyProps> = ({
  roomId,
  userName,
  onJoinMeeting,
  isCreatingRoom,
  onBack,
  meetingTitle = "Video Meeting",
  participantCount = 0,
}) => {
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

  const handleJoinMeeting = () => {
    const config = getMeetingConfig();
    cleanup(); // Clean up preview stream before joining
    onJoinMeeting(config);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
        <div className="text-xl text-white">Setting up your devices...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[#111111]">
      <div className="w-full h-full max-w-[1440px] p-8  shadow-2xl bg-card backdrop-blur-sm rounded-2xl">
        {/* Header with room info and back button */}
        {/* <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 transition-colors hover:text-white mt-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div></div> 
        </div> */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-7">
          {/* Preview Section */}
          <div className="flex flex-col space-y-6 col-span-5 aspect-video">
            {/* <div className="text-center">
              <h1 className="mb-2 text-3xl font-bold text-white">{meetingTitle}</h1>
            </div> */}

            {/* Video Preview */}
            <LobbyPreview
              previewStream={previewStream}
              isCameraEnabled={isCameraEnabled}
              isMicEnabled={isMicEnabled}
              toggleCamera={toggleCamera}
              toggleMic={toggleMic}
            />

            {error && (
              <div className="p-3 text-red-200 border rounded-lg bg-red-500/20 border-red-500/30">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-6 col-span-2 h-full justify-center min-w-full">
            <div className="bg-card backdrop-blur-sm rounded-xl">
              <h2 className="flex items-center mb-4 text-xl font-semibold text-white">
                <Settings className="w-5 h-5 mr-2" />
                Device Settings
              </h2>

              {/* Camera Selection */}
              <div className="mb-6 space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  <Camera className="inline w-4 h-4 mr-2" />
                  Camera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full px-3 py-2 text-white bg-popover border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <Mic className="inline w-4 h-4 mr-2" />
                  Microphone
                </label>
                <select
                  value={selectedMicrophone}
                  onChange={(e) => setSelectedMicrophone(e.target.value)}
                  className="w-full px-3 py-2 text-white bg-popover border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onClick={handleJoinMeeting}
              disabled={!selectedCamera || !selectedMicrophone}
              className="w-full py-6 text-lg font-semibold !bg-primary !text-primary-foreground transition-all duration-200 hover:bg-primary/80 disabled:cursor-not-allowed rounded-xl"
            >
              Join Meeting
            </Button>

            <div className="text-sm text-center text-gray-400">
              Make sure your camera and microphone are working properly before
              joining.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
