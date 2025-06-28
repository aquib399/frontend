import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateId } from '@/utils';
import type { DeviceConfig } from '@/types';

export type AppView = 'join' | 'lobby' | 'call';

export interface LobbyConfig {
  cameraDeviceId: string;
  micDeviceId: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
}

export interface AppState {
  // View state
  currentView: AppView;
  
  // Room state
  currentRoom: string | null;
  isCreatingRoom: boolean;
  
  // User state
  userId: string;
  userName: string;
  
  // Lobby state
  lobbyConfig: LobbyConfig | null;
  
  // Call state
  isInCall: boolean;
  callStartTime: Date | null;
  
  // Connected users
  connectedUsers: string[];
}

export interface AppActions {
  // View actions
  setCurrentView: (view: AppView) => void;
  
  // Room actions
  joinRoom: (roomId: string, creating?: boolean) => void;
  leaveRoom: () => void;
  setCurrentRoom: (roomId: string | null) => void;
  setIsCreatingRoom: (creating: boolean) => void;
  
  // User actions
  setUserId: (userId: string) => void;
  setUserName: (userName: string) => void;
  
  // Lobby actions
  setLobbyConfig: (config: LobbyConfig) => void;
  joinMeeting: (config: LobbyConfig) => void;
  backToJoin: () => void;
  
  // Call actions
  startCall: () => void;
  endCall: () => void;
  setCallStartTime: (time: Date | null) => void;
  
  // Users actions
  setConnectedUsers: (users: string[]) => void;
  addConnectedUser: (userId: string) => void;
  removeConnectedUser: (userId: string) => void;
  
  // Utility actions
  reset: () => void;
  getDeviceConfig: () => DeviceConfig | null;
}

export type AppStore = AppState & AppActions;

const initialState: AppState = {
  currentView: 'join',
  currentRoom: null,
  isCreatingRoom: false,
  userId: generateId(),
  userName: '',
  lobbyConfig: null,
  isInCall: false,
  callStartTime: null,
  connectedUsers: [],
};

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // View actions
      setCurrentView: (view) => set({ currentView: view }, false, 'setCurrentView'),
      
      // Room actions
      joinRoom: (roomId, creating = false) => 
        set({ 
          currentRoom: roomId, 
          isCreatingRoom: creating, 
          currentView: 'lobby' 
        }, false, 'joinRoom'),
      
      leaveRoom: () => 
        set({ 
          currentRoom: null, 
          lobbyConfig: null, 
          isCreatingRoom: false, 
          currentView: 'join',
          isInCall: false,
          callStartTime: null,
          connectedUsers: []
        }, false, 'leaveRoom'),
      
      setCurrentRoom: (roomId) => set({ currentRoom: roomId }, false, 'setCurrentRoom'),
      
      setIsCreatingRoom: (creating) => set({ isCreatingRoom: creating }, false, 'setIsCreatingRoom'),
      
      // User actions
      setUserId: (userId) => set({ userId }, false, 'setUserId'),
      
      setUserName: (userName) => set({ userName }, false, 'setUserName'),
      
      // Lobby actions
      setLobbyConfig: (config) => set({ lobbyConfig: config }, false, 'setLobbyConfig'),
      
      joinMeeting: (config) => 
        set({ 
          lobbyConfig: config, 
          currentView: 'call',
          isInCall: true,
          callStartTime: new Date()
        }, false, 'joinMeeting'),
      
      backToJoin: () => 
        set({ 
          currentRoom: null, 
          isCreatingRoom: false, 
          currentView: 'join',
          lobbyConfig: null
        }, false, 'backToJoin'),
      
      // Call actions
      startCall: () => 
        set({ 
          isInCall: true, 
          callStartTime: new Date() 
        }, false, 'startCall'),
      
      endCall: () => 
        set({ 
          isInCall: false, 
          callStartTime: null,
          currentView: 'join',
          currentRoom: null,
          lobbyConfig: null,
          connectedUsers: []
        }, false, 'endCall'),
      
      setCallStartTime: (time) => set({ callStartTime: time }, false, 'setCallStartTime'),
      
      // Users actions
      setConnectedUsers: (users) => set({ connectedUsers: users }, false, 'setConnectedUsers'),
      
      addConnectedUser: (userId) => 
        set((state) => ({ 
          connectedUsers: [...state.connectedUsers.filter(id => id !== userId), userId] 
        }), false, 'addConnectedUser'),
      
      removeConnectedUser: (userId) => 
        set((state) => ({ 
          connectedUsers: state.connectedUsers.filter(id => id !== userId) 
        }), false, 'removeConnectedUser'),
      
      // Utility actions
      reset: () => set({ ...initialState, userId: generateId() }, false, 'reset'),
      
      getDeviceConfig: () => {
        const { lobbyConfig } = get();
        if (!lobbyConfig) return null;
        
        return {
          videoDeviceId: lobbyConfig.cameraDeviceId,
          audioDeviceId: lobbyConfig.micDeviceId,
          initialVideoEnabled: lobbyConfig.cameraEnabled,
          initialAudioEnabled: lobbyConfig.micEnabled,
        };
      }
    }),
    {
      name: 'hexafalls-app-store',
      version: 1,
    }
  )
);

// Selectors for better performance
export const useCurrentView = () => useAppStore(state => state.currentView);
export const useCurrentRoom = () => useAppStore(state => state.currentRoom);
export const useIsCreatingRoom = () => useAppStore(state => state.isCreatingRoom);
export const useUserId = () => useAppStore(state => state.userId);
export const useUserName = () => useAppStore(state => state.userName);
export const useLobbyConfig = () => useAppStore(state => state.lobbyConfig);
export const useIsInCall = () => useAppStore(state => state.isInCall);
export const useCallStartTime = () => useAppStore(state => state.callStartTime);
export const useConnectedUsers = () => useAppStore(state => state.connectedUsers);
