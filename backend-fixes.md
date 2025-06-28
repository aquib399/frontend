# Backend Fixes Needed

Based on your logs, here are the critical backend issues that need to be fixed:

## 1. Room Full Logic Error

Your backend is incorrectly rejecting the second user with "Room is full". The logs show:

```
✅ Socket 2sAb7K8w4Y6SaSqKAAAF successfully joined existing room zfhym- (2 users total)
🎯 JOIN_ROOM request - Socket: 2sAb7K8w4Y6SaSqKAAAF, Room: zfhym-
❌ Failed to join room zfhym- for socket 2sAb7K8w4Y6SaSqKAAAF: Room is full
```

The user successfully joins, but then gets rejected when trying to join again.

## 2. Required Backend Socket Event Handlers

Add these missing event handlers to your backend:

```javascript
// Add to your backend socket handlers
socket.on('request-media-state', (data) => {
  console.log('📞 Media state requested in room:', data.roomId);
  socket.to(data.roomId).emit('request-media-state', {
    roomId: data.roomId,
    userId: socket.id
  });
});

socket.on('media-state-response', (data) => {
  console.log('📞 Media state response in room:', data.roomId);
  if (data.targetUserId) {
    socket.to(data.targetUserId).emit('media-state-response', {
      roomId: data.roomId,
      mediaState: data.mediaState,
      userId: socket.id
    });
  } else {
    socket.to(data.roomId).emit('media-state-response', {
      roomId: data.roomId,
      mediaState: data.mediaState,
      userId: socket.id
    });
  }
});

// Update existing offer handler to include targetUserId
socket.on('offer', (data) => {
  console.log('📞 Offer sent from', socket.id, 'in room', data.roomId);
  if (data.targetUserId) {
    socket.to(data.targetUserId).emit('offer', {
      offer: data.offer,
      fromUserId: socket.id,
      roomId: data.roomId
    });
  } else {
    socket.to(data.roomId).emit('offer', {
      offer: data.offer,
      fromUserId: socket.id,
      roomId: data.roomId
    });
  }
});

// Update existing answer handler
socket.on('answer', (data) => {
  console.log('📞 Answer sent from', socket.id, 'to', data.targetUserId);
  if (data.targetUserId) {
    socket.to(data.targetUserId).emit('answer', {
      answer: data.answer,
      fromUserId: socket.id,
      roomId: data.roomId
    });
  }
});

// Update media state change handler
socket.on('media-state-change', (data) => {
  console.log('🎥 Media state changed for', socket.id, ':', data.mediaState);
  if (data.targetUserId) {
    socket.to(data.targetUserId).emit('media-state-change', {
      userId: socket.id,
      mediaState: data.mediaState,
      roomId: data.roomId
    });
  } else {
    socket.to(data.roomId).emit('media-state-change', {
      userId: socket.id,
      mediaState: data.mediaState,
      roomId: data.roomId
    });
  }
});
```

## 3. Fix Room Management Logic

The main issue is that users are being allowed to join a room successfully, but then rejected on subsequent JOIN_ROOM events. This suggests:

1. **Remove duplicate JOIN_ROOM handling** - Users shouldn't need to rejoin
2. **Fix room capacity logic** - Make sure it correctly counts unique users
3. **Prevent duplicate joins** - Track which users are already in which rooms

## 4. Debugging

Add these debug logs to your backend:

```javascript
// Before any room logic
console.log('🔍 Current rooms state:', Array.from(io.sockets.adapter.rooms.entries()));
console.log('🔍 Socket rooms before join:', Array.from(socket.rooms));

// After room operations
console.log('🔍 Socket rooms after join:', Array.from(socket.rooms));
```

The key issue is that your frontend is working correctly, but the backend room management has a bug that's preventing the second user from staying connected.
