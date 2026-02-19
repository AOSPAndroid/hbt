
import React, { useState, useEffect, useCallback } from 'react';
import { Habit, Category, AIInsight, HabitEntry } from './types';
import { CATEGORIES } from './constants';
import HabitCard from './components/HabitCard';
import StatsOverview from './components/StatsOverview';
import { analyzeHabits } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habit-quest-data');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'habits' | 'insights'>('habits');

  // Form State
  const [newHabit, setNewHabit] = useState({ name: '', category: 'Health' as Category, target: 7 });

  // Persistence
  useEffect(() => {
    localStorage.setItem('habit-quest-data', JSON.stringify(habits));
  }, [habits]);

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
    if (confirm('Delete this habit? This cannot be undone.')) {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const toggleHabit = (habitId: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      
      const existingEntryIdx = h.entries.findIndex(e => e.date === date);
      let newEntries: HabitEntry[];

      if (existingEntryIdx > -1) {
        newEntries = [...h.entries];
        newEntries[existingEntryIdx] = { ...newEntries[existingEntryIdx], completed: !newEntries[existingEntryIdx].completed };
      } else {
        newEntries = [...h.entries, { date, completed: true }];
      }

      return { ...h, entries: newEntries };
    }));
  };

  const handleAIAnalysis = async () => {
    if (habits.length === 0) return;
    setIsAnalyzing(true);
    setActiveTab('insights');
    try {
      const insight = await analyzeHabits(habits);
      setAiInsight(insight);
    } catch (err) {
      alert("AI analysis failed. Please check your connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculations
  const totalCompletions = habits.reduce((sum, h) => sum + h.entries.filter(e => e.completed).length, 0);
  const completionRate = habits.length > 0 ? (totalCompletions / (habits.length * 30)) * 100 : 0; // Simple rough estimate

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">HQ</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">HabitQuest <span className="text-blue-600">AI</span></h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>New Habit</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit mb-8">
          <button 
            onClick={() => setActiveTab('habits')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'habits' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => {
              setActiveTab('insights');
              if (!aiInsight) handleAIAnalysis();
            }}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'insights' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.884 6.607a1 1 0 01-.22-.306l-.569-1.174a1 1 0 011.8-.874l.57 1.174a1 1 0 01-1.581 1.18zM14.117 6.607a1 1 0 01-1.581-1.18l.57-1.174a1 1 0 011.8.874l-.569 1.174a1 1 0 01-.22.306zM15 11a1 1 0 11-2 0 1 1 0 012 0zM7 11a1 1 0 11-2 0 1 1 0 012 0zM11 15a1 1 0 10-2 0v1a1 1 0 102 0v-1zM7.116 13.393a1 1 0 011.581 1.18l-.57 1.174a1 1 0 11-1.8-.874l.569-1.174a1 1 0 01.22-.306zM12.884 13.393a1 1 0 01.22.306l.569 1.174a1 1 0 11-1.8.874l-.57-1.174a1 1 0 011.581-1.18z" />
            </svg>
            <span>AI Insights</span>
          </button>
        </div>

        {activeTab === 'habits' ? (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm font-medium">Total Habits</p>
                <p className="text-3xl font-bold text-slate-800">{habits.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm font-medium">Monthly Completions</p>
                <p className="text-3xl font-bold text-emerald-600">{totalCompletions}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-blue-600">{completionRate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <span>My Active Habits</span>
                </h2>
                {habits.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">No habits tracked yet</h3>
                    <p className="text-slate-500 mb-6 max-w-xs mx-auto">Start building a better you by adding your first habit today.</p>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      + Add New Habit
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <StatsOverview habits={habits} />
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="font-bold text-lg mb-2">Need a Boost?</h4>
                    <p className="text-blue-100 text-sm mb-4">Get AI-driven analysis of your performance patterns and custom tips.</p>
                    <button 
                      onClick={handleAIAnalysis}
                      disabled={isAnalyzing}
                      className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors disabled:opacity-70"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Generate AI Insights'}
                    </button>
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-3xl mx-auto">
            {isAnalyzing ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm animate-pulse">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing your patterns...</h3>
                <p className="text-slate-500">Gemini AI is processing your habit history to provide personalized coaching.</p>
              </div>
            ) : aiInsight ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative">
                  <div className="absolute top-0 right-0 p-4">
                    <div className="flex flex-col items-center">
                      <div className="text-[10px] uppercase font-black text-slate-400 mb-1">Success Prob.</div>
                      <div className="text-2xl font-black text-blue-600">{aiInsight.predictedSuccess}%</div>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">AI Performance Summary</h2>
                  <p className="text-slate-600 leading-relaxed text-lg">{aiInsight.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8">
                    <h3 className="text-emerald-800 font-bold text-xl mb-6 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Next Steps
                    </h3>
                    <ul className="space-y-4">
                      {aiInsight.suggestions.map((s, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-6 h-6 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1 shrink-0">{idx + 1}</span>
                          <span className="text-emerald-900 font-medium">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-indigo-900 rounded-2xl p-8 text-white flex flex-col justify-center text-center">
                    <div className="text-indigo-400 mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16C10.9124 16 10.017 16.8954 10.017 18L10.017 21H4.01704V11C4.01704 9.89543 4.91247 9 6.01704 9H18.017C19.1216 9 20.017 9.89543 20.017 11V21H14.017ZM12.017 14C14.7784 14 17.017 11.7614 17.017 9C17.017 6.23858 14.7784 4 12.017 4C9.25562 4 7.01704 6.23858 7.01704 9C7.01704 11.7614 9.25562 14 12.017 14Z" />
                      </svg>
                    </div>
                    <blockquote className="text-xl font-medium italic mb-6">
                      "{aiInsight.motivationalQuote}"
                    </blockquote>
                    <button 
                      onClick={handleAIAnalysis}
                      className="mt-auto text-indigo-300 hover:text-white font-bold transition-colors"
                    >
                      Refresh Analysis
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-400 mb-4">Click below to generate your first AI insight report.</p>
                <button 
                  onClick={handleAIAnalysis}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                >
                  Analyze My Habits
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* New Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-md p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Habit</h2>
            <form onSubmit={addHabit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Habit Name</label>
                <input
                  type="text"
                  placeholder="e.g., Drink 2L Water"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={newHabit.name}
                  onChange={e => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHabit(prev => ({ ...prev, category: cat }))}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        newHabit.category === cat 
                        ? 'bg-blue-50 border-blue-200 text-blue-600' 
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Target frequency</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="7"
                    className="flex-1"
                    value={newHabit.target}
                    onChange={e => setNewHabit(prev => ({ ...prev, target: parseInt(e.target.value) }))}
                  />
                  <span className="text-slate-800 font-bold bg-slate-100 px-3 py-1 rounded-md">{newHabit.target} days/week</span>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-30">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('habits')}
            className={`flex flex-col items-center flex-1 py-2 ${activeTab === 'habits' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-bold mt-1 uppercase">Dashboard</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center -mt-8"
          >
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-slate-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>
          <button 
            onClick={() => {
              setActiveTab('insights');
              if (!aiInsight) handleAIAnalysis();
            }}
            className={`flex flex-col items-center flex-1 py-2 ${activeTab === 'insights' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[10px] font-bold mt-1 uppercase">AI Insights</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
