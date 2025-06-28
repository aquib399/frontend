import React, { useRef, useEffect } from 'react';
import { VideoOff, MicOff, Monitor, Users, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { truncateString, copyToClipboard } from '@/utils';
import { UI_CONFIG } from '@/constants';

interface VideoStreamProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  isMuted?: boolean;
  isCameraOn?: boolean;
  isScreenSharing?: boolean;
  title: string;
  roomId?: string;
  onCopyRoomId?: () => void;
  className?: string;
}

export const VideoStream: React.FC<VideoStreamProps> = React.memo(({
  stream,
  isLocal = false,
  isMuted = false,
  isCameraOn = true,
  isScreenSharing = false,
  title,
  roomId,
  onCopyRoomId,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (stream) {
      const videoTracks = stream.getVideoTracks();
      const hasEnabledVideo = videoTracks.length > 0 && videoTracks[0]?.enabled;
      
      console.log(`Setting ${isLocal ? 'local' : 'remote'} video stream:`, {
        streamId: stream.id,
        videoTracks: videoTracks.length,
        videoEnabled: hasEnabledVideo,
        isCameraOn,
      });
      
      // Always set the stream, but the overlay will handle disabled camera state
      videoElement.srcObject = stream;
    } else {
      console.log(`Clearing ${isLocal ? 'local' : 'remote'} video stream`);
      videoElement.srcObject = null;
    }
  }, [stream, isLocal, isCameraOn]);

  const handleCopyRoomId = async () => {
    if (roomId && onCopyRoomId) {
      const success = await copyToClipboard(roomId);
      if (success) {
        onCopyRoomId();
      }
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-black/90 rounded-2xl backdrop-blur-sm border border-white/20 shadow-2xl ${className}`}>
      {/* Video Element - Always render if stream exists */}
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="w-full h-full object-cover rounded-2xl"
        />
      ) : (
        /* No Stream Placeholder - Only show when no stream */
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm">
          {!isLocal ? (
            <div className="text-center px-6">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center mx-auto border border-white/30 shadow-xl backdrop-blur-sm">
                  <Users className="w-12 h-12 text-white/80" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold  mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Waiting for remote peer...
              </h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Share the room ID to invite others to this call
              </p>
              {roomId && (
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="bg-black/60 rounded-lg px-4 py-3 border border-white/20">
                      <code className="text-white font-mono text-base tracking-wider">
                        {truncateString(roomId, UI_CONFIG.ROOM_ID_DISPLAY_LENGTH)}...
                      </code>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyRoomId}
                      className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-700/80 hover:to-blue-700/80"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-600/50 to-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                <VideoOff className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-300 text-lg">No video stream</p>
            </div>
          )}
        </div>
      )}

      {/* Camera Off Overlay - Show when camera is off OR no enabled video tracks */}
      {stream && (!isCameraOn || !stream.getVideoTracks().some(track => track.enabled)) && !isScreenSharing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-600/50 to-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-xl">
              <VideoOff className="w-10 h-10 text-white/80" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {isLocal ? 'Camera is off' : 'Remote camera is off'}
            </h3>
            <p className="text-gray-400">
              {isLocal ? 'Click the camera button to turn on' : 'Waiting for remote user to turn on camera'}
            </p>
            {/* Debug info - remove in production */}
            <div className="mt-4 text-xs text-gray-500">
              Debug: isCameraOn={isCameraOn ? 'true' : 'false'}, 
              videoTracks={stream?.getVideoTracks().length || 0}, 
              enabled={stream?.getVideoTracks().some(track => track.enabled) ? 'true' : 'false'}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Video Title with glassmorphism */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
          <span className="text-sm font-semibold text-white tracking-wide">
            {title} {isScreenSharing && '• Screen Sharing'}
          </span>
        </div>
      </div>

      {/* Enhanced Mute Indicator */}
      {isMuted && isLocal && (
        <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-xl rounded-xl p-3 border border-red-400/30 shadow-lg shadow-red-500/30">
          <div className="flex items-center space-x-2">
            <MicOff className="w-4 h-4 text-white" />
            <span className="text-xs font-medium text-white">Muted</span>
          </div>
        </div>
      )}

      {/* Enhanced Screen Share Indicator */}
      {isScreenSharing && (
        <div className="absolute bottom-4 left-4 bg-blue-500/90 backdrop-blur-xl rounded-xl px-4 py-2 border border-blue-400/30 shadow-lg shadow-blue-500/30">
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">
              {isLocal ? 'Sharing Screen' : 'Remote Screen Share'}
            </span>
          </div>
        </div>
      )}

      {/* Subtle border glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-blue-500/10 to-purple-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
});

VideoStream.displayName = 'VideoStream';