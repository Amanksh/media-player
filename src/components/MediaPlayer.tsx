import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { IAssetItem, MediaStatus } from "../types";
import { IframePlayer } from "./IframePlayer";

interface MediaPlayerProps {
  asset: IAssetItem;
  onStatusChange: (status: MediaStatus) => void;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({
  asset,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<MediaStatus>("loading");
  const playerRef = useRef<ReactPlayer | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { type, url } = asset.assetId;
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (durationTimerRef.current) {
        clearTimeout(durationTimerRef.current);
      }
    };
  }, []);

  // Update parent component when status changes
  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  // Handle image loading
  const handleImageLoad = () => {
    setStatus("playing");
  };

  // Handle image error
  const handleImageError = () => {
    console.error(`Failed to load image: ${url}`);
    setStatus("error");
  };

  // Handle video events
  const handleVideoReady = () => {
    setStatus("playing");

    if (playerRef.current) {
      const video = playerRef.current.getInternalPlayer();

      // Ensure video doesn't loop
      video.loop = false;

      // Add ended event listener
      video.addEventListener("ended", () => {
        setStatus("finished");
      });

      // Add error event listener
      video.addEventListener("error", (e: Event) => {
        setStatus("error");
      });

      // Start playing
      if (isYouTube) {
        video.playVideo();
      } else {
        video.play().catch((error: Error) => {
          console.error("Error playing video:", error);
        });
      }
    }
  };

  const handleVideoError = (error: any) => {
    console.error("Video error:", error);
    setStatus("error");
  };

  const handleVideoEnded = () => {
    setStatus("finished");
  };

  // Handle URL/iframe events
  const handleIframeLoad = () => {
    setStatus("playing");
  };

  const handleIframeError = () => {
    console.error(`Failed to load URL: ${url}`);
    setStatus("error");
  };

  // Render appropriate media based on type
  switch (type) {
    case "IMAGE":
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <img
            src={url}
            alt={asset.assetId.name || "Digital signage content"}
            className="max-w-full max-h-full object-contain"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      );

    case "VIDEO":
      return (
        <div className="w-full h-full bg-black">
          <ReactPlayer
            ref={playerRef}
            url={url}
            width="100%"
            height="100%"
            playing={true}
            playsinline={true}
            muted={true}
            controls={false}
            loop={false}
            onReady={handleVideoReady}
            onError={handleVideoError}
            onEnded={handleVideoEnded}
            onProgress={({ played }) => {
              // Only check progress if there's no custom duration
              if (!asset.duration || Number(asset.duration) === 1) {
                if (played >= 0.99) {
                  setStatus("finished");
                }
              }
            }}
            onDuration={(duration) => {
              // Clear any existing timer
              if (durationTimerRef.current) {
                clearTimeout(durationTimerRef.current);
              }

              // If the asset has a custom duration, set a timer
              if (asset.duration && Number(asset.duration) !== 1) {
                console.log(
                  "Setting custom duration timer:",
                  asset.duration,
                  "seconds"
                );
                durationTimerRef.current = setTimeout(() => {
                  setStatus("finished");
                }, Number(asset.duration) * 1000);
              }
            }}
            style={{ backgroundColor: "#000" }}
            config={{
              file: {
                attributes: {
                  style: {
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  },
                },
                forceVideo: true,
                forceHLS: false,
                hlsOptions: {
                  enableWorker: true,
                  debug: false,
                  xhrSetup: (xhr: XMLHttpRequest) => {
                    xhr.withCredentials = false;
                  },
                },
              },
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  disablekb: 1,
                  fs: 0,
                  modestbranding: 1,
                  playsinline: 1,
                  rel: 0,
                  showinfo: 0,
                  mute: 1,
                  origin: window.location.origin,
                  enablejsapi: 1,
                  iv_load_policy: 3,
                  cc_load_policy: 0,
                  start: 0,
                },
                embedOptions: {
                  host: "https://www.youtube-nocookie.com",
                },
              },
            }}
            onReady={(player) => {
              if (isYouTube) {
                player.getInternalPlayer().playVideo();
              }
            }}
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-black text-white">
                <p>Loading video...</p>
              </div>
            }
          />
        </div>
      );

    case "URL":
    case "HTML":
      return (
        <IframePlayer
          url={url}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={asset.assetId.name || "Web content"}
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
