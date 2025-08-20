import { useState, useEffect } from 'react';

export interface PuffEntry {
  id: string;
  timestamp: Date;
  count: number;
  trigger?: string;
  mood?: string;
}

export interface DailyStats {
  date: string;
  puffs: number;
}

export function usePuffData() {
  const [puffs, setPuffs] = useState<PuffEntry[]>([]);
  const [dailyGoal, setDailyGoal] = useState(20);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('vape-puffs');
    if (stored) {
      const data = JSON.parse(stored);
      setPuffs(data.map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) })));
    }
    
    const storedGoal = localStorage.getItem('daily-goal');
    if (storedGoal) {
      setDailyGoal(parseInt(storedGoal));
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('vape-puffs', JSON.stringify(puffs));
  }, [puffs]);

  useEffect(() => {
    localStorage.setItem('daily-goal', dailyGoal.toString());
  }, [dailyGoal]);

  const addPuff = (count: number = 1, trigger?: string, mood?: string) => {
    const newPuff: PuffEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      count,
      trigger,
      mood
    };
    setPuffs(prev => [newPuff, ...prev]);
  };

  const getTodaysPuffs = () => {
    const today = new Date().toDateString();
    return puffs
      .filter(puff => puff.timestamp.toDateString() === today)
      .reduce((total, puff) => total + puff.count, 0);
  };

  const getWeeklyData = (): DailyStats[] => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayPuffs = puffs
        .filter(puff => puff.timestamp.toDateString() === dateStr)
        .reduce((total, puff) => total + puff.count, 0);
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        puffs: dayPuffs
      });
    }
    return last7Days;
  };

  const getInsight = () => {
    const weekData = getWeeklyData();
    const maxDay = weekData.reduce((max, day) => day.puffs > max.puffs ? day : max);
    const totalWeek = weekData.reduce((sum, day) => sum + day.puffs, 0);
    const avgDaily = Math.round(totalWeek / 7);
    
    if (maxDay.puffs > avgDaily * 1.5) {
      return `You tend to vape more on ${maxDay.date}s`;
    } else if (getTodaysPuffs() < avgDaily) {
      return "You're doing great today! Below your weekly average";
    } else {
      return `Your daily average this week is ${avgDaily} puffs`;
    }
  };

  return {
    puffs,
    addPuff,
    getTodaysPuffs,
    getWeeklyData,
    getInsight,
    dailyGoal,
    setDailyGoal
  };
}