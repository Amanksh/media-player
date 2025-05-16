import axios from "axios";
import { IPlaylist, IDisplayResponse } from "../types";

// Configure Axios with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Register device and fetch active playlist
export const fetchActivePlaylist = async (
  deviceId: string
): Promise<IPlaylist> => {
  try {
    const response = await api.get<IDisplayResponse>(`/${deviceId}`);
    console.log("response", response);
    if (!response.data.playlist) {
      throw new Error("No active playlist found");
    }
    return response.data.playlist;
  } catch (error) {
    console.error("Error fetching active playlist:", error);
    throw new Error("Could not fetch active playlist");
  }
};

// Fetch a specific playlist by ID
export const fetchPlaylistById = async (
  playlistId: string
): Promise<IPlaylist> => {
  try {
    const response = await api.get(`/playlists/${playlistId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching playlist ${playlistId}:`, error);
    throw new Error("Could not fetch playlist");
  }
};

// Get all scheduled playlists
export const fetchScheduledPlaylists = async (): Promise<IPlaylist[]> => {
  try {
    const response = await api.get("/playlists/scheduled");
    return response.data;
  } catch (error) {
    console.error("Error fetching scheduled playlists:", error);
    throw new Error("Could not fetch scheduled playlists");
  }
};

// Log playback events for analytics
export const logPlaybackEvent = async (
  deviceId: string,
  playlistId: string,
  assetId: string,
  event: "start" | "complete" | "error"
) => {
  try {
    await api.post("/analytics/playback", {
      deviceId,
      playlistId,
      assetId,
      event,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Just log the error but don't throw - analytics should not affect playback
    console.error("Error logging playback event:", error);
  }
};

// Send heartbeat/ping to indicate this device is active
export const sendDeviceHeartbeat = async (
  deviceId: string,
  info: {
    currentPlaylistId?: string;
    resolution?: string;
    browserInfo?: string;
  }
) => {
  try {
    await api.post("/devices/heartbeat", {
      deviceId,
      ...info,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending device heartbeat:", error);
    // Non-critical operation, so we don't throw
  }
};
