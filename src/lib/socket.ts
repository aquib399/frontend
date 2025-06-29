// lib/socket.ts
import { io, Socket } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export const socket: Socket = io(URL, {
  autoConnect: false,
  transports: ["websocket", "polling"], // Allow both transports for better compatibility
  forceNew: true,
  reconnection: true,
  timeout: 20000,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Add connection event listeners for debugging
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("🔥 Socket connection error:", error);
});

socket.on("reconnect", (attemptNumber) => {
  console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
});

socket.on("reconnect_error", (error) => {
  console.error("🔥 Socket reconnection error:", error);
});

socket.on("reconnect_failed", () => {
  console.error("💀 Socket failed to reconnect");
});