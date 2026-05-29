import { useState, useEffect } from 'react';
import axios from 'axios';

export interface LiturgicalData {
  season: string;
  season_week: number;
  celebrations: {
    title: string;
    colour: string;
    rank: string;
  }[];
  weekday: string;
}

export const useLiturgicalCalendar = () => {
  const [data, setData] = useState<LiturgicalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await axios.get('http://calapi.inadiutorium.cz/api/v0/en/calendars/default/today');
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch liturgical calendar", error);
        // Fallback to ordinary time (green)
        setData({
          season: "ordinary",
          season_week: 1,
          celebrations: [{ title: "Ordinary Time", colour: "green", rank: "ferial" }],
          weekday: "sunday"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  return { data, loading };
};
