import React from 'react';
import RoomJoin from './RoomJoin';

const VideoCallApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <RoomJoin />
    </div>
  );
};

export default VideoCallApp;