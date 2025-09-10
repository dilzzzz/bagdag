import React from 'react';
import { UsersIcon } from './icons';

const Community: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-gray-800 text-white p-6 md:p-8 items-center justify-center text-center">
      <UsersIcon className="h-24 w-24 text-green-400 mb-6" />
      <h2 className="text-4xl font-bold text-white mb-2">Community Hub Coming Soon!</h2>
      <p className="text-lg text-gray-400 max-w-md">
        Connect with other golfers, share your progress, and join exclusive events. Our community features are teeing off soon!
      </p>
    </div>
  );
};

export default Community;
