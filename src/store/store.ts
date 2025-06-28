import { create } from "zustand";
type MeetingStore = {
  cameraId: string;
  microphoneId: string;
  setCameraId: (id: string) => void;
  setMicrophoneId: (id: string) => void;
  isJoined: boolean;
  setIsJoined: (isJoined: boolean) => void;
  isHost: boolean;
  setIsHost: (isHost: boolean) => void;
  meetingId: string;
  setMeetingId: (meetingId: string) => void;
  isCameraEnabled: boolean;
  setIsCameraEnabled: (isCameraEnabled: boolean) => void;
  isMicrophoneEnabled: boolean;
  setIsMicrophoneEnabled: (isMicrophoneEnabled: boolean) => void;
};

const useMeetingStore = create<MeetingStore>((set) => ({
  cameraId: "",
  microphoneId: "",
  setCameraId: (id: string) => set({ cameraId: id }),
  setMicrophoneId: (id: string) => set({ microphoneId: id }),
  isJoined: false,
  setIsJoined: (isJoined: boolean) => set({ isJoined }),
  isHost: false,
  setIsHost: (isHost: boolean) => set({ isHost }),
  meetingId: "",
  setMeetingId: (meetingId: string) => set({ meetingId }),
  isCameraEnabled: true,
  setIsCameraEnabled: (isCameraEnabled: boolean) => set({ isCameraEnabled }),
  isMicrophoneEnabled: true,
  setIsMicrophoneEnabled: (isMicrophoneEnabled: boolean) => set({ isMicrophoneEnabled })
}));

export default useMeetingStore;
