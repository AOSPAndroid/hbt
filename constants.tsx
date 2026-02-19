
import React from 'react';

export const CATEGORY_COLORS: Record<string, string> = {
  Health: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Productivity: 'bg-blue-100 text-blue-700 border-blue-200',
  Learning: 'bg-purple-100 text-purple-700 border-purple-200',
  Mindfulness: 'bg-amber-100 text-amber-700 border-amber-200',
  Social: 'bg-pink-100 text-pink-700 border-pink-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const CATEGORIES = ['Health', 'Productivity', 'Learning', 'Mindfulness', 'Social', 'Other'] as const;

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
