import { useMemo } from 'react';

interface HeatmapProps {
  logs: any[];
}

export default function Heatmap({ logs }: HeatmapProps) {
  const today = new Date();
  
  // Calculate date range (last 180 days)
  const daysToShow = 182; // ~26 weeks
  const startDate = new Date();
  startDate.setDate(today.getDate() - daysToShow + 1);

  // Group logs by date
  const logCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      const d = log.completed_date;
      if (d) counts[d] = (counts[d] || 0) + 1;
    });
    return counts;
  }, [logs]);

  // Generate date array
  const calendarData = useMemo(() => {
    const data = [];
    for (let i = 0; i < daysToShow; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      data.push({
        date: dateStr,
        count: logCounts[dateStr] || 0,
        dayOfWeek: d.getDay(),
      });
    }
    return data;
  }, [startDate, logCounts, daysToShow]);

  // Determine color based on count
  const getColor = (count: number) => {
    if (count === 0) return 'bg-neutral-100';
    if (count === 1) return 'bg-emerald-200';
    if (count === 2) return 'bg-emerald-400';
    if (count === 3) return 'bg-emerald-600';
    return 'bg-emerald-800';
  };

  return (
    <div className="bg-white p-5 rounded-[2rem] border border-neutral-100 shadow-sm flex flex-col gap-4 overflow-hidden">
      <div className="flex justify-between items-center">
        <h3 className="font-headline font-black text-sm tracking-widest italic uppercase text-neutral-400">打卡热力图</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black uppercase tracking-widest text-neutral-300">少</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-sm bg-neutral-100" />
            <div className="w-2 h-2 rounded-sm bg-emerald-200" />
            <div className="w-2 h-2 rounded-sm bg-emerald-400" />
            <div className="w-2 h-2 rounded-sm bg-emerald-800" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-neutral-300">多</span>
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5">
          {calendarData.map((d, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-[3px] transition-colors ${getColor(d.count)}`}
              title={`${d.date}: ${d.count} 次打卡`}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
          {startDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - 今天
        </p>
        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
          累计 {logs.length} 次记录
        </p>
      </div>
    </div>
  );
}
