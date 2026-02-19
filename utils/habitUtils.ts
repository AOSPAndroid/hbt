
import { Habit, HabitEntry } from '../types';

export const calculateStreak = (entries: HabitEntry[]): { current: number; longest: number } => {
  if (entries.length === 0) return { current: 0, longest: 0 };

  const sortedDates = entries
    .filter(e => e.completed)
    .map(e => e.date)
    .sort((a, b) => b.localeCompare(a));

  if (sortedDates.length === 0) return { current: 0, longest: 0 };

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Check current streak
  let checkDate = sortedDates.includes(today) ? today : sortedDates.includes(yesterday) ? yesterday : null;
  
  if (checkDate) {
    let d = new Date(checkDate);
    while (sortedDates.includes(d.toISOString().split('T')[0])) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    }
  }

  // Calculate longest streak
  const sortedAsc = [...sortedDates].sort((a, b) => a.localeCompare(b));
  let lastDate: Date | null = null;

  for (const dateStr of sortedAsc) {
    const currentDate = new Date(dateStr);
    if (!lastDate) {
      tempStreak = 1;
    } else {
      const diff = (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    lastDate = currentDate;
  }

  return { current: currentStreak, longest: longestStreak };
};

export const getXpForLevel = (level: number) => level * 100 * Math.pow(1.1, level - 1);

export const calculateLevel = (xp: number) => {
  let level = 1;
  while (xp >= getXpForLevel(level)) {
    xp -= getXpForLevel(level);
    level++;
  }
  return { level, progress: (xp / getXpForLevel(level)) * 100 };
};
