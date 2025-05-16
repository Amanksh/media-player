import React from 'react';
import { AlertOctagon } from 'lucide-react';

interface ErrorScreenProps {
  message?: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  message = 'An error occurred while loading content' 
}) => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <AlertOctagon className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Digital Signage Error</h1>
      <p className="text-center text-xl">{message}</p>
      <div className="mt-8 text-gray-400 text-sm">
        <p>If this error persists, please contact your system administrator</p>
        <p className="mt-2">Device ID: {localStorage.getItem('deviceId') || 'Unknown'}</p>
      </div>
    </div>
  );
};