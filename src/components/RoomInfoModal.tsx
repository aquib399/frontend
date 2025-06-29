import React from "react";
import { Copy } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/button";
import { copyToClipboard } from "@/utils";

interface RoomInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  connectedUsers: string[];
  currentUserId: string;
  onCopyRoomId: () => void;
}

export const RoomInfoModal: React.FC<RoomInfoModalProps> = ({
  isOpen,
  onClose,
  roomId,
  connectedUsers,
  currentUserId,
  onCopyRoomId,
}) => {
  const handleCopyRoomId = async () => {
    const success = await copyToClipboard(roomId);
    if (success) {
      onCopyRoomId();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Room Information">
      <div className="space-y-4">
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            Room ID
          </label>
          <div className="flex items-center space-x-2">
            <code className="flex-1 rounded-lg bg-slate-900 p-3 font-mono text-sm text-white">
              {roomId}
            </code>
            <Button onClick={handleCopyRoomId} size="sm" title="Copy Room ID">
              Copy
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Connected Users ({connectedUsers.length})
          </label>
          <div className="rounded-lg bg-slate-900 p-3">
            {connectedUsers.length > 0 ? (
              <ul className="space-y-1">
                {connectedUsers.map((user, index) => (
                  <li
                    key={user}
                    className="flex items-center space-x-2 text-sm text-white"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <span>
                      {user === currentUserId ? "You" : `User ${index + 1}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No users connected</p>
            )}
          </div>
        </div>

        <Button onClick={onClose} variant="secondary" className="w-full">
          Close
        </Button>
      </div>
    </Modal>
  );
};
