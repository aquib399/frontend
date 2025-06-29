/**
 * WebRTC Connection Test Script
 *
 * To use this script:
 * 1. Open the browser developer console
 * 2. Copy and paste this script
 * 3. Run it to test your WebRTC connection
 */

(function () {
  console.log("🔧 WebRTC Connection Test Starting...");

  // Test 1: Check for WebRTC support
  console.log("\n📋 Test 1: WebRTC Browser Support");

  const hasGetUserMedia = !!(
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  );
  const hasRTCPeerConnection = !!window.RTCPeerConnection;
  const hasWebSocket = !!window.WebSocket;

  console.log(`✅ getUserMedia: ${hasGetUserMedia}`);
  console.log(`✅ RTCPeerConnection: ${hasRTCPeerConnection}`);
  console.log(`✅ WebSocket: ${hasWebSocket}`);

  if (!hasGetUserMedia || !hasRTCPeerConnection || !hasWebSocket) {
    console.error("❌ Browser does not support required WebRTC features");
    return;
  }

  // Test 2: Socket.IO connection
  console.log("\n📋 Test 2: Socket.IO Connection");

  const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
    transports: ["websocket", "polling"],
    timeout: 20000,
    forceNew: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);

    // Test room joining
    const testRoomId = "test-room-" + Date.now();
    console.log(`\n📋 Test 3: Room Operations (${testRoomId})`);

    socket.emit("join-room", { roomId: testRoomId });

    socket.on("user-joined", (data) => {
      console.log("✅ User joined event:", data);
    });

    socket.on("join-error", (data) => {
      console.log("❌ Join error:", data);
    });
  });

  socket.on("connect_error", (error) => {
    console.log("❌ Socket connection error:", error);
  });

  socket.on("disconnect", (reason) => {
    console.log("⚠️ Socket disconnected:", reason);
  });

  // Test 3: Media access
  console.log("\n📋 Test 4: Media Device Access");

  navigator.mediaDevices
    .getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: { echoCancellation: true, noiseSuppression: true },
    })
    .then((stream) => {
      console.log("✅ Media stream obtained");
      console.log(`✅ Video tracks: ${stream.getVideoTracks().length}`);
      console.log(`✅ Audio tracks: ${stream.getAudioTracks().length}`);

      // Stop the test stream
      stream.getTracks().forEach((track) => track.stop());
    })
    .catch((error) => {
      console.log("❌ Media access error:", error);
    });

  // Test 4: STUN server connectivity
  console.log("\n📋 Test 5: STUN Server Connectivity");

  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("✅ ICE candidate generated:", event.candidate.type);
    } else {
      console.log("✅ ICE gathering completed");
      pc.close();
    }
  };

  pc.createOffer()
    .then((offer) => {
      return pc.setLocalDescription(offer);
    })
    .then(() => {
      console.log("✅ Local description set, gathering ICE candidates...");
    })
    .catch((error) => {
      console.log("❌ Offer creation error:", error);
    });

  console.log("\n🏁 Test script setup complete. Watch for results above...");

  // Cleanup after 30 seconds
  setTimeout(() => {
    socket.disconnect();
    pc.close();
    console.log("\n🧹 Test cleanup completed");
  }, 30000);
})();
