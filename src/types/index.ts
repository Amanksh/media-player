// Types for our application

// Represents a single asset item in a playlist
export interface IAssetItem {
  assetId: {
    _id: string;
    type: "IMAGE" | "VIDEO" | "HTML" | "URL";
    url: string;
    name: string;
  };
  duration: number; // in seconds
  order: number;
}

// Represents a schedule for playlist
export interface ISchedule {
  startDate?: Date;
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6, where 0 is Sunday
  startTime?: string; // format: "HH:MM"
  endTime?: string; // format: "HH:MM"
}

// Represents a playlist
export interface IPlaylist {
  _id: string;
  name: string;
  items: IAssetItem[];
  status: "active" | "inactive" | "scheduled";
  schedule?: ISchedule;
}

// Types for media player state
export type MediaStatus = "idle" | "loading" | "playing" | "error" | "finished";

// Type for device information
export interface IDeviceInfo {
  deviceId: string;
  lastPing: Date;
  currentPlaylistId?: string;
  resolution?: string;
  browserInfo?: string;
}

// API Response type
export interface IDisplayResponse {
  displayId: string;
  name: string;
  playlist: IPlaylist | null;
}
