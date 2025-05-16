import React, { useState, useEffect } from 'react';

interface IframePlayerProps {
  url: string;
  onLoad: () => void;
  onError: () => void;
  title: string;
}

export const IframePlayer: React.FC<IframePlayerProps> = ({ 
  url, 
  onLoad, 
  onError,
  title 
}) => {
  const [loading, setLoading] = useState(true);
  
  // Set up timeout to detect loading failures
  useEffect(() => {
    // Consider loaded after 10 seconds if no error
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        onLoad();
      }
    }, 10000);
    
    return () => clearTimeout(timeoutId);
  }, [loading, onLoad]);
  
  const handleIframeLoad = () => {
    setLoading(false);
    onLoad();
  };

  const handleIframeError = () => {
    setLoading(false);
    onError();
  };

  // For URLs that won't work in iframes, we could display a message or try to render differently
  const isValidUrlForIframe = (url: string): boolean => {
    try {
      // Some sites block iframe embedding
      const domain = new URL(url).hostname;
      const blockedDomains = ['youtube.com', 'facebook.com', 'twitter.com', 'instagram.com'];
      return !blockedDomains.some(blockedDomain => domain.includes(blockedDomain));
    } catch (error) {
      return false;
    }
  };
  
  if (!isValidUrlForIframe(url)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-xl">This content cannot be displayed in an iframe.</p>
          <p className="mt-2">{url}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          <p>Loading content...</p>
        </div>
      )}
      <iframe
        src={url}
        title={title}
        className="w-full h-full border-0"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};