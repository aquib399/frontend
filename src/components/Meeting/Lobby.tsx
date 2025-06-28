import { useEffect, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import useMeetingStore from "@/store/store";

export default function Lobby() {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const { setCameraId, setMicrophoneId, cameraId, microphoneId, setIsJoined } =
    useMeetingStore();
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const getCameraStream = async (deviceId: string) => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      setPreviewStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setPreviewStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };
  const stopCameraStream = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
      setPreviewStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const startCamera = async () => {
    if (cameraId) {
      await getCameraStream(cameraId);
    }
  };
  useEffect(() => {
    if (cameraId) {
      getCameraStream(cameraId);
    }
  }, [cameraId]);
  const getMediaDevices = async () => {
    await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter((device) => device.kind === "videoinput");
    const mics = devices.filter((device) => device.kind === "audioinput");
    setCameras(cams);
    setMicrophones(mics);
    if (cams.length > 0) {
      setCameraId(cams[0].deviceId);
    }
    if (mics.length > 0) {
      setMicrophoneId(mics[0].deviceId);
    }
  };
  console.log(cameraId);
  console.log(microphoneId);

  useEffect(() => {
    getMediaDevices();
  }, []);
  return (
    <div className="grid h-[calc(100dvh-80px)] w-full grid-cols-2 items-center justify-center">
      <div className="relative">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className="h-full w-full -scale-x-100 object-cover"
          id="localVideo"
        ></video>
        {previewStream ? (
          <button
            className="absolute top-2 right-2 rounded bg-red-500 px-4 py-2 text-white"
            onClick={stopCameraStream}
          >
            Stop Camera
          </button>
        ) : (
          <button
            className="absolute top-2 right-2 rounded bg-green-500 px-4 py-2 text-white"
            onClick={startCamera}
          >
            Start Camera
          </button>
        )}
      </div>
      <div>
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">Meeting Lobby</h1>
          <div className="space-y-2">
            <Label htmlFor="camera">Select Camera:</Label>
            <select
              id="camera"
              value={cameraId}
              onChange={(e) => setCameraId(e.target.value)}
            >
              {cameras.map((cam) => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || "Camera " + cam.deviceId}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="microphone">Select Microphone:</label>
            <select
              id="microphone"
              value={microphoneId}
              onChange={(e) => setMicrophoneId(e.target.value)}
            >
              {microphones.map((mic) => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || "Microphone " + mic.deviceId}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setIsJoined(true);
              stopCameraStream();
            }}
            disabled={!cameraId || !microphoneId}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
}
