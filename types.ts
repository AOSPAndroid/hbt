
export type Category = 'Health' | 'Productivity' | 'Learning' | 'Mindfulness' | 'Social' | 'Other';

export interface HabitEntry {
  date: string; // ISO string YYYY-MM-DD
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  category: Category;
  description?: string;
  entries: HabitEntry[];
  createdAt: string;
  targetPerWeek: number;
}

export interface AIInsight {
  summary: string;
  suggestions: string[];
  motivationalQuote: string;
  predictedSuccess: number; // 0-100 percentage
}

export interface UserStats {
  xp: number;
  level: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}
