import useMeetingStore from "@/store/store";
import React, { useEffect } from "react";

export default function Lobby({meetingSlug}: {meetingSlug: string}) {
  const [cameras, setCameras] = React.useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = React.useState<MediaDeviceInfo[]>([]);

  const [cameraStream, setCameraStream] = React.useState<MediaStream | null>(
    null,
  );
  const [microphoneStream, setMicrophoneStream] =
    React.useState<MediaStream | null>(null);

  const {
    cameraId,
    setCameraId,
    isCameraEnabled,
    setIsCameraEnabled,
    isMicrophoneEnabled,
    setIsMicrophoneEnabled,
    microphoneId,
    setMicrophoneId,
  } = useMeetingStore();

  const videoRef = React.useRef<HTMLVideoElement>(null);

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

  const getMicrophoneStream = async (deviceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });
      setMicrophoneStream(stream);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
  };

  const stopMicrophone = () => {
    microphoneStream?.getTracks().forEach((track) => track.stop());
    setMicrophoneStream(null);
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

  useEffect(() => {
    if (isCameraEnabled && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isCameraEnabled]);

  useEffect(() => {
    if (cameraId && isCameraEnabled) {
      getCameraStream(cameraId);
    }
  }, [cameraId]);

  useEffect(() => {
    if (microphoneId && isMicrophoneEnabled) {
      getMicrophoneStream(microphoneId);
    }
  }, [microphoneId]);

  useEffect(() => {
    getDevices();
  }, []);

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] w-full max-w-5xl items-center justify-center gap-10 p-4">
      {/* VIDEO BOX */}
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black">
        {isCameraEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-xl font-semibold text-white">Camera is Off</div>
        )}
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-4">
          <button
            onClick={toggleCamera}
            className="rounded bg-gray-700 px-3 py-1 text-white hover:bg-gray-600"
          >
            {isCameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
          </button>
          <button
            onClick={toggleMicrophone}
            className="rounded bg-gray-700 px-3 py-1 text-white hover:bg-gray-600"
          >
            {isMicrophoneEnabled ? "Turn Off Mic" : "Turn On Mic"}
          </button>
        </div>
      </div>

      {/* SETTINGS */}
      <div className="w-80">
        <p className="text-2xl font-semibold">Settings</p>
        <label className="mt-4 block">
          Camera:
          <select
            value={cameraId}
            onChange={(e) => setCameraId(e.target.value)}
            className="mt-1 block w-full rounded border p-2"
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block">
          Microphone:
          <select
            value={microphoneId}
            onChange={(e) => setMicrophoneId(e.target.value)}
            className="mt-1 block w-full rounded border p-2"
          >
            {microphones.map((mic) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || `Mic ${microphones.indexOf(mic) + 1}`}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            useMeetingStore.getState().setIsJoined(true);
            useMeetingStore.getState().setMeetingId(meetingSlug);
          }}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
}
