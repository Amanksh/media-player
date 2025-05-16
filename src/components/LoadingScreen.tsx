import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white">
      <Loader2 className="w-16 h-16 animate-spin mb-4" />
      <p className="text-xl font-medium">Loading Digital Signage</p>
      <p className="text-sm mt-2 text-gray-400">Please wait while we prepare your content</p>
    </div>
  );
};