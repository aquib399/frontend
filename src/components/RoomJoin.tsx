import React, { useState } from 'react';
import { Video, Plus, LogIn, Users } from 'lucide-react';
import {  Button } from '@/components/ui/button';
import { isValidRoomId } from '@/utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { useRouter } from 'next/navigation';

const RoomJoin: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useRouter();

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      // Call backend API to create meeting
      const response = await fetch('/api/create-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const data = await response.json();
      const meetingId = data.meetingId;

      
      // Navigate to the lobby page with the meeting ID
      navigate.push(`/lobby/${meetingId}`);
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
    const trimmedRoomId = roomId.trim();
    
    if (!trimmedRoomId) {
      return;
    }

    if (!isValidRoomId(trimmedRoomId)) {
      return;
    }

    
    // Navigate to the lobby page with the meeting ID
    navigate.push(`/lobby/${trimmedRoomId}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">WebRTC Video Call</h1>
            <p className="text-gray-300">Connect with others through secure peer-to-peer video calling</p>
          </div>

          {/* Create Room Section */}
          <div className="mb-6">
            <Button
              onClick={handleCreateRoom}
        
              className="w-full"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create New Room'}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-400">or</span>
            </div>
          </div>

          {/* Join Room Section */}
          <div className="space-y-4">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-300 mb-2">
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter room ID to join"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <Button
              onClick={handleJoinRoom}
              disabled={!roomId.trim()}
              variant="secondary"
              className="w-full"
            >
              Join Room
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
              <Users className="w-4 h-4" />
              <span>Secure peer-to-peer connection</span>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default RoomJoin;