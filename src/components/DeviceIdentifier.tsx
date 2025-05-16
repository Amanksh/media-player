import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { sendDeviceHeartbeat } from '../services/api';

interface DeviceIdentifierProps {
  deviceId: string | null;
}

export const DeviceIdentifier: React.FC<DeviceIdentifierProps> = ({ deviceId }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [resolution, setResolution] = useState('');

  // Send regular heartbeat to server and update resolution
  useEffect(() => {
    if (!deviceId) return;

    const updateResolution = () => {
      const newResolution = `${window.innerWidth}x${window.innerHeight}`;
      setResolution(newResolution);
      return newResolution;
    };

    const initialResolution = updateResolution();
    
    // Send initial heartbeat
    sendDeviceHeartbeat(deviceId, {
      resolution: initialResolution,
      browserInfo: navigator.userAgent
    });

    // Set up interval for regular heartbeats
    const intervalId = setInterval(() => {
      const currentResolution = updateResolution();
      sendDeviceHeartbeat(deviceId, { resolution: currentResolution });
    }, 5 * 60 * 1000); // Every 5 minutes

    // Listen for window resize
    window.addEventListener('resize', updateResolution);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', updateResolution);
    };
  }, [deviceId]);

  // Toggle info overlay
  const toggleInfo = () => {
    setShowInfo(prev => !prev);
  };

  // Auto-hide info after 20 seconds
  useEffect(() => {
    if (showInfo) {
      const timerId = setTimeout(() => {
        setShowInfo(false);
      }, 20000);
      return () => clearTimeout(timerId);
    }
  }, [showInfo]);

  return (
    <>
      {/* Info button */}
      <button 
        onClick={toggleInfo}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-black bg-opacity-20 text-white hover:bg-opacity-30 transition-opacity z-50"
        aria-label="Show device information"
      >
        <Info size={16} />
      </button>

      {/* Info overlay */}
      {showInfo && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full text-white">
            <h2 className="text-xl font-bold mb-4">Device Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Device ID:</span> {deviceId || 'Unknown'}</p>
              <p><span className="font-medium">Resolution:</span> {resolution}</p>
              <p><span className="font-medium">Browser:</span> {navigator.userAgent}</p>
              <p><span className="font-medium">Time:</span> {new Date().toLocaleString()}</p>
            </div>
            <div className="mt-6 text-sm text-gray-400">
              <p>Tap anywhere or wait 20 seconds to close this information</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};