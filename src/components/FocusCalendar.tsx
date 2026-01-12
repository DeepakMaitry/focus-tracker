"use client";

import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';

interface HeatmapValue {
  date: string;
  count: number;
}

interface FocusCalendarProps {
  completedDates: HeatmapValue[];
}

export default function FocusCalendar({ completedDates }: FocusCalendarProps) {
  // We use the full React.useState to be 100% clear for TypeScript
  const [mounted, setMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  // This handles the Hydration error by showing a placeholder first
  if (!mounted) {
    return <div className="w-full h-32 animate-pulse bg-slate-900/40 rounded-[32px] border border-slate-800/20" />;
  }

  return (
    <div className="w-full bg-slate-900/40 p-6 rounded-[32px] border border-slate-800/50 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em]">Focus Activity</h3>
        <span className="text-xs text-slate-600 font-medium">Last 6 Months</span>
      </div>
      
      <div className="calendar-container">
        <CalendarHeatmap
          startDate={sixMonthsAgo}
          endDate={today}
          values={completedDates}
          classForValue={(value: HeatmapValue | undefined) => {
            if (!value || value.count === 0) return 'fill-slate-800';
            if (value.count === 1) return 'fill-blue-900';
            if (value.count === 2) return 'fill-blue-700';
            return 'fill-blue-500';
          }}
        />
      </div>

      <style jsx global>{`
        .react-calendar-heatmap .fill-slate-800 { fill: #1e293b; }
        .react-calendar-heatmap .fill-blue-900 { fill: #1e3a8a; }
        .react-calendar-heatmap .fill-blue-700 { fill: #1d4ed8; }
        .react-calendar-heatmap .fill-blue-500 { fill: #3b82f6; }
        .react-calendar-heatmap rect { rx: 2px; ry: 2px; } 
      `}</style>
    </div>
  );
}
