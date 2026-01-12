"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TaskInput({ onTaskAdded }: { onTaskAdded: () => void }) {
  const [taskName, setTaskName] = useState("");

  const addTask = async () => {
    if (!taskName.trim()) return;

    const { error } = await supabase
      .from("tasks")
      .insert([{ name: taskName }]);

    if (error) {
      console.error("Error adding task:", error);
    } else {
      setTaskName("");
      onTaskAdded(); // This refreshes our list later
    }
  };

  return (
    <div className="flex w-full max-w-md gap-2">
      <Input
        type="text"
        placeholder="What are you working on?"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
      />
      <Button onClick={addTask} className="bg-blue-600 hover:bg-blue-700 text-white">
        Add Task
      </Button>
    </div>
  );
}