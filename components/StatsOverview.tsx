
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Habit } from '../types';

interface StatsOverviewProps {
  habits: Habit[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ habits }) => {
  // Weekly Trend Data
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const completions = habits.reduce((acc, h) => {
      return acc + (h.entries.some(e => e.date === dateStr && e.completed) ? 1 : 0);
    }, 0);
    return { name: dayName, completions };
  });

  // Category stats
  const categoryStats = habits.reduce((acc, habit) => {
    const completions = habit.entries.filter(e => e.completed).length;
    acc[habit.category] = (acc[habit.category] || 0) + completions;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

  return (
    <div className="space-y-6">
      {/* Weekly Trend Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Weekly Performance Trend</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7DaysData}>
              <defs>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="completions" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Historical Distribution</h3>
        <div className="h-48 w-full">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 italic text-xs">
              Waiting for data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
