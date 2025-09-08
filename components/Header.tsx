
import React from 'react';
import { IconScan } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-6">
      <div className="flex items-center justify-center text-2xl font-bold text-purple-400">
        <IconScan className="w-8 h-8 mr-2" />
        <h1>Social Interaction Analyzer</h1>
      </div>
      <p className="text-gray-400 text-sm mt-1">Phân loại người dùng đã follow và chưa follow</p>
    </header>
  );
};
