import React, { useState, useEffect, useCallback } from "react";
import { MediaPlayer } from "./MediaPlayer";
import { IPlaylist, IAssetItem, MediaStatus } from "../types";
import { logPlaybackEvent } from "../services/api";

interface PlaylistPlayerProps {
  playlist: IPlaylist;
}

export const PlaylistPlayer: React.FC<PlaylistPlayerProps> = ({ playlist }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
    setIsTransitioning(true);

    // Short timeout for transition effect
    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === sortedItems.length - 1 ? 0 : prevIndex + 1
      );
      setIsTransitioning(false);
    }, 500); // 500ms transition
  }, [sortedItems.length]);

  // Handle media status changes
  const handleMediaStatusChange = useCallback(
    (status: MediaStatus, assetId: string) => {
      if (status === "playing" && deviceId) {
        logPlaybackEvent(deviceId, playlist._id, assetId, "start");
      } else if (status === "finished" && deviceId) {
        logPlaybackEvent(deviceId, playlist._id, assetId, "complete");
        advanceToNextAsset();
      } else if (status === "error" && deviceId) {
        logPlaybackEvent(deviceId, playlist._id, assetId, "error");
        advanceToNextAsset(); // Skip errored content
      }
    },
    [advanceToNextAsset, deviceId, playlist._id]
  );

  // Set up timer for image assets
  useEffect(() => {
    if (!currentAsset) return;

    // Only set timer for images; videos will advance on completion
    if (
      currentAsset.assetId.type === "IMAGE" ||
      currentAsset.assetId.type === "URL"
    ) {
      const timer = setTimeout(() => {
        advanceToNextAsset();
      }, 5000);

      return () => clearTimeout(timer);
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
    <div
      className={`w-full h-full transition-opacity duration-500 ease-in-out ${
        isTransitioning ? "opacity-0" : "opacity-100"
      }`}
    >
      <MediaPlayer
        asset={currentAsset}
        onStatusChange={(status) =>
          handleMediaStatusChange(status, currentAsset.assetId._id)
        }
      />
    </div>
  );
};
