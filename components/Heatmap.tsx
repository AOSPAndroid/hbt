
import React from 'react';
import { Habit } from '../types';

interface HeatmapProps {
  habits: Habit[];
}

const Heatmap: React.FC<HeatmapProps> = ({ habits }) => {
  const daysToShow = 91; // ~3 months
  const today = new Date();
  
  const dates = Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (daysToShow - 1 - i));
    return d.toISOString().split('T')[0];
  });

  const getCompletionCount = (date: string) => {
    return habits.reduce((acc, h) => {
      return acc + (h.entries.some(e => e.date === date && e.completed) ? 1 : 0);
    }, 0);
  };

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    if (count === 1) return 'bg-blue-200';
    if (count === 2) return 'bg-blue-400';
    if (count >= 3) return 'bg-blue-600';
    return 'bg-slate-100';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Consistency Map (90 Days)</h3>
      <div className="flex flex-wrap gap-1">
        {dates.map(date => {
          const count = getCompletionCount(date);
          return (
            <div 
              key={date} 
              className={`heatmap-square ${getColor(count)} transition-colors duration-300`}
              title={`${date}: ${count} habits completed`}
            />
          );
        })}
      </div>
      <div className="flex items-center space-x-2 mt-4 text-[10px] text-slate-400">
        <span>Less</span>
        <div className="w-2 h-2 bg-slate-100 rounded-sm"></div>
        <div className="w-2 h-2 bg-blue-200 rounded-sm"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-sm"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default Heatmap;
