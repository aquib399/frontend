import React, { useEffect, useState, useCallback, useRef } from "react";
import { VideoCallProps } from "@/types";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useSocket } from "@/hooks/useSocket";
import { VideoStream } from "./VideoStream";
import { MediaControls } from "./MediaControls";
import { CallHeader } from "./CallHeader";
import { RoomInfoModal } from "./RoomInfoModal";
import { DebugOverlay } from "./DebugOverlay";
import { SOCKET_EVENTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { createLogger } from "@/utils/logger";
import { useAppStore, useConnectedUsers } from "@/stores/useAppStore";
import { createTake } from "@/lib/api/takes";

const logger = createLogger("VideoCall");

const VideoCall: React.FC<VideoCallProps> = ({
  roomId,
  userId,
  onLeaveRoom,
  deviceConfig,
}) => {
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const hasJoinedRef = useRef(false);

  // Use Zustand store for connected users
  const connectedUsers = useConnectedUsers();
  const { setConnectedUsers, removeConnectedUser } = useAppStore();

  const { socket, isConnected } = useSocket();

  const {
    localStream,
    remoteStream,
    isCallActive,
    isMuted,
    isCameraOn,
    isScreenSharing,
    isRemoteCameraOn,
    isRemoteScreenSharing,
    startCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useWebRTC(socket, roomId, deviceConfig);
  type ChunkTask = {
    chunk: Blob;
    type: "video" | "audio";
    retries: number;
    index: number;
  };
  // const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  // const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);
  const chunkQueueRef = useRef<ChunkTask[]>([]);
  const chunkCounterRef = useRef(0);
  const uploadingRef = useRef(false);
  const takeNumber = useRef(0);
  const uploadCounterRef = useRef(0);
  const [recordingStatus, setRecordingStatus] = useState(false);

  async function uploadChunk(task: ChunkTask): Promise<boolean> {
    const { chunk, type, index } = task;
    for (; task.retries < 3; task.retries++) {
      try {
        const fileName = `${type}_${index}.webm`;
        const formData = new FormData();
        formData.append("chunk", chunk);
        const meetingId = roomId;
        const takeId = takeNumber.current.toString();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/upload/${meetingId}/${takeId}/${userId}/${fileName}`,
          {
            method: "POST",
            body: formData,
          },
        );
        if (!res.ok) {
          throw new Error(`Upload failed with status ${res.status}`);
        }
        const json = await res.json();
        const presignedUrl = json.presignedUrl;
        await fetch(presignedUrl, {
          method: "PUT",
          body: chunk,
          headers: {
            "Content-Type": type === "video" ? "video/webm" : "audio/webm",
          },
        });
        console.log(`Chunk ${index} uploaded successfully.`);

        return true;
      } catch (error) {
        console.warn(`Error uploading chunk ${task.index}:`, error);
      }
    }
    return false;
  }
  async function processQueue() {
    if (uploadingRef.current || chunkQueueRef.current.length === 0) return;
    uploadingRef.current = true;

    while (chunkQueueRef.current.length > 0) {
      const task = chunkQueueRef.current.shift();
      if (!task) continue;
      const success = await uploadChunk(task);
      if (!success) {
        console.warn(`Failed to upload chunk ${task.index} after retries.`);
      } else {
        uploadCounterRef.current++;
        // updateUI();
      }
    }
    uploadingRef.current = false;
    if (chunkQueueRef.current.length > 0) {
      // If there are still tasks left, process them again
      processQueue();
    }
  }
  const { mutateAsync } = createTake({
    meeting_id: roomId,
    params: {},
  });
  const startRecording = async () => {
    console.log("Starting recording...");

    // console.log(videoStream, audioStream);
    // if (!videoStream || !audioStream) {
    //   logger.error("No video or audio stream available for recording");
    //   return;
    // }
    console.log("Local stream:", localStream);
    try {
      if (!localStream) {
        logger.error("No local stream available for recording");
        return;
      }
      const videoStream = localStream.getVideoTracks().length
        ? new MediaStream([localStream.getVideoTracks()[0]])
        : null;
      const audioStream = localStream.getAudioTracks().length
        ? new MediaStream([localStream.getAudioTracks()[0]])
        : null;

      if (!videoStream) {
        return logger.error("No video track available for recording");
      }

      if (!audioStream) {
        return logger.error("No audio track available for recordings");
      }
      const videoRecorder = new MediaRecorder(videoStream, {
        mimeType: "video/webm; codecs=vp9",
      });

      const audioRecorder = new MediaRecorder(audioStream, {
        mimeType: "audio/webm; codecs=opus",
      });
      videoChunksRef.current = [];
      audioChunksRef.current = [];

      videoRecorder.start(5000); // chunk every 1s
      audioRecorder.start(5000);

      videoRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
          chunkQueueRef.current.push({
            chunk: event.data,
            type: "video",
            retries: 0,
            index: videoChunksRef.current.length - 1,
          });
          chunkCounterRef.current++;
          processQueue(); // Start processing the queue immediately
        }
      };
      audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          chunkQueueRef.current.push({
            chunk: event.data,
            type: "audio",
            retries: 0,
            index: audioChunksRef.current.length - 1,
          });
          chunkCounterRef.current++;
          processQueue(); // Start processing the queue immediately
        }
      };

      videoRecorderRef.current = videoRecorder;
      audioRecorderRef.current = audioRecorder;
      setRecordingStatus(true);
    } catch (error) {}
  };
  const stopRecording = () => {
    socket.emit("stop-recording", {
      roomId,
    });
    videoRecorderRef.current?.stop();
    audioRecorderRef.current?.stop();
    setRecordingStatus(false);
  };

  // Enhanced control functions with notifications
  const handleToggleMute = useCallback(async () => {
    const wasMuted = isMuted;
    await toggleMute();
  }, [toggleMute, isMuted]);

  const handleToggleCamera = useCallback(() => {
    const wasOn = isCameraOn;
    toggleCamera();
  }, [toggleCamera, isCameraOn]);

  const handleToggleScreenShare = useCallback(async () => {
    const wasSharing = isScreenSharing;
    try {
      await toggleScreenShare();
    } catch (error) {}
  }, [toggleScreenShare, isScreenSharing]);

  const handleEndCall = useCallback(() => {
    endCall();
    if (socket) {
      socket.emit(SOCKET_EVENTS.END_CALL, { roomId });
    }
    onLeaveRoom();
  }, [endCall, socket, roomId, onLeaveRoom]);

  const handleCopyRoomId = useCallback(() => {}, []);

  const toggleRecording = async () => {
    if (recordingStatus) {
      stopRecording();
    } else {
      if (!mutateAsync) return;

      const res = await mutateAsync({});
      const data = res?.data;
      takeNumber.current = data?.take || 0;
      socket.emit("start-recording", { roomId, takeId: takeNumber.current });
      startRecording();
    }
  };
  // Socket event handlers
  useEffect(() => {
    if (!socket || !roomId || hasJoinedRef.current) return;

    const handleUserJoined = (data: { users: string[] }) => {
      logger.log("User joined:", data);
      setConnectedUsers(data.users);
    };

    const handleUserLeft = (data: { userId: string }) => {
      logger.log("User left:", data);
      removeConnectedUser(data.userId);
    };

    const handleJoinError = (data: { error: string }) => {
      logger.error("Join error:", data.error);
      onLeaveRoom();
    };

    // Join room only once
    logger.log("Joining room:", roomId);
    socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId });
    hasJoinedRef.current = true;

    // Listen for room events
    socket.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
    socket.on(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
    socket.on(SOCKET_EVENTS.JOIN_ERROR, handleJoinError);
    socket.on("start-recording", () => {
      startRecording();
    });

    return () => {
      logger.log("Cleaning up socket listeners and leaving room:", roomId);
      socket.off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      socket.off(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
      socket.off(SOCKET_EVENTS.JOIN_ERROR, handleJoinError);

      // Leave the room on cleanup
      if (hasJoinedRef.current) {
        socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId });
        hasJoinedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (socket && hasJoinedRef.current && roomId) {
        logger.log("Component unmounting, leaving room:", roomId);
        socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId });
      }
    };
  }, [socket, roomId]);

  // Start call when socket is connected
  useEffect(() => {
    if (socket && isConnected) {
      logger.log("Starting call - socket connected");
      startCall().catch((error) => {
        logger.error("Failed to start call:", error);
      });
    }
  }, [socket, isConnected, startCall]);

  return (
    <>
      <div className="bg-background relative flex h-screen flex-col overflow-hidden">
        {/* Header with glassmorphism effect */}
        <div className="bg-background relative z-10 border-b border-gray-700">
          <CallHeader
            roomId={roomId}
            isConnected={isConnected}
            isCallActive={isCallActive}
            onShowRoomInfo={() => setShowRoomInfo(true)}
          />
        </div>

        {/* Main Video Area */}
        <div className="relative z-10 flex-1 overflow-hidden">
          {/* Determine main video source - prioritize screen sharing */}
          {isRemoteScreenSharing || isScreenSharing ? (
            /* Screen sharing mode - large main video */
            <div className="flex h-full flex-col">
              {/* Main screen share area */}
              <div className="flex flex-1 items-center justify-center bg-black/50 p-6">
                <div className="h-full max-h-full w-full max-w-7xl overflow-hidden rounded-2xl border border-gray-700 bg-black shadow-xl">
                  <VideoStream
                    key={
                      isRemoteScreenSharing ? "remote-screen" : "local-screen"
                    }
                    stream={isRemoteScreenSharing ? remoteStream : localStream}
                    isLocal={!isRemoteScreenSharing}
                    isCameraOn={
                      isRemoteScreenSharing ? isRemoteCameraOn : isCameraOn
                    }
                    isScreenSharing={
                      isRemoteScreenSharing
                        ? isRemoteScreenSharing
                        : isScreenSharing
                    }
                    title={
                      isRemoteScreenSharing ? "Remote Screen" : "Your Screen"
                    }
                    className="h-full w-full"
                  />
                </div>
              </div>

              {/* Participant thumbnails at bottom-right with glassmorphism */}
              <div className="absolute right-6 bottom-24 flex space-x-3">
                {/* Local thumbnail when remote is sharing */}
                {isRemoteScreenSharing && (
                  <div className="bg-cardborder-2 h-40 w-56 overflow-hidden rounded-xl border-gray-600 shadow-lg transition-all duration-300 hover:border-gray-500">
                    <VideoStream
                      key="local-thumbnail"
                      stream={localStream}
                      isLocal={true}
                      isCameraOn={isCameraOn}
                      isScreenSharing={isScreenSharing}
                      title="You"
                      className="h-full w-full"
                    />
                  </div>
                )}

                {/* Remote thumbnail when local is sharing */}
                {isScreenSharing && !isRemoteScreenSharing && remoteStream && (
                  <div className="bg-card h-40 w-56 overflow-hidden rounded-xl border-2 border-gray-600 shadow-lg transition-all duration-300 hover:border-gray-500">
                    <VideoStream
                      key="remote-thumbnail"
                      stream={remoteStream}
                      isLocal={false}
                      isCameraOn={isRemoteCameraOn}
                      isScreenSharing={isRemoteScreenSharing}
                      title="Remote"
                      className="h-full w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Normal video call mode - enhanced gallery view */
            <div className="h-full p-8">
              {remoteStream ? (
                /* Two participants - side by side horizontal rectangles like the image */
                <div className="mx-auto flex h-full max-w-6xl justify-center gap-4">
                  {/* Remote Video - Horizontal rectangle */}
                  <div className="bg-card relative aspect-[16/9] max-h-[650px] w-full overflow-hidden rounded-2xl border-2 border-gray-700 shadow-xl">
                    <VideoStream
                      key="remote-main"
                      stream={remoteStream}
                      isLocal={false}
                      isCameraOn={isRemoteCameraOn}
                      isScreenSharing={isRemoteScreenSharing}
                      title="Remote Participant"
                      roomId={roomId}
                      onCopyRoomId={handleCopyRoomId}
                      className="h-full w-full"
                    />
                  </div>

                  {/* Local Video */}
                  <div className="bg-card relative aspect-[16/19] max-h-[650px] w-full overflow-hidden rounded-2xl border-2 border-gray-700 shadow-xl">
                    <VideoStream
                      key="local-main"
                      stream={localStream}
                      isLocal={true}
                      isMuted={isMuted}
                      isCameraOn={isCameraOn}
                      isScreenSharing={isScreenSharing}
                      title="You"
                      className="h-full w-full"
                    />
                  </div>
                </div>
              ) : (
                /* Solo mode - same layout style as two participants */
                <div className="mx-auto flex h-full max-w-6xl justify-center gap-4">
                  {/* Local Video - Same styling as normal mode */}
                  <div className="bg-card border-border relative aspect-[16/9] max-h-[650px] w-full overflow-hidden rounded-2xl border-2 shadow-xl">
                    <VideoStream
                      key="local-solo"
                      stream={localStream}
                      isLocal={true}
                      isMuted={isMuted}
                      isCameraOn={isCameraOn}
                      isScreenSharing={isScreenSharing}
                      title="You"
                      className="h-full w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Bottom Controls Bar */}
        <div className="absolute right-0 bottom-0 left-0 z-20 bg-gradient-to-t from-black/90 to-transparent">
          <div className="px-8 py-12">
            <div className="flex justify-center">
              <div className="relative">
                <MediaControls
                  recordingStatus={recordingStatus}
                  toggleRecording={toggleRecording}
                  isMuted={isMuted}
                  isCameraOn={isCameraOn}
                  isScreenSharing={isScreenSharing}
                  onToggleMute={handleToggleMute}
                  onToggleCamera={handleToggleCamera}
                  onToggleScreenShare={handleToggleScreenShare}
                  onEndCall={handleEndCall}
                />
                {/* Subtle glow effect behind controls */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Info Modal */}
      <RoomInfoModal
        isOpen={showRoomInfo}
        onClose={() => setShowRoomInfo(false)}
        roomId={roomId}
        connectedUsers={connectedUsers}
        currentUserId={userId}
        onCopyRoomId={handleCopyRoomId}
      />

      {/* Debug Overlay - only in development */}
      <DebugOverlay
        localStream={localStream}
        remoteStream={remoteStream}
        isCallActive={isCallActive}
        isCameraOn={isCameraOn}
        isMuted={isMuted}
        isRemoteCameraOn={isRemoteCameraOn}
        socket={socket}
        roomId={roomId}
      />
    </>
  );
};

export default VideoCall;
