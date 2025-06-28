import React from 'react';
import { Video, Users } from 'lucide-react';

import { truncateString } from '@/utils';
import { UI_CONFIG } from '@/constants';
import { Button } from '@/components/ui/button';

interface CallHeaderProps {
  roomId: string;
  isConnected: boolean;
  isCallActive: boolean;
  onShowRoomInfo: () => void;
}

export const CallHeader: React.FC<CallHeaderProps> = ({
  roomId,
  isConnected,
  isCallActive,
  onShowRoomInfo,
}) => {
  return (
    <div className="border-b bg-background backdrop-blur-sm border-white/10">
      <div className="px-4 py-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WebRTC Video Call</h1>
              <p className="text-sm text-gray-400">
                Room: {truncateString(roomId, UI_CONFIG.ROOM_ID_DISPLAY_LENGTH)}...
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            
            <Button
              onClick={onShowRoomInfo}
              variant="ghost"
              size="sm"
              title="Room Information"
              className="p-2"
            >
              <span className="sr-only">Room Information</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
