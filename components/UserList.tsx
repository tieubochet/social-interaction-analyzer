
import React from 'react';
import type { User } from '../types';
import { UserCard } from './UserCard';

interface UserListProps {
  title: string;
  users: User[];
  icon: React.ReactNode;
  onFollow?: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ title, users, icon, onFollow }) => {
  return (
    <div className="bg-gray-900/50 p-3 rounded-lg flex flex-col">
      <div className="flex items-center mb-3">
        {icon}
        <h3 className="font-bold text-lg text-gray-200 ml-2">{title} ({users.length})</h3>
      </div>
      {users.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {users.map((user) => (
            <UserCard key={user.id} user={user} onFollow={onFollow} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-24 bg-gray-700/50 rounded-md">
            <p className="text-gray-400 text-sm">Không có người dùng nào.</p>
        </div>
      )}
    </div>
  );
};
