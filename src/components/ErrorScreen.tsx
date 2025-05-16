import React from "react";
import { MonitorOff } from "lucide-react";

interface ErrorScreenProps {
  message?: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  message = "An error occurred while loading content",
}) => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <MonitorOff className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Display Not Connected</h1>
      <p className="text-center text-xl">{message}</p>
      <div className="mt-8 text-gray-400 text-sm">
        <p>If this error persists, please contact your system administrator</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="bg-gray-800 px-7 py-1.5 rounded">
            <span className="text-gray-300">Device ID: </span>
            <span className="font-mono">
              {localStorage.getItem("deviceId") || "Unknown"}
            </span>
          </div>
          <button
            onClick={() => {
              const deviceId = localStorage.getItem("deviceId");
              if (deviceId) {
                navigator.clipboard.writeText(deviceId);
              }
            }}
            className="px-2 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          >
            Copy ID
          </button>
        </div>
      </div>
    </div>
  );
};
