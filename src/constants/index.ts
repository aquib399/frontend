// Server configuration
export const SERVER_CONFIG = {
  SOCKET_URL: 'http://localhost:3001',
} as const;

// WebRTC configuration
export const WEBRTC_CONFIG = {
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  CONNECTION_TIMEOUT: 20000,
  RECONNECTION_DELAY: 1000,
  MAX_RECONNECTION_ATTEMPTS: 5,
} as const;

// Media constraints
export const MEDIA_CONSTRAINTS = {
  DEFAULT_VIDEO: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
  DEFAULT_AUDIO: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  SCREEN_SHARE: {
    video: true,
    audio: true,
  },
} as const;

// UI constants
export const UI_CONFIG = {
  NOTIFICATION_DURATION: 3000,
  ROOM_ID_DISPLAY_LENGTH: 8,
  MAX_ROOM_USERS: 2,
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_MUTE: 'm',
  TOGGLE_CAMERA: 'v',
  TOGGLE_SCREEN_SHARE: 's',
} as const;

// Socket events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ERROR: 'reconnect_error',
  
  // Room management
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  ROOM_CREATED: 'room-created',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  JOIN_ERROR: 'join-error',
  
  // WebRTC signaling
  OFFER: 'offer',
  ANSWER: 'answer',
  ICE_CANDIDATE: 'ice-candidate',
  
  // Media
  MEDIA_STATE_CHANGE: 'media-state-change',
  END_CALL: 'end-call',
  CALL_ENDED: 'call-ended',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  CAMERA_ACCESS_DENIED: 'Camera access denied. Please allow camera permissions and try again.',
  MICROPHONE_ACCESS_DENIED: 'Microphone access denied. Please allow microphone permissions and try again.',
  SCREEN_SHARE_FAILED: 'Failed to start screen sharing. Please try again.',
  CONNECTION_FAILED: 'Failed to connect to the server. Please check your internet connection.',
  ROOM_FULL: 'This room is full. Please try another room.',
  INVALID_ROOM_ID: 'Invalid room ID. Please check and try again.',
  MEDIA_DEVICES_NOT_SUPPORTED: 'Media devices are not supported in this browser.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ROOM_CREATED: 'Room created successfully!',
  JOINED_ROOM: 'Successfully joined the room!',
  CAMERA_ON: 'Camera turned on',
  CAMERA_OFF: 'Camera turned off',
  MICROPHONE_MUTED: 'Microphone muted',
  MICROPHONE_UNMUTED: 'Microphone unmuted',
  SCREEN_SHARE_STARTED: 'Screen sharing started',
  SCREEN_SHARE_STOPPED: 'Screen sharing stopped',
  ROOM_ID_COPIED: 'Room ID copied to clipboard!',
} as const;
