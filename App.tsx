
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UrlInputForm } from './components/UrlInputForm';
import { UserList } from './components/UserList';
import { Spinner } from './components/Spinner';
import { scanPostInteractions } from './services/scannerService';
import type { User } from './types';
import { IconUsersGroup, IconUserCheck, IconUserPlus } from './components/Icons';

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanCompleted, setScanCompleted] = useState<boolean>(false);
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const [notFollowedUsers, setNotFollowedUsers] = useState<User[]>([]);

  const handleScan = useCallback(async () => {
    if (!url.trim()) {
      setError('Vui lòng nhập đường dẫn bài viết.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setScanCompleted(false);

    try {
      // Simulate API call
      const { followed, notFollowed } = await scanPostInteractions(url);
      setFollowedUsers(followed);
      setNotFollowedUsers(notFollowed);
      setScanCompleted(true);
    } catch (err) {
      setError('Không thể quét bài viết. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [url]);
  
  const handleFollowUser = (userId: string) => {
    setNotFollowedUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    const userToFollow = notFollowedUsers.find(u => u.id === userId);
    if(userToFollow) {
      setFollowedUsers(prevUsers => [userToFollow, ...prevUsers].sort((a, b) => a.username.localeCompare(b.username)));
    }
  };


  return (
    <div className="min-w-[450px] max-w-lg mx-auto bg-gray-800 text-gray-100 font-sans p-4">
      <Header />
      <main>
        <UrlInputForm
          url={url}
          setUrl={setUrl}
          onScan={handleScan}
          isLoading={isLoading}
        />
        {error && <p className="text-red-400 text-center mt-2">{error}</p>}
        
        {isLoading && (
            <div className="flex flex-col items-center justify-center mt-8">
                <Spinner />
                <p className="text-purple-300 mt-2">Đang quét người dùng tương tác...</p>
            </div>
        )}

        {scanCompleted && !isLoading && (
          <div className="mt-6">
            <div className="flex items-center justify-center mb-4 border-b border-gray-600 pb-2">
                <IconUsersGroup className="w-6 h-6 text-purple-400 mr-2"/>
                <h2 className="text-xl font-bold text-gray-200">Kết quả phân tích</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UserList 
                title="Đã Follow" 
                users={followedUsers} 
                icon={<IconUserCheck className="w-5 h-5 text-green-400" />}
              />
              <UserList 
                title="Chưa Follow" 
                users={notFollowedUsers}
                onFollow={handleFollowUser}
                icon={<IconUserPlus className="w-5 h-5 text-yellow-400"/>}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
