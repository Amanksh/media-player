import { useState, useEffect } from 'react';
import { IPlaylist } from '../types';
import { fetchScheduledPlaylists } from '../services/api';
import { parseISO, isWithinInterval, format, getDay } from 'date-fns';

// Custom hook to manage playlist scheduling
export const usePlaylistScheduler = (): IPlaylist | null => {
  const [scheduledPlaylists, setScheduledPlaylists] = useState<IPlaylist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<IPlaylist | null>(null);

  // Fetch all scheduled playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const playlists = await fetchScheduledPlaylists();
        setScheduledPlaylists(playlists);
      } catch (error) {
        console.error('Failed to fetch scheduled playlists:', error);
      }
    };

    fetchPlaylists();
    // Check for new scheduled playlists every 15 minutes
    const intervalId = setInterval(fetchPlaylists, 15 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Determine which playlist should be playing based on current time
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentTimeString = format(now, 'HH:mm');
      const todayDayOfWeek = getDay(now); // 0-6, where 0 is Sunday

      // Find a playlist that should be playing right now
      const eligiblePlaylist = scheduledPlaylists.find(playlist => {
        if (playlist.status !== 'scheduled' || !playlist.schedule) {
          return false;
        }

        const { startDate, endDate, daysOfWeek, startTime, endTime } = playlist.schedule;

        // Check date range if specified
        if (startDate && endDate) {
          const start = parseISO(startDate.toString());
          const end = parseISO(endDate.toString());
          
          if (!isWithinInterval(now, { start, end })) {
            return false;
          }
        }

        // Check day of week if specified
        if (daysOfWeek && daysOfWeek.length > 0) {
          if (!daysOfWeek.includes(todayDayOfWeek)) {
            return false;
          }
        }

        // Check time range if specified
        if (startTime && endTime) {
          // Simple string comparison works for 24-hour format times
          if (currentTimeString < startTime || currentTimeString > endTime) {
            return false;
          }
        }

        return true;
      });

      setCurrentPlaylist(eligiblePlaylist || null);
    };

    // Check immediately
    checkSchedule();
    
    // Then check every minute
    const intervalId = setInterval(checkSchedule, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [scheduledPlaylists]);

  return currentPlaylist;
};