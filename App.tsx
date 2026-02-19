
import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Habit, Category, AIInsight, HabitEntry, UserStats } from './types';
import { CATEGORIES } from './constants';
import HabitCard from './components/HabitCard';
import StatsOverview from './components/StatsOverview';
import Heatmap from './components/Heatmap';
import { analyzeHabits } from './services/geminiService';
import { calculateLevel, calculateStreak } from './utils/habitUtils';

const App: React.FC = () => {
  // State
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habit-quest-data');
    return saved ? JSON.parse(saved) : [];
  });
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('habit-quest-stats');
    return saved ? JSON.parse(saved) : { xp: 0, level: 1, badges: [] };
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'insights' | 'milestones'>('dashboard');

  // Form State
  const [newHabit, setNewHabit] = useState({ name: '', category: 'Health' as Category, target: 7 });

  // Level Logic
  const { level, progress } = calculateLevel(userStats.xp);

  // Persistence
  useEffect(() => {
    localStorage.setItem('habit-quest-data', JSON.stringify(habits));
    localStorage.setItem('habit-quest-stats', JSON.stringify(userStats));
  }, [habits, userStats]);

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.name.trim()) return;

    const habit: Habit = {
      id: crypto.randomUUID(),
      name: newHabit.name,
      category: newHabit.category,
      entries: [],
      createdAt: new Date().toISOString(),
      targetPerWeek: newHabit.target
    };

    setHabits(prev => [habit, ...prev]);
    setNewHabit({ name: '', category: 'Health', target: 7 });
    setIsModalOpen(false);
  };

  const deleteHabit = (id: string) => {
    if (confirm('Delete this habit? Progress will be lost.')) {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const toggleHabit = (habitId: string, date: string) => {
    let wasCompleted = false;
    
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      
      const existingEntryIdx = h.entries.findIndex(e => e.date === date);
      let newEntries: HabitEntry[];

      if (existingEntryIdx > -1) {
        wasCompleted = h.entries[existingEntryIdx].completed;
        newEntries = [...h.entries];
        newEntries[existingEntryIdx] = { ...newEntries[existingEntryIdx], completed: !newEntries[existingEntryIdx].completed };
      } else {
        wasCompleted = false;
        newEntries = [...h.entries, { date, completed: true }];
      }

      // Reward XP if completing for the first time today
      if (!wasCompleted && date === today) {
        setUserStats(s => ({ ...s, xp: s.xp + 10 }));
      }

      return { ...h, entries: newEntries };
    }));
  };

  // Check for daily completion goal (all habits done for today)
  useEffect(() => {
    if (habits.length > 0) {
      const allDone = habits.every(h => h.entries.some(e => e.date === today && e.completed));
      if (allDone) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b']
        });
      }
    }
  }, [habits, today]);

  const handleAIAnalysis = async () => {
    if (habits.length === 0) return;
    setIsAnalyzing(true);
    setActiveTab('insights');
    try {
      const insight = await analyzeHabits(habits);
      setAiInsight(insight);
    } catch (err) {
      alert("AI analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dailyCompletions = habits.filter(h => h.entries.some(e => e.date === today && e.completed)).length;
  const dailyGoal = habits.length > 0 ? habits.length : 1;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Header with Level Progress */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">HQ</div>
            <div>
              <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none">HabitQuest AI</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">LVL {level}</span>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md active:scale-95"
          >
            <span>+ New Habit</span>
          </button>
        </div>
      </header>

      {/* Hero / Daily Goal Section */}
      <div className="bg-white border-b border-slate-200 py-6 mb-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Hello, Pioneer!</h2>
              <p className="text-slate-500 font-medium">You've reached {dailyCompletions} of your {dailyGoal} daily goals today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.334-.398-1.817a1 1 0 00-1.514-.857 4.028 4.028 0 00-1.195 1.513c-.357.733-.51 1.51-.51 2.273 0 3.001 2.451 5.432 5.433 5.432 3.001 0 5.432-2.451 5.432-5.432 0-1.23-.462-2.258-1.101-3.066a8.887 8.887 0 00-1.933-1.896c-.197-.139-.34-.31-.463-.505-.12-.192-.231-.43-.351-.717-.25-.597-.53-1.447-.792-2.422z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase">Daily Goal</div>
                   <div className="text-sm font-black text-slate-800">{Math.round((dailyCompletions / dailyGoal) * 100)}% Complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-2xl w-fit mb-8">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => {
              setActiveTab('insights');
              if (!aiInsight) handleAIAnalysis();
            }}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest flex items-center space-x-2 ${activeTab === 'insights' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            <span>AI Coach</span>
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-slate-800">Your Quests</h2>
              </div>
              
              {habits.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Ready to start?</h3>
                  <p className="text-slate-500 mt-2 mb-8 max-w-xs mx-auto text-sm font-medium">Add your first habit to begin earning XP and unlocking AI insights.</p>
                  <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-200">Create My First Habit</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {habits.map(habit => (
                    <HabitCard 
                      key={habit.id} 
                      habit={habit} 
                      onToggle={toggleHabit}
                      onDelete={deleteHabit}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Heatmap habits={habits} />
              <StatsOverview habits={habits} />
              
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">AI Engine Online</span>
                  </div>
                  <h4 className="font-black text-2xl mb-3">AI Deep Analysis</h4>
                  <p className="text-blue-100 text-sm font-medium mb-6 leading-relaxed">Let Gemini analyze your actual completion patterns and suggest optimized routines.</p>
                  <button 
                    onClick={handleAIAnalysis}
                    disabled={isAnalyzing || habits.length === 0}
                    className="w-full bg-white text-blue-600 font-black py-4 rounded-2xl text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {isAnalyzing ? 'Processing...' : 'Generate My Analysis'}
                  </button>
                </div>
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto pb-12">
            {isAnalyzing ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-blue-50/30 animate-pulse"></div>
                 <div className="relative z-10">
                    <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
                      <svg className="h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">AI Coach Thinking...</h3>
                    <p className="text-slate-500 font-medium">Processing your behavioral data to identify growth opportunities.</p>
                 </div>
              </div>
            ) : aiInsight ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl relative">
                  <div className="absolute top-0 right-0 p-8">
                    <div className="bg-blue-600 rounded-2xl p-4 text-center text-white shadow-xl shadow-blue-200">
                      <div className="text-[10px] uppercase font-black opacity-70 mb-1">Success Prob.</div>
                      <div className="text-3xl font-black">{aiInsight.predictedSuccess}%</div>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 mb-6 tracking-tight">AI Behavioral Insights</h2>
                  <p className="text-slate-600 leading-relaxed text-xl font-medium italic">"{aiInsight.summary}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-10 shadow-lg shadow-emerald-100">
                    <h3 className="text-emerald-900 font-black text-xl mb-8 flex items-center uppercase tracking-widest">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      Action Plan
                    </h3>
                    <ul className="space-y-6">
                      {aiInsight.suggestions.map((s, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-sm font-black mr-4 shrink-0 shadow-md shadow-emerald-200">{idx + 1}</span>
                          <span className="text-emerald-900 font-bold leading-tight mt-1 text-lg">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-10 text-white flex flex-col justify-center text-center shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-500 mb-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16C10.9124 16 10.017 16.8954 10.017 18L10.017 21H4.01704V11C4.01704 9.89543 4.91247 9 6.01704 9H18.017C19.1216 9 20.017 9.89543 20.017 11V21H14.017ZM12.017 14C14.7784 14 17.017 11.7614 17.017 9C17.017 6.23858 14.7784 4 12.017 4C9.25562 4 7.01704 6.23858 7.01704 9C7.01704 11.7614 9.25562 14 12.017 14Z" />
                      </svg>
                      <blockquote className="text-2xl font-black italic mb-8 leading-relaxed">
                        "{aiInsight.motivationalQuote}"
                      </blockquote>
                      <button 
                        onClick={handleAIAnalysis}
                        className="bg-blue-600 text-white font-black px-8 py-4 rounded-2xl hover:bg-blue-500 transition-all text-sm active:scale-95"
                      >
                        Recalculate Analysis
                      </button>
                    </div>
                    {/* Decorative Background */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-8 -mb-8"></div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* New Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">New Quest</h2>
            <form onSubmit={addHabit} className="space-y-8">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Quest Name</label>
                <input
                  type="text"
                  placeholder="e.g., Morning Meditation"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all outline-none font-bold text-slate-800"
                  value={newHabit.name}
                  onChange={e => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Domain</label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHabit(prev => ({ ...prev, category: cat }))}
                      className={`px-4 py-3 rounded-xl text-xs font-black border-2 transition-all ${
                        newHabit.category === cat 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Frequency Goal</label>
                <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <input
                    type="range"
                    min="1"
                    max="7"
                    className="flex-1 accent-blue-600"
                    value={newHabit.target}
                    onChange={e => setNewHabit(prev => ({ ...prev, target: parseInt(e.target.value) }))}
                  />
                  <span className="text-slate-800 font-black text-sm whitespace-nowrap">{newHabit.target}x / Week</span>
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-colors uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-xs"
                >
                  Confirm Quest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <nav className="fixed bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-md rounded-3xl border border-white/10 md:hidden z-40 shadow-2xl">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center flex-1 py-2 ${activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Dash</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center -mt-12"
          >
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/50 border-4 border-slate-900 active:scale-90 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>
          <button 
            onClick={() => {
              setActiveTab('insights');
              if (!aiInsight) handleAIAnalysis();
            }}
            className={`flex flex-col items-center flex-1 py-2 ${activeTab === 'insights' ? 'text-blue-400' : 'text-slate-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">AI Coach</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
