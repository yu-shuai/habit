import { motion } from 'motion/react';
import { X, Check, ShieldCheck, Flame, Lock } from 'lucide-react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
  key?: string | number;
}

const HabitCard = ({
  habit,
  onCheck,
  onDelete
}: HabitCardProps) => {
  const progressPercent = (habit.currentProgress / habit.totalDays) * 100;
  const isTeamUnstarted = habit.type === 'team' && !habit.isStarted;
  const isArchived = habit.isArchived;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative rounded-[2rem] p-6 editorial-shadow flex items-center justify-between group overflow-hidden ${isArchived ? 'bg-neutral-100 opacity-70' : 'bg-white'}`}
    >
      <button
        onClick={() => onDelete(habit.id)}
        className="absolute top-4 right-4 text-neutral-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={16} />
      </button>

      <div className="flex-1 pr-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className={`font-headline font-bold text-lg tracking-tight ${isArchived ? 'text-neutral-500' : 'text-neutral-900'}`}>
            {habit.name}
          </h3>
          {habit.type === 'team' && (
            <span className="text-[10px] font-bold bg-neutral-100 px-2 py-0.5 rounded tracking-widest uppercase text-neutral-500">
              [团队]
            </span>
          )}
          {isArchived && (
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded tracking-widest uppercase">
              已完成
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className={`text-xs font-medium tracking-wide uppercase ${isArchived ? 'text-neutral-400' : 'text-neutral-400'}`}>
            {isArchived ? '累计 ' : '进度 '}{habit.currentProgress}/{habit.totalDays} 天
          </p>
        </div>

        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isArchived ? 'bg-neutral-200' : 'bg-neutral-50'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full rounded-full ${isArchived ? 'bg-emerald-400' : 'bg-black'}`}
          />
        </div>
      </div>

      <div className="flex-shrink-0">
        <button
          onClick={() => !isArchived && onCheck(habit.id)}
          disabled={habit.isCompletedToday || isTeamUnstarted || isArchived}
          className={`
            w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
            ${isArchived
              ? 'bg-emerald-100 text-emerald-500'
              : habit.isCompletedToday
                ? 'bg-emerald-500 text-white shadow-lg'
                : isTeamUnstarted
                  ? 'bg-neutral-50 text-neutral-100 border-2 border-neutral-100'
                  : 'bg-neutral-50 border-2 border-neutral-100 hover:border-neutral-900'
            }
            ${habit.status === 'punished' && !habit.isCompletedToday && !isArchived ? 'bg-red-50/50' : ''}
          `}
        >
          {isArchived ? (
            <ShieldCheck size={24} />
          ) : habit.isCompletedToday ? (
            <Check size={24} strokeWidth={3} />
          ) : habit.status === 'punished' ? (
            <Flame size={24} className="text-red-500 fill-red-500" />
          ) : isTeamUnstarted ? (
            <Lock size={20} className="text-neutral-200" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-neutral-200 group-hover:bg-neutral-900 transition-colors" />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default HabitCard;