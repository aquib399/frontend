import { useState, useRef, useCallback, useEffect } from 'react';
import { UseWebRTCReturn, MediaState } from '@/types';
import { WebRTCManager } from '@/utils/WebRTCManager';
import { SOCKET_EVENTS, ERROR_MESSAGES } from '@/constants';
import { createLogger, getErrorMessage } from '@/utils/logger';

const logger = createLogger('useWebRTC');

interface WebRTCConfig {
  videoDeviceId?: string;
  audioDeviceId?: string;
  initialVideoEnabled?: boolean;
  initialAudioEnabled?: boolean;
}

export const useWebRTC = (socket: any, roomId: string, config?: WebRTCConfig): UseWebRTCReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(!(config?.initialAudioEnabled ?? true));
  const [isCameraOn, setIsCameraOn] = useState(config?.initialVideoEnabled ?? true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteCameraOn, setIsRemoteCameraOn] = useState(true);
  const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);

  const webrtcManager = useRef<WebRTCManager | null>(null);
  const callStarted = useRef(false);

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
    if (constraints.video && typeof constraints.video === 'object') {
      constraints.video = {
        ...constraints.video,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      };
    }
    
    // Add quality constraints for audio
    if (constraints.audio && typeof constraints.audio === 'object') {
      constraints.audio = {
        ...constraints.audio,
        echoCancellation: true,
        noiseSuppression: true,
      };
    }
    
    return constraints;
  }, [config]);

  // Initialize WebRTC manager
  useEffect(() => {
    if (!socket) return;

    logger.log('Initializing WebRTC manager');
    webrtcManager.current = new WebRTCManager();

    const manager = webrtcManager.current;

    // Setup event handlers
    manager.onLocalStream = (stream) => {
      logger.log('Setting new local stream:', {
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
      if (state === 'connected') {
        setIsCallActive(true);
      } else if (state === 'disconnected' || state === 'failed') {
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

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit; fromUserId: string }) => {
      try {
        logger.log('Received offer from:', data.fromUserId);
        
        // Ensure we have a WebRTC manager that's not destroyed
        if (!webrtcManager.current || !webrtcManager.current.isInitialized()) {
          logger.log('WebRTC manager not ready, reinitializing...');
          return;
        }
        
        // Ensure we have a local stream before proceeding
        if (!localStream && webrtcManager.current) {
          logger.log('No local stream, getting media before handling offer');
          const constraints = buildMediaConstraints();
          const stream = await webrtcManager.current.getUserMedia(constraints);
          
          // Apply config settings to the stream
          if (config) {
            stream.getVideoTracks().forEach(track => {
              track.enabled = config.initialVideoEnabled ?? true;
            });
            stream.getAudioTracks().forEach(track => {
              track.enabled = config.initialAudioEnabled ?? true;
            });
          }
          
          await webrtcManager.current.startCall(stream);
        }

        const answer = await webrtcManager.current.handleOffer(data.offer);
        
        socket.emit(SOCKET_EVENTS.ANSWER, {
          roomId,
          answer,
          targetUserId: data.fromUserId
        });

        logger.log('Sent answer to:', data.fromUserId);
      } catch (error) {
        logger.error('Error handling offer:', error);
      }
    };

    const handleAnswer = async (data: { answer: RTCSessionDescriptionInit; fromUserId: string }) => {
      try {
        logger.log('Received answer from:', data.fromUserId);
        if (webrtcManager.current && webrtcManager.current.isInitialized()) {
          await webrtcManager.current.handleAnswer(data.answer);
        } else {
          logger.error('WebRTC manager not available when handling answer');
        }
      } catch (error) {
        logger.error('Error handling answer:', error);
      }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit; fromUserId: string }) => {
      try {
        if (webrtcManager.current && webrtcManager.current.isInitialized()) {
          await webrtcManager.current.addIceCandidate(data.candidate, data.fromUserId);
        }
      } catch (error) {
        logger.error('Error handling ICE candidate:', error);
      }
    };

    const handleUserJoined = async (data: { users: string[]; userId: string }) => {
      logger.log('User joined event:', data);
      
      // If this is the second user joining and we're not the new user
      if (data.users.length === 2 && data.userId !== socket.id && webrtcManager.current && webrtcManager.current.isInitialized()) {
        try {
          logger.log('Creating offer for new user:', data.userId);
          const offer = await webrtcManager.current.createOffer();
          socket.emit(SOCKET_EVENTS.OFFER, { roomId, offer, targetUserId: data.userId });
          
          // Send our current media state to the new user
          if (localStream) {
            const mediaState = webrtcManager.current.getMediaState();
            logger.log('Sending initial media state to new user:', mediaState);
            socket.emit(SOCKET_EVENTS.MEDIA_STATE_CHANGE, {
              roomId,
              mediaState,
              targetUserId: data.userId
            });
          }
        } catch (error) {
          logger.error('Error creating offer:', error);
        }
      }
      
      // If we're the new user joining, request media state from existing users
      if (data.userId === socket.id && data.users.length === 2) {
        logger.log('We joined as second user, requesting media states');
        socket.emit(SOCKET_EVENTS.REQUEST_MEDIA_STATE, { roomId });
      }
    };

    const handleMediaStateChange = (data: { mediaState: MediaState; userId: string }) => {
      logger.log('Received media state change:', data);
      if (socket.id !== data.userId) {
        logger.log('Updating remote media state:', {
          video: data.mediaState.video,
          audio: data.mediaState.audio,
          screenSharing: data.mediaState.screenSharing
        });
        setIsRemoteCameraOn(data.mediaState.video);
        setIsRemoteScreenSharing(data.mediaState.screenSharing);
      } else {
        logger.log('Ignoring media state change from self');
      }
    };

    const handleCallEnded = () => {
      setRemoteStream(null);
      setIsCallActive(false);
    };

    const handleMediaStateRequest = () => {
      if (localStream && webrtcManager.current && webrtcManager.current.isInitialized()) {
        const mediaState = webrtcManager.current.getMediaState();
        logger.log('Responding to media state request with:', mediaState);
        socket.emit(SOCKET_EVENTS.MEDIA_STATE_RESPONSE, {
          roomId,
          mediaState,
        });
      }
    };

    const handleMediaStateResponse = (data: { mediaState: MediaState; userId: string }) => {
      logger.log('Received media state response:', data);
      if (socket.id !== data.userId) {
        setIsRemoteCameraOn(data.mediaState.video);
        setIsRemoteScreenSharing(data.mediaState.screenSharing);
      }
    };

    // Register event listeners
    socket.on(SOCKET_EVENTS.OFFER, handleOffer);
    socket.on(SOCKET_EVENTS.ANSWER, handleAnswer);
    socket.on(SOCKET_EVENTS.ICE_CANDIDATE, handleIceCandidate);
    socket.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
    socket.on(SOCKET_EVENTS.MEDIA_STATE_CHANGE, handleMediaStateChange);
    socket.on(SOCKET_EVENTS.REQUEST_MEDIA_STATE, handleMediaStateRequest);
    socket.on(SOCKET_EVENTS.MEDIA_STATE_RESPONSE, handleMediaStateResponse);
    socket.on(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);

    return () => {
      socket.off(SOCKET_EVENTS.OFFER, handleOffer);
      socket.off(SOCKET_EVENTS.ANSWER, handleAnswer);
      socket.off(SOCKET_EVENTS.ICE_CANDIDATE, handleIceCandidate);
      socket.off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      socket.off(SOCKET_EVENTS.MEDIA_STATE_CHANGE, handleMediaStateChange);
      socket.off(SOCKET_EVENTS.REQUEST_MEDIA_STATE, handleMediaStateRequest);
      socket.off(SOCKET_EVENTS.MEDIA_STATE_RESPONSE, handleMediaStateResponse);
      socket.off(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);
    };
  }, [socket, roomId, localStream, buildMediaConstraints, config]);

  const startCall = useCallback(async () => {
    if (!webrtcManager.current || callStarted.current) return;

    try {
      logger.log('Starting call with config:', config);
      const constraints = buildMediaConstraints();
      const stream = await webrtcManager.current.getUserMedia(constraints);
      
      // Apply initial enabled states from config
      if (config) {
        stream.getVideoTracks().forEach(track => {
          track.enabled = config.initialVideoEnabled ?? true;
        });
        stream.getAudioTracks().forEach(track => {
          track.enabled = config.initialAudioEnabled ?? true;
        });
        
        // Update local states to match config
        setIsCameraOn(config.initialVideoEnabled ?? true);
        setIsMuted(!(config.initialAudioEnabled ?? true));
      }
      
      await webrtcManager.current.startCall(stream);
      callStarted.current = true;

      // Send initial media state after stream is ready
      if (socket && roomId) {
        const mediaState = webrtcManager.current.getMediaState();
        logger.log('Broadcasting initial media state:', mediaState);
        socket.emit(SOCKET_EVENTS.MEDIA_STATE_CHANGE, {
          roomId,
          mediaState,
        });
      }
    } catch (error) {
      logger.error('Error starting call:', error);
      throw new Error(getErrorMessage(error));
    }
  }, [buildMediaConstraints, config, socket, roomId]);

  const endCall = useCallback(() => {
    logger.log('Ending call...');
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
      logger.log('Toggling microphone, current state:', isMuted);
      const isAudioEnabled = webrtcManager.current.toggleTrack('audio');
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
      logger.error('Error toggling audio:', error);
    }
  }, [socket, roomId, isMuted]);

  const toggleCamera = useCallback(async () => {
    if (!webrtcManager.current) return;

    logger.log('Toggling camera, current state:', isCameraOn);
    const isVideoEnabled = webrtcManager.current.toggleTrack('video');
    setIsCameraOn(isVideoEnabled);

    // Notify peers about media state change
    if (socket) {
      const mediaState = webrtcManager.current.getMediaState();
      logger.log('Sending media state change:', mediaState);
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
          await webrtcManager.current.replaceTrack(screenVideoTrack, 'video');
          setLocalStream(screenStream);
          setIsScreenSharing(true);
          
          // Handle screen share end
          screenVideoTrack.onended = async () => {
            try {
              const originalStream = webrtcManager.current?.getOriginalStream();
              if (originalStream) {
                const cameraVideoTrack = originalStream.getVideoTracks()[0];
                if (cameraVideoTrack) {
                  await webrtcManager.current?.replaceTrack(cameraVideoTrack, 'video');
                  setLocalStream(originalStream);
                }
              }
              setIsScreenSharing(false);
            } catch (error) {
              logger.error('Error reverting from screen share:', error);
            }
          };
        }
      } else {
        // Stop screen sharing
        const originalStream = webrtcManager.current.getOriginalStream();
        if (originalStream) {
          const cameraVideoTrack = originalStream.getVideoTracks()[0];
          if (cameraVideoTrack) {
            await webrtcManager.current.replaceTrack(cameraVideoTrack, 'video');
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
      logger.error('Error toggling screen share:', error);
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