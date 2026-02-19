
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
  targetPerWeek: number; // e.g., 7 for daily
}

export interface AIInsight {
  summary: string;
  suggestions: string[];
  motivationalQuote: string;
  predictedSuccess: number; // 0-100 percentage
}

export interface HabitStats {
  totalHabits: number;
  totalCompletions: number;
  currentStreak: number;
  completionRate: number;
}
