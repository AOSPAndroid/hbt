
import React from 'react';
import { Habit } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { calculateStreak } from '../utils/habitUtils';

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete }) => {
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.entries.some(e => e.date === today && e.completed);
  const streaks = calculateStreak(habit.entries);

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
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
      {/* Streak Badge */}
      <div className="absolute top-4 right-12 flex items-center space-x-1 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
        <span className="text-orange-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.334-.398-1.817a1 1 0 00-1.514-.857 4.028 4.028 0 00-1.195 1.513c-.357.733-.51 1.51-.51 2.273 0 3.001 2.451 5.432 5.433 5.432 3.001 0 5.432-2.451 5.432-5.432 0-1.23-.462-2.258-1.101-3.066a8.887 8.887 0 00-1.933-1.896c-.197-.139-.34-.31-.463-.505-.12-.192-.231-.43-.351-.717-.25-.597-.53-1.447-.792-2.422z" clipRule="evenodd" />
          </svg>
        </span>
        <span className="text-[10px] font-bold text-orange-600">{streaks.current}</span>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[habit.category]}`}>
            {habit.category}
          </span>
          <h3 className="text-lg font-bold text-slate-800 mt-2">{habit.name}</h3>
        </div>
        <button 
          onClick={() => onDelete(habit.id)}
          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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
              className={`w-full aspect-square rounded-md border-2 transition-all flex items-center justify-center ${
                day.completed 
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                : 'border-slate-100 bg-slate-50 hover:border-slate-300'
              }`}
            >
              {day.completed && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
           <div className="text-[10px] text-slate-400 font-bold uppercase">Best Streak</div>
           <div className="text-xs font-bold text-slate-600">{streaks.longest} days</div>
        </div>
        <div className="flex items-center space-x-2">
          {!isCompletedToday && (
            <span className="text-[10px] font-bold text-blue-500 animate-pulse">+10 XP</span>
          )}
          <button
            onClick={() => onToggle(habit.id, today)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              isCompletedToday
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isCompletedToday ? 'Done!' : 'Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
