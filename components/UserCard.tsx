
import React from 'react';
import type { User } from '../types';
import { IconUserPlus } from './Icons';

interface UserCardProps {
  user: User;
  onFollow?: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onFollow }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-700 hover:bg-gray-600/70 rounded-md transition-colors">
      <div className="flex items-center space-x-3">
        <img
          src={user.avatarUrl}
          alt={`${user.username}'s avatar`}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-500"
        />
        <span className="font-medium text-gray-200">@{user.username}</span>
      </div>
      {onFollow && (
        <button 
          onClick={() => onFollow(user.id)}
          className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-full flex items-center transition-colors"
        >
          <IconUserPlus className="w-4 h-4 mr-1"/>
          Follow
        </button>
      )}
    </div>
  );
};
