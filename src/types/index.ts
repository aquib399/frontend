// User types
export interface User {
  id: string;
  name?: string;
}

// Media and WebRTC types
export interface MediaState {
  audio: boolean;
  video: boolean;
  screenSharing: boolean;
}

export interface MediaConstraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

// Component prop types
export interface VideoCallProps {
  roomId: string;
  userId: string;
  onLeaveRoom: () => void;
  deviceConfig?: DeviceConfig;
}

// Device configuration
export interface DeviceConfig {
  videoDeviceId?: string;
  audioDeviceId?: string;
  initialVideoEnabled?: boolean;
  initialAudioEnabled?: boolean;
}

export interface RoomJoinProps {
  onJoinRoom: (roomId: string, isCreating?: boolean) => void;
  userId: string;
}
// Hook return types
export interface UseSocketReturn {
  socket: any; // Socket.IO type would be better but avoiding extra dependency
  isConnected: boolean;
}

export interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCallActive: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isRemoteCameraOn: boolean;
  isRemoteScreenSharing: boolean;
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
}

// Notification types
export interface NotificationOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationOptions['type'];
  duration: number;
}
