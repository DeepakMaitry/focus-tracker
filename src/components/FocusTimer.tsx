"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { supabase } from "../lib/supabase";

interface FocusTimerProps {
  taskId: string;    // Added
  taskName: string;
  onClose: () => void;
  onComplete: () => void; // Added
}

export default function FocusTimer({ taskId, taskName, onClose, onComplete }: FocusTimerProps) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  // Logic to update Supabase
  const handleComplete = async () => {
    const { error } = await supabase
      .from("tasks")
      .update({ is_active: false }) // This "hides" the task
      .eq("id", taskId);

    if (!error) {
      onComplete(); // Refreshes your home page list
      onClose();    // Closes this timer popup
    } else {
      console.error("Error completing task:", error.message);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl">
      <div className="w-full max-w-md p-12 rounded-[48px] bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-10">
        <div>
          <p className="text-blue-500 font-mono text-xs uppercase tracking-[0.3em] mb-3 opacity-80">Deep Work Session</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">{taskName}</h2>
        </div>

        <div className="text-9xl font-black tracking-tighter text-white font-mono tabular-nums">
          {formatTime(seconds)}
        </div>

        <div className="flex flex-col gap-6 items-center">
          <div className="flex gap-4 justify-center w-full">
            <Button 
              onClick={() => setIsActive(!isActive)}
              className={`flex-1 h-14 rounded-full font-black text-sm tracking-widest transition-all duration-500 ${
                isActive 
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300" 
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40"
              }`}
            >
              {isActive ? "PAUSE" : "START"}
            </Button>
            
            <Button 
              onClick={onClose}
              variant="ghost"
              className="flex-1 h-14 rounded-full font-bold text-slate-500 hover:text-white"
            >
              QUIT
            </Button>
          </div>

          {/* New Completion Button */}
          <button 
            onClick={handleComplete}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-400 tracking-[0.2em] uppercase transition-colors"
          >
            ✓ Mark as Completed
          </button>
        </div>
      </div>
    </div>
  );
}
