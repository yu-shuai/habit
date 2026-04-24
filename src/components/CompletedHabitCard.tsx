import { CheckSquare, Calendar, Clock, X } from 'lucide-react';
import { useState } from 'react';
import { Habit } from '../types';
import { AnimatePresence } from 'motion/react';

interface CompletedHabitCardProps {
  habit: Habit;
  onDelete: (id: string) => void;
}

export default function CompletedHabitCard({ habit, onDelete }: CompletedHabitCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const completedDate = habit.archivedAt
    ? new Date(habit.archivedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '已完成';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onContextMenu={e => { e.preventDefault(); setShowDelete(v => !v); }}
      className="bg-neutral-50 rounded-2xl px-5 py-4 border border-neutral-100 flex items-center gap-4 relative overflow-hidden"
    >
      {/* Check icon */}
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <CheckSquare size={18} className="text-emerald-500" strokeWidth={2.5} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-neutral-700 truncate">{habit.name}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-[11px] text-neutral-400">
            <Clock size={11} />
            {habit.totalDays} 天
          </span>
          <span className="flex items-center gap-1 text-[11px] text-neutral-400">
            <Calendar size={11} />
            {completedDate}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 bg-emerald-50 px-3 py-1.5 rounded-full">
        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">已完成</span>
      </div>

      {/* Top Right: Delete button */}
      <AnimatePresence>
        {showDelete && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={(e) => { 
              e.stopPropagation(); 
              onDelete(habit.id);
              setShowDelete(false); 
            }}
            className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center z-20 transition-opacity hover:opacity-70 active:scale-90"
          >
            <X size={16} className="text-red-500" strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
