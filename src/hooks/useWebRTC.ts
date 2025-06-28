import { useState, useRef, useCallback, useEffect } from "react";
import { UseWebRTCReturn, MediaState } from "@/types/index";
import { WebRTCManager } from "@/utils/WebRTCManager";
import { SOCKET_EVENTS, ERROR_MESSAGES } from "@/constants/index";
import { createLogger, getErrorMessage } from "@/utils/logger";

const logger = createLogger("useWebRTC");

interface WebRTCConfig {
  videoDeviceId?: string;
  audioDeviceId?: string;
  initialVideoEnabled?: boolean;
  initialAudioEnabled?: boolean;
}

export const useWebRTC = (
  socket: any,
  roomId: string,
  config?: WebRTCConfig,
): UseWebRTCReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(
    !(config?.initialAudioEnabled ?? true),
  );
  const [isCameraOn, setIsCameraOn] = useState(
    config?.initialVideoEnabled ?? true,
  );
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteCameraOn, setIsRemoteCameraOn] = useState(true);
  const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);

  const webrtcManager = useRef<WebRTCManager | null>(null);
  const callStarted = useRef(false);

  // Initialize WebRTC manager
  useEffect(() => {
    if (!socket) return;

    logger.log("Initializing WebRTC manager");
    webrtcManager.current = new WebRTCManager();

    const manager = webrtcManager.current;

    // Setup event handlers
    manager.onLocalStream = (stream) => {
      logger.log("Setting new local stream:", {
        streamId: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
      });
      setLocalStream(stream);
    };

    manager.onRemoteStream = (stream) => {
      setRemoteStream(stream);
    };

    manager.onConnectionStateChange = (state) => {
      if (state === "connected") {
        setIsCallActive(true);
      } else if (state === "disconnected" || state === "failed") {
        setIsCallActive(false);
      }
    };

    manager.onIceCandidate = (candidate) => {
      socket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
        roomId,
        candidate,
      });
    };

    manager.onRemoteCameraStateChange = (isOn) => {
      setIsRemoteCameraOn(isOn);
    };

    return () => {
      manager.destroy();
    };
  }, [socket, roomId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !webrtcManager.current) return;

    const manager = webrtcManager.current;

    const handleOffer = async (data: {
      offer: RTCSessionDescriptionInit;
      fromUserId: string;
    }) => {
      try {
        logger.log("Received offer from:", data.fromUserId);

        // Ensure we have a local stream
        if (!localStream) {
          const constraints = buildMediaConstraints();
          const stream = await manager.getUserMedia(constraints);
          await manager.startCall(stream);
        }

        const answer = await manager.handleOffer(data.offer);

        socket.emit(SOCKET_EVENTS.ANSWER, {
          roomId,
          answer,
          targetUserId: data.fromUserId,
        });
      } catch (error) {
        logger.error("Error handling offer:", error);
      }
    };

    const handleAnswer = async (data: {
      answer: RTCSessionDescriptionInit;
      fromUserId: string;
    }) => {
      try {
        logger.log("Received answer from:", data.fromUserId);
        await manager.handleAnswer(data.answer);
      } catch (error) {
        logger.error("Error handling answer:", error);
      }
    };

    const handleIceCandidate = async (data: {
      candidate: RTCIceCandidateInit;
      fromUserId: string;
    }) => {
      try {
        await manager.addIceCandidate(data.candidate, data.fromUserId);
      } catch (error) {
        logger.error("Error handling ICE candidate:", error);
      }
    };

    const handleUserJoined = async (data: {
      users: string[];
      userId: string;
    }) => {
      if (
        data.users.length === 2 &&
        data.userId !== socket.id &&
        manager.isInitialized()
      ) {
        try {
          const offer = await manager.createOffer();
          socket.emit(SOCKET_EVENTS.OFFER, { roomId, offer });
        } catch (error) {
          logger.error("Error creating offer:", error);
        }
      }
    };

    const handleMediaStateChange = (data: {
      mediaState: MediaState;
      userId: string;
    }) => {
      logger.log("Received media state change:", data);
      if (socket.id !== data.userId) {
        logger.log("Updating remote media state:", {
          video: data.mediaState.video,
          audio: data.mediaState.audio,
          screenSharing: data.mediaState.screenSharing,
        });
        setIsRemoteCameraOn(data.mediaState.video);
        setIsRemoteScreenSharing(data.mediaState.screenSharing);
      } else {
        logger.log("Ignoring media state change from self");
      }
    };

    const handleCallEnded = () => {
      setRemoteStream(null);
      setIsCallActive(false);
    };

    // Register event listeners
    socket.on(SOCKET_EVENTS.OFFER, handleOffer);
    socket.on(SOCKET_EVENTS.ANSWER, handleAnswer);
    socket.on(SOCKET_EVENTS.ICE_CANDIDATE, handleIceCandidate);
    socket.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
    socket.on(SOCKET_EVENTS.MEDIA_STATE_CHANGE, handleMediaStateChange);
    socket.on(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);

    return () => {
      socket.off(SOCKET_EVENTS.OFFER, handleOffer);
      socket.off(SOCKET_EVENTS.ANSWER, handleAnswer);
      socket.off(SOCKET_EVENTS.ICE_CANDIDATE, handleIceCandidate);
      socket.off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      socket.off(SOCKET_EVENTS.MEDIA_STATE_CHANGE, handleMediaStateChange);
      socket.off(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);
    };
  }, [socket, roomId, localStream]);

  // Helper function to build media constraints from config
  const buildMediaConstraints = useCallback(() => {
    // Always request both video and audio tracks to ensure they exist for toggling
    const constraints: any = {
      video: config?.videoDeviceId
        ? { deviceId: { exact: config.videoDeviceId } }
        : true,
      audio: config?.audioDeviceId
        ? { deviceId: { exact: config.audioDeviceId } }
        : true,
    };

    // Add quality constraints for video
    if (constraints.video && typeof constraints.video === "object") {
      constraints.video = {
        ...constraints.video,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      };
    }

    // Add quality constraints for audio
    if (constraints.audio && typeof constraints.audio === "object") {
      constraints.audio = {
        ...constraints.audio,
        echoCancellation: true,
        noiseSuppression: true,
      };
    }

    return constraints;
  }, [config]);

  const startCall = useCallback(async () => {
    if (!webrtcManager.current || callStarted.current) return;

    try {
      logger.log("Starting call with config:", config);
      const constraints = buildMediaConstraints();
      const stream = await webrtcManager.current.getUserMedia(constraints);

      // Apply initial enabled states from config
      if (config) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = config.initialVideoEnabled ?? true;
        });
        stream.getAudioTracks().forEach((track) => {
          track.enabled = config.initialAudioEnabled ?? true;
        });

        // Update local states to match config
        setIsCameraOn(config.initialVideoEnabled ?? true);
        setIsMuted(!(config.initialAudioEnabled ?? true));
      }

      await webrtcManager.current.startCall(stream);
      callStarted.current = true;
    } catch (error) {
      logger.error("Error starting call:", error);
      throw new Error(getErrorMessage(error));
    }
  }, [buildMediaConstraints, config]);

  const endCall = useCallback(() => {
    logger.log("Ending call...");
    webrtcManager.current?.destroy();
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setIsScreenSharing(false);
    setIsMuted(false);
    setIsCameraOn(true);
    callStarted.current = false;
  }, []);

  const toggleMute = useCallback(async () => {
    if (!webrtcManager.current) return;

    try {
      logger.log("Toggling microphone, current state:", isMuted);
      const isAudioEnabled = webrtcManager.current.toggleTrack("audio");
      setIsMuted(!isAudioEnabled);

      // Notify peers about media state change
      if (socket) {
        const mediaState = webrtcManager.current.getMediaState();
        socket.emit(SOCKET_EVENTS.MEDIA_STATE_CHANGE, {
          roomId,
          mediaState,
        });
      }
    } catch (error) {
      logger.error("Error toggling audio:", error);
    }
  }, [socket, roomId, isMuted]);

  const toggleCamera = useCallback(async () => {
    if (!webrtcManager.current) return;

    logger.log("Toggling camera, current state:", isCameraOn);
    const isVideoEnabled = webrtcManager.current.toggleTrack("video");
    setIsCameraOn(isVideoEnabled);

    // Notify peers about media state change
    if (socket) {
      const mediaState = webrtcManager.current.getMediaState();
      logger.log("Sending media state change:", mediaState);
      socket.emit(SOCKET_EVENTS.MEDIA_STATE_CHANGE, {
        roomId,
        mediaState,
      });
    }
  }, [socket, roomId, isCameraOn]);

  const toggleScreenShare = useCallback(async () => {
    if (!webrtcManager.current) return;

    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await webrtcManager.current.getDisplayMedia();
        const screenVideoTrack = screenStream.getVideoTracks()[0];

        if (screenVideoTrack) {
          await webrtcManager.current.replaceTrack(screenVideoTrack, "video");
          setLocalStream(screenStream);
          setIsScreenSharing(true);

          // Handle screen share end
          screenVideoTrack.onended = async () => {
            try {
              const originalStream = webrtcManager.current?.getOriginalStream();
              if (originalStream) {
                const cameraVideoTrack = originalStream.getVideoTracks()[0];
                if (cameraVideoTrack) {
                  await webrtcManager.current?.replaceTrack(
                    cameraVideoTrack,
                    "video",
                  );
                  setLocalStream(originalStream);
                }
              }
              setIsScreenSharing(false);
            } catch (error) {
              logger.error("Error reverting from screen share:", error);
            }
          };
        }
      } else {
        // Stop screen sharing
        const originalStream = webrtcManager.current.getOriginalStream();
        if (originalStream) {
          const cameraVideoTrack = originalStream.getVideoTracks()[0];
          if (cameraVideoTrack) {
            await webrtcManager.current.replaceTrack(cameraVideoTrack, "video");
            setLocalStream(originalStream);
          }
        }
        setIsScreenSharing(false);
      }

      // Notify peers about screen sharing state
      if (socket) {
        const mediaState = webrtcManager.current.getMediaState();
        socket.emit(SOCKET_EVENTS.MEDIA_STATE_CHANGE, {
          roomId,
          mediaState,
        });
      }
    } catch (error) {
      logger.error("Error toggling screen share:", error);
      throw new Error(ERROR_MESSAGES.SCREEN_SHARE_FAILED);
    }
  }, [isScreenSharing, socket, roomId]);

  return {
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
  };
};
