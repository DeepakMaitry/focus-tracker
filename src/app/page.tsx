"use client";

import FocusCalendar from "../components/FocusCalendar";
import FocusTimer from "../components/FocusTimer";
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import TaskInput from "../components/TaskInput";

interface Task {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string; // Added optional updated_at for the calendar
  is_active: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    try {
      // 1. Fetch Active Tasks
      const { data: active, error: activeError } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      // 2. Fetch Completed Tasks (The History)
      const { data: completed, error: completedError } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_active", false)
        .order("updated_at", { ascending: false }) // Now sorting by the column you just added
        .limit(50); // Increased limit to get more data for the calendar

      if (activeError || completedError) throw activeError || completedError;

      setTasks(active || []);
      setCompletedTasks(completed || []); 
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // NEW: Transform completed tasks into a format the heatmap understands
  const getHeatmapData = () => {
    const counts: { [key: string]: number } = {};
    
    completedTasks.forEach((task) => {
      // Use updated_at if it exists, otherwise fallback to created_at
      const dateStr = task.updated_at || task.created_at;
      const date = new Date(dateStr).toISOString().split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    });

    return Object.keys(counts).map(date => ({
      date,
      count: counts[date]
    }));
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-950 text-white pt-20 px-4 pb-20">
      
      {activeTask && (
        <FocusTimer 
          taskId={activeTask.id} 
          taskName={activeTask.name} 
          onClose={() => setActiveTask(null)} 
          onComplete={fetchTasks} 
        />
      )}

      <div className="w-full max-w-2xl flex flex-col items-center gap-10">
        
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
            Focus
          </h1>
          <p className="text-slate-400 font-medium text-lg italic">
            {"\"Deep work is the superpower of the 21st century.\""}
          </p>
        </div>

        <TaskInput onTaskAdded={fetchTasks} />

        {/* --- NEW: STREAK CALENDAR SECTION --- */}
        <div className="w-full mt-4">
          <FocusCalendar completedDates={getHeatmapData()} />
        </div>
        
        {/* --- ACTIVE TASKS SECTION --- */}
        <div className="w-full space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-16 text-slate-700 border-2 border-dashed border-slate-900 rounded-3xl">
              <p className="text-sm font-mono tracking-widest uppercase">No active tasks found</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id} 
                className="group flex items-center justify-between p-6 rounded-3xl bg-slate-900/30 border border-slate-800/50 backdrop-blur-xl hover:border-blue-500/30 hover:bg-slate-900/60 transition-all duration-500 shadow-2xl shadow-black/50"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-slate-100 font-semibold text-xl tracking-tight">
                    {task.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                      Task ID: {task.id.split('-')[0]}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setActiveTask(task)}
                  className="px-6 py-2.5 rounded-full bg-white text-slate-950 text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300 transform active:scale-95 shadow-xl shadow-white/5"
                >
                  Start Focus
                </button>
              </div>
            ))
          )}
        </div>

        {/* --- COMPLETED TASKS (HISTORY) SECTION --- */}
        <div className="mt-10 w-full border-t border-slate-900 pt-10">
          <h3 className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
            Recently Completed
          </h3>
          
          <div className="space-y-3">
            {completedTasks.length === 0 ? (
              <p className="text-slate-700 text-sm italic">Completed tasks will appear here...</p>
            ) : (
              completedTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-900 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <span className="text-slate-400 line-through decoration-slate-700">{task.name}</span>
                  <div className="flex items-center gap-2 text-emerald-500/50">
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Finished</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
