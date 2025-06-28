"use client";

import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";

interface MeetingRoomProps {
  roomId: string;
}

export const Room=({roomId}:{roomId:string}) => {
  const { socket, isConnected } = useSocket();

  const {
    localStream,
    remoteStream,
    startCall,
    endCall,
    isCallActive,
    isMuted,
    isCameraOn,
    isRemoteCameraOn,
    isScreenSharing,
    isRemoteScreenSharing,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useWebRTC(socket, roomId);

  useEffect(() => {
    if (isConnected && socket) {
      socket.emit("join-room", { roomId });
      startCall();
    }

    return () => {
      endCall();
    };
  }, [isConnected, socket, roomId]);

  return (
    <div className="flex flex-col gap-4 items-center p-4">
      <h1 className="text-xl font-semibold">Meeting Room: {roomId}</h1>

      <div className="flex gap-4">
        <div>
          <h2 className="text-sm font-medium">Your Camera</h2>
          <video
            ref={(video) => {
              if (video && localStream) {
                video.srcObject = localStream;
              }
            }}
            autoPlay
            muted
            playsInline
            className="w-64 h-36 bg-black rounded"
          />
        </div>

        <div>
          <h2 className="text-sm font-medium">Remote Camera</h2>
          <video
            ref={(video) => {
              if (video && remoteStream) {
                video.srcObject = remoteStream;
              }
            }}
            autoPlay
            playsInline
            className="w-64 h-36 bg-black rounded"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={toggleMute} className="px-3 py-1 bg-gray-800 text-white rounded">
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button onClick={toggleCamera} className="px-3 py-1 bg-gray-800 text-white rounded">
          {isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
        </button>

        <button onClick={toggleScreenShare} className="px-3 py-1 bg-gray-800 text-white rounded">
          {isScreenSharing ? "Stop Share" : "Share Screen"}
        </button>

        <button onClick={endCall} className="px-3 py-1 bg-red-600 text-white rounded">
          End Call
        </button>
      </div>

      <div className="text-xs text-gray-400">
        Call Status: {isCallActive ? "Connected" : "Disconnected"} | Remote Cam:{" "}
        {isRemoteCameraOn ? "On" : "Off"} | Remote Screen:{" "}
        {isRemoteScreenSharing ? "On" : "Off"}
      </div>
    </div>
  );
};

export default Room;
