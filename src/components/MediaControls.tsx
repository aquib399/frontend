'use client';
import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor } from 'lucide-react';

interface MediaControlsProps {
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  disabled?: boolean;
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
}) => {
  return (
    <div className="flex items-center px-8 py-4 space-x-4 border border-gray-700 shadow-xl bg-background rounded-2xl">
      {/* Mute Button */}
      <button
        onClick={onToggleMute}
        disabled={disabled}
        className={`group relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
          isMuted
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30'
            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-sm'
        }`}
        title={`${isMuted ? 'Unmute' : 'Mute'} (Press M)`}
      >
        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:opacity-100" />
      </button>

      {/* Camera Button */}
      <button
        onClick={onToggleCamera}
        disabled={disabled}
        className={`group relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
          !isCameraOn
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30'
            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-sm'
        }`}
        title={`${isCameraOn ? 'Turn off camera' : 'Turn on camera'} (Press V)`}
      >
        {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:opacity-100" />
      </button>

      {/* Screen Share Button */}
      <button
        onClick={onToggleScreenShare}
        disabled={disabled}
        className={`group relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
          isScreenSharing
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30'
            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-sm'
        }`}
        title={`${isScreenSharing ? 'Stop sharing' : 'Share screen'} (Press S)`}
      >
        <Monitor className="w-6 h-6" />
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:opacity-100" />
      </button>

      {/* Separator Line */}
      <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/30 to-transparent" />

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        disabled={disabled}
        className="relative p-4 text-white transition-all duration-300 transform shadow-lg group rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-110 shadow-red-600/40"
        title="End call (Press E or Escape)"
      >
        <PhoneOff className="w-6 h-6" />
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:opacity-100" />
      </button>
    </div>
  );
};
