import React, { useEffect, useState, useRef } from "react";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Settings,
  Video,
  Users,
  ChevronDown,
} from "lucide-react";
import useMeetingStore from "@/store/store";

export default function Lobby({ meetingSlug }: { meetingSlug: string }) {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [microphoneStream, setMicrophoneStream] = useState<MediaStream | null>(
    null,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<
    "excellent" | "good" | "poor"
  >("excellent");
  const [micLevel, setMicLevel] = useState(0);

  const {
    cameraId,
    setCameraId,
    isCameraEnabled,
    setIsCameraEnabled,
    isMicrophoneEnabled,
    setIsMicrophoneEnabled,
    microphoneId,
    setMicrophoneId,
    setIsJoined,
    setMeetingId,
  } = useMeetingStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const getDevices = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput",
      );
      setCameras(videoDevices);
      setMicrophones(audioDevices);
      if (videoDevices.length > 0 && !cameraId)
        setCameraId(videoDevices[0].deviceId);
      if (audioDevices.length > 0 && !microphoneId)
        setMicrophoneId(audioDevices[0].deviceId);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const getCameraStream = async (deviceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      setCameraStream(stream);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getMicrophoneStream = async (deviceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });
      setMicrophoneStream(stream);
      setupAudioAnalyser(stream);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const setupAudioAnalyser = (stream: MediaStream) => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      dataArrayRef.current = null;
    }
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    dataArrayRef.current = dataArray;

    const updateMicLevel = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const average =
          dataArrayRef.current.reduce((sum, val) => sum + val, 0) /
          dataArrayRef.current.length;
        setMicLevel(average / 100);
      }
      animationFrameRef.current = requestAnimationFrame(updateMicLevel);
    };
    updateMicLevel();
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
  };

  const stopMicrophone = () => {
    microphoneStream?.getTracks().forEach((track) => track.stop());
    setMicrophoneStream(null);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      dataArrayRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setMicLevel(0);
    }
  };

  const toggleCamera = () => {
    if (isCameraEnabled) {
      stopCamera();
    } else {
      getCameraStream(cameraId!);
    }
    setIsCameraEnabled(!isCameraEnabled);
  };

  const toggleMicrophone = () => {
    if (isMicrophoneEnabled) {
      stopMicrophone();
    } else {
      getMicrophoneStream(microphoneId!);
    }
    setIsMicrophoneEnabled(!isMicrophoneEnabled);
  };

  const joinMeeting = () => {
    setIsJoined(true);
    setMeetingId(meetingSlug);
  };

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-yellow-500";
      case "poor":
        return "text-red-500";
      default:
        return "text-green-500";
    }
  };

  useEffect(() => {
    if (isCameraEnabled && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isCameraEnabled]);

  useEffect(() => {
    if (cameraId && isCameraEnabled) {
      getCameraStream(cameraId);
    }
  }, [cameraId, isCameraEnabled]);

  useEffect(() => {
    if (microphoneId && isMicrophoneEnabled) {
      getMicrophoneStream(microphoneId);
    }
  }, [getMicrophoneStream, isMicrophoneEnabled, microphoneId]);

  useEffect(() => {
    getDevices();
    return () => {
      stopCamera();
      stopMicrophone();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="">
      <div className="mx-auto max-w-6xl p-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Meeting Lobby
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                ID: {meetingSlug}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className={`h-2 w-2 rounded-full ${getConnectionColor()}`} />
            <span className={getConnectionColor()}>{connectionQuality}</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative rounded-xl bg-slate-800 shadow-lg">
              {isCameraEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="aspect-video h-full w-full -scale-x-100 rounded-xl object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-slate-700 text-slate-400">
                  <CameraOff className="h-12 w-12" />
                  <p className="mt-2 text-sm">Camera is off</p>
                </div>
              )}
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/50 p-2">
                <button
                  onClick={toggleCamera}
                  className={`rounded-full p-2 ${isCameraEnabled ? "bg-blue-600" : "bg-red-600"} hover:opacity-90`}
                >
                  {isCameraEnabled ? (
                    <Camera className="h-5 w-5 text-white" />
                  ) : (
                    <CameraOff className="h-5 w-5 text-white" />
                  )}
                </button>
                <button
                  onClick={toggleMicrophone}
                  className={`rounded-full p-2 ${isMicrophoneEnabled ? "bg-blue-600" : "bg-red-600"} hover:opacity-90`}
                >
                  {isMicrophoneEnabled ? (
                    <Mic className="h-5 w-5 text-white" />
                  ) : (
                    <MicOff className="h-5 w-5 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="rounded-full bg-slate-600 p-2 hover:opacity-90"
                >
                  <Settings className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            <button
              onClick={joinMeeting}
              className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Join Meeting
            </button>
          </div>

          <div
            className={`${isSettingsOpen ? "block" : "hidden lg:block"} space-y-4`}
          >
            <div className="rounded-xl bg-white p-4 dark:bg-slate-800">
              <div className="mb-2 flex items-center gap-2">
                <Camera className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Camera
                </h3>
              </div>
              <select
                value={cameraId || ""}
                onChange={(e) => setCameraId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              >
                {cameras.map((camera, index) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl bg-white p-4 dark:bg-slate-800">
              <div className="mb-2 flex items-center gap-2">
                <Mic className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Microphone
                </h3>
              </div>
              <select
                value={microphoneId || ""}
                onChange={(e) => setMicrophoneId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              >
                {microphones.map((mic, index) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${index + 1}`}
                  </option>
                ))}
              </select>
              {isMicrophoneEnabled && (
                <div className="Immigration and Customs Enforcement mt-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Microphone level
                  </div>
                  <div className="h-2 max-w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-[50ms]"
                      style={{ width: `${micLevel * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
