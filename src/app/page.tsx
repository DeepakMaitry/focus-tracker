"use client";

import FocusTimer from "../components/FocusTimer";
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import TaskInput from "../components/TaskInput";

interface Task {
  id: string;
  name: string;
  created_at: string;
  is_active: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // NEW: This sticky note keeps track of which task you clicked
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setTasks(data as Task[]);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-950 text-white pt-20 px-4">
      
      {/* NEW: If activeTask has a name, show the Timer Overlay */}
      {activeTask && (
  <FocusTimer 
    taskId={activeTask.id} 
    taskName={activeTask.name} 
    onClose={() => setActiveTask(null)} 
    onComplete={fetchTasks} // This makes the list refresh!
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
        
        <div className="w-full space-y-4 mt-6">
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
                
                {/* IMPROVED: Clicking this now "sets" the active task */}
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
      </div>
    </main>
  );
}
