import React from 'react';
import { useAppStore, useConnectedUsers } from '@/stores/useAppStore';

interface DebugOverlayProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCallActive: boolean;
  isCameraOn: boolean;
  isMuted: boolean;
  isRemoteCameraOn: boolean;
  socket: any;
  roomId: string;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({
  localStream,
  remoteStream,
  isCallActive,
  isCameraOn,
  isMuted,
  isRemoteCameraOn,
  socket,
  roomId,
}) => {
  const connectedUsers = useConnectedUsers();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-xs z-50">
      <h3 className="font-bold mb-2 text-green-400">WebRTC Debug</h3>
      
      <div className="space-y-1">
        <div>Room: <span className="text-blue-400">{roomId}</span></div>
        <div>Socket Connected: <span className={socket?.connected ? 'text-green-400' : 'text-red-400'}>{socket?.connected ? 'Yes' : 'No'}</span></div>
        <div>Socket ID: <span className="text-blue-400">{socket?.id || 'None'}</span></div>
        <div>Connected Users: <span className="text-yellow-400">{connectedUsers.length}</span></div>
        
        <div className="border-t border-gray-600 pt-2 mt-2">
          <div>Call Active: <span className={isCallActive ? 'text-green-400' : 'text-red-400'}>{isCallActive ? 'Yes' : 'No'}</span></div>
          <div>Local Stream: <span className={localStream ? 'text-green-400' : 'text-red-400'}>{localStream ? 'Active' : 'None'}</span></div>
          <div>Remote Stream: <span className={remoteStream ? 'text-green-400' : 'text-red-400'}>{remoteStream ? 'Active' : 'None'}</span></div>
        </div>
        
        <div className="border-t border-gray-600 pt-2 mt-2">
          <div>Local Camera: <span className={isCameraOn ? 'text-green-400' : 'text-red-400'}>{isCameraOn ? 'On' : 'Off'}</span></div>
          <div>Local Mic: <span className={!isMuted ? 'text-green-400' : 'text-red-400'}>{!isMuted ? 'On' : 'Off'}</span></div>
          <div>Remote Camera: <span className={isRemoteCameraOn ? 'text-green-400' : 'text-red-400'}>{isRemoteCameraOn ? 'On' : 'Off'}</span></div>
        </div>

        {localStream && (
          <div className="border-t border-gray-600 pt-2 mt-2">
            <div>Local Tracks:</div>
            <div className="ml-2">
              <div>Video: {localStream.getVideoTracks().length}</div>
              <div>Audio: {localStream.getAudioTracks().length}</div>
            </div>
          </div>
        )}

        {remoteStream && (
          <div className="border-t border-gray-600 pt-2 mt-2">
            <div>Remote Tracks:</div>
            <div className="ml-2">
              <div>Video: {remoteStream.getVideoTracks().length}</div>
              <div>Audio: {remoteStream.getAudioTracks().length}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
