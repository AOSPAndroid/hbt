
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Habit } from '../types';

interface StatsOverviewProps {
  habits: Habit[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ habits }) => {
  // Calculate completion by category
  const categoryStats = habits.reduce((acc, habit) => {
    const completions = habit.entries.filter(e => e.completed).length;
    acc[habit.category] = (acc[habit.category] || 0) + completions;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Activity by Category</h3>
      <div className="h-64 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: -10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 italic">
            No data recorded yet
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsOverview;
