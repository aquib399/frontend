"use client";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import useMeetingStore from "@/store/store";
import { useSession } from "@/lib/auth-client";

interface RemoteUser {
  id: string;
  name: string;
  socketid: string;
}

export default function Room() {
  const { data } = useSession();
  const user = data?.user;
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);

  const localVideoStream = useRef<MediaStream | null>(null);
  const localAudioStream = useRef<MediaStream | null>(null);
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [remoteUser, setRemoteUser] = useState<RemoteUser | null>(null);
  const [connectionState, setConnectionState] = useState<string>("new");
  const makingOffer = useRef(false);
  const ignoreOffer = useRef(false);
  const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]);
  const isRemoteDescriptionSet = useRef(false);

  const {
    cameraId,
    isCameraEnabled,
    setIsCameraEnabled,
    microphoneId,
    isMicrophoneEnabled,
    setIsMicrophoneEnabled,
    meetingId,
    setIsJoined,
  } = useMeetingStore();

  // === Initialize Streams ===
  const initStreams = async () => {
    try {
      if (isCameraEnabled && cameraId) {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: cameraId } },
        });
        localVideoStream.current = videoStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = videoStream;
        }
      }

      if (isMicrophoneEnabled && microphoneId) {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: microphoneId } },
        });
        localAudioStream.current = audioStream;
      }
    } catch (error) {
      console.error("Error initializing streams:", error);
    }
  };

  // === Create Peer Connection ===
  const createPeer = (targetSocketId?: string) => {
    if (peerRef.current) {
      peerRef.current.close();
    }

    // Reset state flags
    isRemoteDescriptionSet.current = false;
    iceCandidatesQueue.current = [];

    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    peerRef.current = peer;

    // Add local tracks to peer connection
    if (localVideoStream.current) {
      localVideoStream.current.getTracks().forEach((track) =>
        peer.addTrack(track, localVideoStream.current!)
      );
    }

    if (localAudioStream.current) {
      localAudioStream.current.getTracks().forEach((track) =>
        peer.addTrack(track, localAudioStream.current!)
      );
    }

    // Handle remote stream
    peer.ontrack = (event) => {
      console.log("Received remote track");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      const socketId = targetSocketId || remoteSocketId;
      if (event.candidate && socketId) {
        console.log("Sending ICE candidate to:", socketId);
        socket.emit("ice-candidate", {
          to: socketId,
          from: socket.id,
          candidate: event.candidate,
        });
      } else if (event.candidate) {
        console.log("ICE candidate generated but no remote socket ID yet");
      }
    };

    // Handle negotiation needed
    peer.onnegotiationneeded = async () => {
      try {
        makingOffer.current = true;
        console.log("Negotiation needed - creating offer");
        const socketId = targetSocketId || remoteSocketId;
        if (!socketId) {
          console.error("No remote socket ID available for offer");
          return;
        }
        
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        console.log("Sending offer to:", socketId);
        socket.emit("offer", {
          to: socketId,
          from: socket.id,
          offer: peer.localDescription,
        });
      } catch (err) {
        console.error("Negotiation error:", err);
      } finally {
        makingOffer.current = false;
      }
    };

    // Connection state monitoring
    peer.onconnectionstatechange = () => {
      console.log("Connection state:", peer.connectionState);
      setConnectionState(peer.connectionState);
    };

    peer.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peer.iceConnectionState);
    };
  };

  // === Process Queued ICE Candidates ===
  const processQueuedIceCandidates = async () => {
    if (peerRef.current && isRemoteDescriptionSet.current && iceCandidatesQueue.current.length > 0) {
      console.log(`Processing ${iceCandidatesQueue.current.length} queued ICE candidates`);
      for (const candidate of iceCandidatesQueue.current) {
        try {
          await peerRef.current.addIceCandidate(candidate);
          console.log("Queued ICE candidate added successfully");
        } catch (err) {
          console.error("Failed to add queued ICE candidate:", err);
        }
      }
      iceCandidatesQueue.current = [];
    }
  };

  // === Toggle Camera ===
  const toggleCamera = async () => {
    if (isCameraEnabled) {
      // Turn off camera
      localVideoStream.current?.getTracks().forEach(track => track.stop());
      localVideoStream.current = null;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    } else {
      // Turn on camera
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: cameraId } },
        });
        localVideoStream.current = videoStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = videoStream;
        }
        
        // Add new video track to peer connection
        if (peerRef.current) {
          videoStream.getTracks().forEach((track) =>
            peerRef.current!.addTrack(track, videoStream)
          );
        }
      } catch (error) {
        console.error("Error turning on camera:", error);
        return;
      }
    }
    setIsCameraEnabled(!isCameraEnabled);
  };

  // === Toggle Microphone ===
  const toggleMicrophone = async () => {
    if (isMicrophoneEnabled) {
      // Turn off microphone
      localAudioStream.current?.getTracks().forEach(track => track.stop());
      localAudioStream.current = null;
    } else {
      // Turn on microphone
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: microphoneId } },
        });
        localAudioStream.current = audioStream;
        
        // Add new audio track to peer connection
        if (peerRef.current) {
          audioStream.getTracks().forEach((track) =>
            peerRef.current!.addTrack(track, audioStream)
          );
        }
      } catch (error) {
        console.error("Error turning on microphone:", error);
        return;
      }
    }
    setIsMicrophoneEnabled(!isMicrophoneEnabled);
  };

  // === Leave Meeting ===
  const leaveMeeting = () => {
    socket.emit("leave-meeting");
    localVideoStream.current?.getTracks().forEach(track => track.stop());
    localAudioStream.current?.getTracks().forEach(track => track.stop());
    peerRef.current?.close();
    setIsJoined(false);
  };

  // === Effects ===
  useEffect(() => {
    if (!user) return;

    socket.connect();
    
    initStreams().then(() => {
      console.log("Streams initialized, joining meeting");
      socket.emit("join-meeting", {
        roomId: meetingId,
        name: user.name || `User-${user.id}`,
        id: user.id,
      });
    });

    // Handle player joined
    socket.on("player-joined", async (data: RemoteUser) => {
      console.log("Player joined:", data);
      setRemoteSocketId(data.socketid);
      setRemoteUser(data);
      
      // Create peer connection
      createPeer(data.socketid);
      
      // Create offer to new player
      setTimeout(async () => {
        if (peerRef.current && peerRef.current.signalingState === "stable") {
          try {
            makingOffer.current = true;
            console.log("Creating offer for new player");
            const offer = await peerRef.current.createOffer();
            await peerRef.current.setLocalDescription(offer);
            console.log("Sending offer to:", data.socketid);
            socket.emit("offer", {
              to: data.socketid,
              from: socket.id,
              offer: peerRef.current.localDescription,
            });
          } catch (err) {
            console.error("Error creating offer for new player:", err);
          } finally {
            makingOffer.current = false;
          }
        }
      }, 500);
    });

    // Handle existing players
    socket.on("existing-players", (players: RemoteUser[]) => {
      console.log("Existing players:", players);
      if (players.length > 0) {
        const firstPlayer = players[0];
        setRemoteSocketId(firstPlayer.socketid);
        setRemoteUser(firstPlayer);
        createPeer(firstPlayer.socketid);
        
        // Create offer to existing player
        setTimeout(async () => {
          if (peerRef.current && peerRef.current.signalingState === "stable") {
            try {
              makingOffer.current = true;
              console.log("Creating offer for existing player");
              const offer = await peerRef.current.createOffer();
              await peerRef.current.setLocalDescription(offer);
              console.log("Sending offer to existing player:", firstPlayer.socketid);
              socket.emit("offer", {
                to: firstPlayer.socketid,
                from: socket.id,
                offer: peerRef.current.localDescription,
              });
            } catch (err) {
              console.error("Error creating offer for existing player:", err);
            } finally {
              makingOffer.current = false;
            }
          }
        }, 500);
      }
    });

    // Handle offer
    socket.on("offer", async ({ offer, from }) => {
      try {
        console.log("Received offer from:", from);
        setRemoteSocketId(from);
        if (!peerRef.current) createPeer(from);

        const peer = peerRef.current!;
        
        // Check for offer collision
        const offerCollision = makingOffer.current || peer.signalingState !== "stable";
        ignoreOffer.current = offerCollision;

        if (ignoreOffer.current) {
          console.log("Ignoring offer due to collision");
          return;
        }

        console.log("Setting remote description and creating answer");
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        isRemoteDescriptionSet.current = true;
        
        // Process any queued ICE candidates
        await processQueuedIceCandidates();
        
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        
        console.log("Sending answer to:", from);
        socket.emit("answer", { to: from, from: socket.id, answer: peer.localDescription });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    // Handle answer
    socket.on("answer", async ({ answer }) => {
      try {
        if (peerRef.current && peerRef.current.signalingState === "have-local-offer") {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          isRemoteDescriptionSet.current = true;
          console.log("Answer applied successfully");
          
          // Process any queued ICE candidates
          await processQueuedIceCandidates();
        } else {
          console.log("Peer not in correct state for answer:", peerRef.current?.signalingState);
        }
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    });

    // Handle ICE candidates
    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (peerRef.current && isRemoteDescriptionSet.current) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("ICE candidate added successfully");
        } else {
          console.log("Queueing ICE candidate - remote description not set yet");
          iceCandidatesQueue.current.push(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Failed to add ICE candidate:", err);
      }
    });

    // Handle player left
    socket.on("player-left", (data: RemoteUser) => {
      console.log("Player left:", data);
      if (data.socketid === remoteSocketId) {
        setRemoteSocketId(null);
        setRemoteUser(null);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        peerRef.current?.close();
        peerRef.current = null;
      }
    });

    return () => {
      socket.off("player-joined");
      socket.off("existing-players");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("player-left");
      socket.disconnect();
      localVideoStream.current?.getTracks().forEach(track => track.stop());
      localAudioStream.current?.getTracks().forEach(track => track.stop());
      peerRef.current?.close();
    };
  }, [user, meetingId, cameraId, microphoneId, isCameraEnabled, isMicrophoneEnabled]);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <h1 className="text-xl font-semibold">Meeting Room</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Connection: {connectionState}
          </span>
          <button
            onClick={leaveMeeting}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Leave Meeting
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex flex-1 gap-4 p-4">
        {/* Local Video */}
        <div className="relative flex aspect-video w-1/2 items-center justify-center overflow-hidden rounded-lg bg-black">
          {isCameraEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-2 h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <p className="text-sm text-gray-400">Camera is off</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 rounded bg-black bg-opacity-50 px-2 py-1 text-sm">
            You
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative flex aspect-video w-1/2 items-center justify-center overflow-hidden rounded-lg bg-black">
          {remoteUser ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-2 h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
                <p className="text-sm text-gray-400">Waiting for others to join...</p>
              </div>
            </div>
          )}
          {remoteUser && (
            <div className="absolute bottom-2 left-2 rounded bg-black bg-opacity-50 px-2 py-1 text-sm">
              {remoteUser.name}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 border-t border-gray-700 p-4">
        <button
          onClick={toggleMicrophone}
          className={`rounded-full p-3 ${
            isMicrophoneEnabled
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isMicrophoneEnabled ? "🎤" : "🔇"}
        </button>
        
        <button
          onClick={toggleCamera}
          className={`rounded-full p-3 ${
            isCameraEnabled
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isCameraEnabled ? "📹" : "📵"}
        </button>
      </div>
    </div>
  );
}
