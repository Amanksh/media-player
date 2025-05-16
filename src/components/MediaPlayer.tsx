import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { IAssetItem, MediaStatus } from '../types';
import { IframePlayer } from './IframePlayer';

interface MediaPlayerProps {
  asset: IAssetItem;
  onStatusChange: (status: MediaStatus) => void;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ 
  asset, 
  onStatusChange 
}) => {
  const [status, setStatus] = useState<MediaStatus>('loading');
  const playerRef = useRef<ReactPlayer | null>(null);
  const { type, url } = asset.assetId;
  
  // Update parent component when status changes
  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  // Handle image loading
  const handleImageLoad = () => {
    setStatus('playing');
  };

  // Handle image error
  const handleImageError = () => {
    console.error(`Failed to load image: ${url}`);
    setStatus('error');
  };

  // Handle video events
  const handleVideoReady = () => {
    setStatus('playing');
  };

  const handleVideoError = () => {
    console.error(`Failed to load video: ${url}`);
    setStatus('error');
  };

  const handleVideoEnded = () => {
    setStatus('finished');
  };

  // Handle URL/iframe events
  const handleIframeLoad = () => {
    setStatus('playing');
  };

  const handleIframeError = () => {
    console.error(`Failed to load URL: ${url}`);
    setStatus('error');
  };

  // Render appropriate media based on type
  switch (type) {
    case 'IMAGE':
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <img 
            src={url} 
            alt={asset.assetId.name || 'Digital signage content'}
            className="max-w-full max-h-full object-contain"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      );
      
    case 'VIDEO':
      return (
        <div className="w-full h-full bg-black">
          <ReactPlayer
            ref={playerRef}
            url={url}
            width="100%"
            height="100%"
            playing
            loop={false}
            muted={false}
            controls={false}
            onReady={handleVideoReady}
            onError={handleVideoError}
            onEnded={handleVideoEnded}
            style={{ backgroundColor: '#000' }}
            config={{
              file: {
                attributes: {
                  style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }
                }
              }
            }}
          />
        </div>
      );
      
    case 'URL':
    case 'HTML':
      return (
        <IframePlayer 
          url={url} 
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={asset.assetId.name || 'Web content'}
        />
      );
      
    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white">
          <p>Unsupported media type</p>
        </div>
      );
  }
};