import { CheckSquare, Calendar, Clock, X, Users, User } from 'lucide-react';
import { useState } from 'react';
import { Habit } from '../types';
import { motion, AnimatePresence } from 'motion/react';

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
      className="bg-white rounded-2xl px-4 py-3 border border-neutral-200 flex items-center gap-3 relative overflow-hidden"
    >
      <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
        <CheckSquare size={16} className="text-neutral-500" strokeWidth={2.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-neutral-800 truncate">{habit.name}</p>
          <span className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
            habit.type === 'team' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50'
          }`}>
            {habit.type === 'team' ? <Users size={8} /> : <User size={8} />}
            {habit.type === 'team' ? '团队' : '个人'}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
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

      <div className="flex-shrink-0 bg-neutral-100 px-2.5 py-1 rounded-full">
        <span className="text-[10px] font-black text-neutral-600 uppercase tracking-wider">存档</span>
      </div>

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
