import { useState, useEffect, useCallback, useRef } from "react";

interface MediaDevice {
  deviceId: string;
  label: string;
}

interface MeetingConfig {
  cameraDeviceId: string;
  micDeviceId: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
}

export const useMeetingLobby = () => {
  const [cameras, setCameras] = useState<MediaDevice[]>([]);
  const [microphones, setMicrophones] = useState<MediaDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);

  const streamRef = useRef<MediaStream | null>(null);

  // Get available devices
  const getDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request permission to get device labels
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      tempStream.getTracks().forEach((track) => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();

      const videoDevices = devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
        }));

      const audioDevices = devices
        .filter((device) => device.kind === "audioinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
        }));

      setCameras(videoDevices);
      setMicrophones(audioDevices);

      // Set defaults to first available device
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
      if (audioDevices.length > 0) {
        setSelectedMicrophone(audioDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Failed to get devices:", err);
      setError(
        "Failed to access camera and microphone. Please check permissions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create preview stream with selected devices
  const updatePreview = useCallback(async () => {
    if (!selectedCamera || !selectedMicrophone) {
      return;
    }

    try {
      // Stop previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Always request both video and audio tracks, but control their enabled state
      const constraints = {
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: selectedMicrophone
          ? { deviceId: { exact: selectedMicrophone } }
          : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Set track enabled states based on current toggle states
      stream.getVideoTracks().forEach((track) => {
        track.enabled = isCameraEnabled;
      });
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isMicEnabled;
      });

      streamRef.current = stream;
      setPreviewStream(stream);
      setError(null);
    } catch (err) {
      console.error("Failed to create preview:", err);
      setError("Failed to access selected devices.");
      setPreviewStream(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera, selectedMicrophone]);

  // Update preview when devices change (not when toggles change)
  useEffect(() => {
    if (selectedCamera && selectedMicrophone) {
      updatePreview();
    }
  }, [selectedCamera, selectedMicrophone, updatePreview]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    setIsCameraEnabled((prev) => {
      const newEnabled = !prev;
      // Update existing tracks immediately
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = newEnabled;
        });
      }
      return newEnabled;
    });
  }, []);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    setIsMicEnabled((prev) => {
      const newEnabled = !prev;
      // Update existing tracks immediately
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = newEnabled;
        });
      }
      return newEnabled;
    });
  }, []);

  // Initialize
  useEffect(() => {
    getDevices();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [getDevices]);

  // Get config for the meeting
  const getMeetingConfig = useCallback((): MeetingConfig => {
    return {
      cameraDeviceId: selectedCamera,
      micDeviceId: selectedMicrophone,
      cameraEnabled: isCameraEnabled,
      micEnabled: isMicEnabled,
    };
  }, [selectedCamera, selectedMicrophone, isCameraEnabled, isMicEnabled]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setPreviewStream(null);
    }
  }, []);

  // Apply toggle states when stream is updated
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isCameraEnabled;
      });
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMicEnabled;
      });
    }
  }, [previewStream, isCameraEnabled, isMicEnabled]);

  return {
    cameras,
    microphones,
    selectedCamera,
    selectedMicrophone,
    previewStream,
    isLoading,
    error,
    isCameraEnabled,
    isMicEnabled,
    setSelectedCamera,
    setSelectedMicrophone,
    toggleCamera,
    toggleMic,
    getMeetingConfig,
    cleanup,
  };
};
