import React, { useEffect, useState } from "react";
import { PlaylistPlayer } from "./components/PlaylistPlayer";

import { LoadingScreen } from "./components/LoadingScreen";
import { ErrorScreen } from "./components/ErrorScreen";
import { DeviceIdentifier } from "./components/DeviceIdentifier";
import { fetchActivePlaylist } from "./services/api";
import { IPlaylist } from "./types";

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<IPlaylist | null>(null);

  // Load or generate a unique device identifier
  useEffect(() => {
    const storedDeviceId = localStorage.getItem("deviceId");

    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
    } else {
      const newDeviceId = `tv-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("deviceId", newDeviceId);
      setDeviceId(newDeviceId);
    }
  }, []);

  // Use our custom hook to get the currently scheduled playlist

  // Fetch active playlist data
  useEffect(() => {
    if (!deviceId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        // We prioritize scheduled playlists if available
        const playlist = await fetchActivePlaylist(deviceId);
        setActivePlaylist(playlist);
        setError(null);
      } catch (err) {
        console.error("Failed to load playlist:", err);
        setError("Failed to load content. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Refresh content every 5 minutes
    const intervalId = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [deviceId]);
  console.log("activePlaylist", activePlaylist);
  // Request fullscreen when loaded
  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Could not enter fullscreen mode:", err);
      }
    };

    // Request fullscreen on user interaction
    const handleUserInteraction = () => {
      requestFullscreen();
      // Remove event listeners after fullscreen is requested
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !activePlaylist) {
    return <ErrorScreen message={error || "No active playlist found"} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <PlaylistPlayer playlist={activePlaylist} />
      <DeviceIdentifier deviceId={deviceId} />
    </div>
  );
}

export default App;
