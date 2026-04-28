import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Users, User, X, Flame, AlertTriangle, Lock, Trash2, Trophy, Crown } from 'lucide-react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  currentUserId?: string;
  onCheck: (habitId: string, skipAutoPost?: boolean) => void;
  onDelete: (habitId: string) => void;
  onTeamVote?: (habitId: string, choice: 'continue' | 'cashout', newDays?: number) => void;
}

export default function HabitCard({ habit, currentUserId, onCheck, onDelete, onTeamVote }: HabitCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const isTeam = habit.type === 'team';
  const isCompleted = habit.currentProgress >= habit.totalDays;
  const isPenalty = habit.penaltyMode === true;
  const isFailed = habit.isFailed === true;
  const isCaptainDeleted = habit.captainDeleted === true;
  const isCreator = habit.creatorId === currentUserId;
  const progress = habit.totalDays > 0 ? Math.min(habit.currentProgress / habit.totalDays, 1) : 0;

  const isTeamLocked = isTeam && habit.isStarted && !isFailed && !habit.isArchived && !isCaptainDeleted && !isCreator;

  const cardClass = isCaptainDeleted
    ? 'bg-neutral-200 border-neutral-300'
    : isFailed
    ? 'bg-neutral-700 border-neutral-600'
    : isCompleted
      ? 'bg-gradient-to-br from-amber-500 to-yellow-400 border-transparent'
      : isPenalty
        ? 'bg-gradient-to-br from-red-700 to-rose-600 border-transparent'
        : 'bg-neutral-900 border-neutral-800';

  const barColor = isCaptainDeleted
    ? 'bg-neutral-400'
    : isFailed
    ? 'bg-neutral-500'
    : isCompleted
      ? 'bg-white/80'
      : isPenalty
        ? 'bg-red-300'
        : habit.isCompletedToday
          ? 'bg-emerald-400'
          : 'bg-white/20';

  const btnClass = isCaptainDeleted
    ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
    : isFailed
    ? 'bg-neutral-600 cursor-not-allowed'
    : isCompleted
      ? 'bg-white/30 hover:bg-white/40 cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.4)]'
      : habit.isCompletedToday
        ? 'bg-emerald-400 shadow-[0_4px_20px_rgba(52,211,153,0.55)]'
        : isPenalty
          ? 'bg-white/20 hover:bg-white/30'
          : isTeam && !habit.isStarted
            ? 'bg-white/10 opacity-40 cursor-not-allowed'
            : 'bg-white/10 hover:bg-white/20';

  const canCheck = !isFailed && !isCaptainDeleted && !(isTeam && !habit.isStarted);
  const primaryActionLabel = isCompleted ? '结算/领取' : (habit.isCompletedToday ? '已打卡' : '打卡');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      whileHover={!isFailed && !isCaptainDeleted ? { y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.25)' } : {}}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      onContextMenu={e => { e.preventDefault(); setShowDelete(v => !v); }}
      className={`relative rounded-2xl px-5 py-4 border flex items-center gap-4 ${isCaptainDeleted ? 'text-neutral-500' : 'text-white'} select-none overflow-hidden ${isCompleted && canCheck ? 'cursor-pointer' : ''} ${cardClass}`}
      onClick={() => {
        if (isCaptainDeleted) return;
        if (isCompleted && canCheck) onCheck(habit.id, true);
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

      <div className="relative flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {isTeam && !isFailed && !isCaptainDeleted && (
            <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-400/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <Users size={9} /> 团队
              {isCreator && <Crown size={9} className="text-amber-400" />}
            </span>
          )}
          {!isTeam && !isFailed && !isCaptainDeleted && (
            <span className="flex items-center gap-1 text-[9px] font-black text-blue-400 bg-blue-400/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <User size={9} /> 个人
            </span>
          )}
          {isFailed && (
            <span className="flex items-center gap-1 text-[9px] font-black text-white/70 bg-white/10 px-2 py-0.5 rounded-full uppercase">
              <AlertTriangle size={9} /> 失败
            </span>
          )}
          {isCompleted && !isFailed && !isCaptainDeleted && (
            <span className="text-[9px] font-black text-white/80 bg-white/15 px-2 py-0.5 rounded-full">
              🏆 已完成
            </span>
          )}
          {isTeam && !habit.isStarted && !isFailed && !isCaptainDeleted && (
            <span className="text-[9px] font-black text-white/40 bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
              等待开始
            </span>
          )}
        </div>

        {isCaptainDeleted && (
          <p className="text-[10px] font-bold text-red-400 mt-1">队长已删除该任务</p>
        )}

        <h3 className={`font-headline font-black text-xl italic uppercase tracking-tighter leading-none truncate ${
          isFailed ? 'opacity-40 line-through' : isCaptainDeleted ? 'opacity-50' : ''
        }`}>
          {habit.name}
        </h3>

        {isPenalty && !isFailed && !isCaptainDeleted && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-[10px] font-bold text-red-200 mt-1"
          >
            🔥 需连续打卡 3 天 · 已连 {habit.penaltyDays ?? 0}/3
          </motion.p>
        )}

        <p className={`text-[11px] font-bold mt-1.5 ${isCaptainDeleted ? 'text-neutral-400' : 'text-white/40'}`}>
          进度 {habit.currentProgress}/{habit.totalDays}
        </p>

        <div className="w-full h-1.5 rounded-full overflow-hidden mt-2 bg-white/10">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
      </div>

      <div className="relative flex items-center gap-2 flex-shrink-0">
        {isCaptainDeleted ? (
          <motion.button
            onClick={e => { e.stopPropagation(); onDelete(habit.id); }}
            whileTap={{ scale: 0.85 }}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 cursor-pointer shadow-lg"
          >
            <Trash2 size={22} className="text-white" />
          </motion.button>
        ) : isPenalty && !isFailed ? (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut' }}
            onClick={e => { e.stopPropagation(); canCheck && onCheck(habit.id, true); }}
            className="w-14 h-14 rounded-full bg-red-400 flex items-center justify-center shadow-[0_0_20px_rgba(248,113,113,0.6)] cursor-pointer"
          >
            <Flame size={24} className="text-white fill-white" />
          </motion.div>
        ) : isFailed ? (
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
            <span className="text-2xl">💀</span>
          </div>
        ) : (
          <motion.button
            onClick={e => { e.stopPropagation(); canCheck && onCheck(habit.id); }}
            whileTap={canCheck ? { scale: 0.80 } : {}}
            whileHover={canCheck ? { scale: 1.10 } : {}}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${btnClass}`}
            aria-label={primaryActionLabel}
          >
            {isCompleted ? (
              <Trophy size={22} className="text-white" />
            ) : (
              <Check
                size={24}
                strokeWidth={3}
                className={habit.isCompletedToday ? 'text-white' : 'text-white/50'}
              />
            )}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showDelete && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={(e) => {
              e.stopPropagation();
              if (isTeamLocked) return;
              onDelete(habit.id);
              setShowDelete(false);
            }}
            className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center z-20 transition-opacity hover:opacity-70 active:scale-90"
          >
            {isTeamLocked ? (
              <Lock size={12} className="text-white/40" />
            ) : (
              <X size={16} className="text-red-500" strokeWidth={3} />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* 团队一票否决投票：投票入口在「团队」页卡片右上角 */}
    </motion.div>
  );
}
