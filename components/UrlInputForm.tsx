
import React from 'react';
import { IconLink } from './Icons';

interface UrlInputFormProps {
  url: string;
  setUrl: (url: string) => void;
  onScan: () => void;
  isLoading: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ url, setUrl, onScan, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScan();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <label htmlFor="url-input" className="text-sm font-medium text-gray-300">Đường dẫn bài viết</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconLink className="w-5 h-5 text-gray-400"/>
            </div>
            <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/post/123"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                disabled={isLoading}
            />
        </div>
      <button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-all duration-200 ease-in-out disabled:bg-purple-800 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Đang quét...' : 'Quét'}
      </button>
    </form>
  );
};
