
import React from 'react';
import { Habit, HabitEntry } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete }) => {
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.entries.some(e => e.date === today && e.completed);

  // Get last 7 days status
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const entry = habit.entries.find(e => e.date === dateStr);
    return {
      date: dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      completed: entry?.completed || false,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${CATEGORY_COLORS[habit.category]}`}>
            {habit.category}
          </span>
          <h3 className="text-lg font-bold text-slate-800 mt-2">{habit.name}</h3>
        </div>
        <button 
          onClick={() => onDelete(habit.id)}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        {last7Days.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">{day.dayName}</span>
            <button
              onClick={() => onToggle(habit.id, day.date)}
              className={`w-full aspect-square rounded-md border-2 transition-all ${
                day.completed 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'border-slate-100 bg-slate-50 hover:border-slate-300'
              }`}
            >
              {day.completed && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Target: <span className="font-semibold">{habit.targetPerWeek}x / week</span>
        </div>
        <button
          onClick={() => onToggle(habit.id, today)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            isCompletedToday
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
        >
          {isCompletedToday ? 'Completed Today' : 'Mark Done'}
        </button>
      </div>
    </div>
  );
};

export default HabitCard;
