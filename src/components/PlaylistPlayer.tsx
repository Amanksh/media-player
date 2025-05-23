import React, { useState, useEffect, useCallback } from "react";
import { MediaPlayer } from "./MediaPlayer";
import { IPlaylist, IAssetItem, MediaStatus } from "../types";

interface PlaylistPlayerProps {
  playlist: IPlaylist;
}

export const PlaylistPlayer: React.FC<PlaylistPlayerProps> = ({ playlist }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deviceId, setDeviceId] = useState<string>("");

  // Get device ID from local storage
  useEffect(() => {
    const storedDeviceId = localStorage.getItem("deviceId");
    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
    }
  }, []);

  // Sort items by order
  const sortedItems = [...playlist.items].sort((a, b) => a.order - b.order);

  // Get current asset
  const currentAsset = sortedItems[currentIndex];

  // Function to advance to the next asset
  const advanceToNextAsset = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === sortedItems.length - 1 ? 0 : prevIndex + 1
    );
  }, [sortedItems.length]);

  // Handle media status changes
  const handleMediaStatusChange = useCallback(
    (status: MediaStatus) => {
      if (status === "playing" && deviceId) {
        try {
          // logPlaybackEvent(deviceId, playlist._id, assetId, "start");
        } catch (error) {}
      } else if (status === "finished") {
        try {
          // logPlaybackEvent(deviceId, playlist._id, assetId, "complete");
        } catch (error) {}
        advanceToNextAsset();
      } else if (status === "error") {
        try {
          // logPlaybackEvent(deviceId, playlist._id, assetId, "error");
        } catch (error) {}
        advanceToNextAsset();
      }
    },
    [advanceToNextAsset, deviceId, playlist._id]
  );

  // Set up timer for image assets
  useEffect(() => {
    if (!currentAsset) return;

    // Only set timer for images and URLs; videos will advance on completion
    if (
      currentAsset.assetId.type === "IMAGE" ||
      currentAsset.assetId.type === "URL" ||
      currentAsset.assetId.type === "HTML"
    ) {
      const timer = setTimeout(() => {
        advanceToNextAsset();
      }, currentAsset.duration * 1000);

      return () => {
        clearTimeout(timer);
      };
    }
    if (currentAsset.assetId.type === "VIDEO" && currentAsset.duration !== 1) {
      const timer = setTimeout(() => {
        advanceToNextAsset();
      }, currentAsset.duration * 1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [currentAsset, advanceToNextAsset]);

  if (!currentAsset) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <p>No assets in this playlist</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full transition-opacity duration-500 ease-in-out">
      <MediaPlayer
        asset={currentAsset}
        onStatusChange={handleMediaStatusChange}
      />
    </div>
  );
};
