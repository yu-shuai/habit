import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Habit } from '../types';

interface TeamVoteModalProps {
  habit: Habit;
  onVote: (habitId: string, choice: 'continue' | 'cashout', newDays?: number) => void;
  onClose: () => void;
}

export default function TeamVoteModal({ habit, onVote, onClose }: TeamVoteModalProps) {
  const [customDays, setCustomDays] = useState(habit.totalDays + 30);
  const [confirmChoice, setConfirmChoice] = useState<'continue' | 'cashout' | null>(null);

  const handleConfirm = () => {
    if (!confirmChoice) return;
    onVote(habit.id, confirmChoice, confirmChoice === 'continue' ? customDays : undefined);
    setConfirmChoice(null);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 flex flex-col items-center gap-5 shadow-2xl"
      >
        <div className="text-5xl">🔥</div>
        <div className="text-center">
          <h2 className="font-headline font-black text-xl italic uppercase tracking-tighter text-neutral-900">
            团队加码投票
          </h2>
          <p className="text-sm text-neutral-500 mt-2">
            「{habit.name}」已完成 <span className="font-bold text-neutral-900">{habit.totalDays} 天</span>
          </p>
          <p className="text-[10px] text-amber-600 font-bold mt-1 bg-amber-50 px-3 py-1 rounded-full">
            一票否决制：1人不同意或24小时未选 → 全队结算
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center gap-3 bg-neutral-50 rounded-2xl p-4">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">加码天数</span>
              <input
                type="number"
                min={habit.totalDays + 1}
                value={customDays}
                onChange={e => setCustomDays(Number(e.target.value))}
                className="text-2xl font-headline font-black bg-transparent outline-none w-full"
              />
              <span className="text-[10px] text-neutral-400">当前：{habit.totalDays} 天</span>
            </div>
            <div className="flex gap-2">
              {[30, 60, 90].map(d => (
                <button key={d}
                  onClick={() => setCustomDays(habit.totalDays + d)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-colors ${
                    customDays === habit.totalDays + d ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  +{d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setConfirmChoice('continue')}
            disabled={customDays <= habit.totalDays}
            className="w-full py-3 bg-neutral-900 text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-30"
          >
            同意加码 {customDays} 天
          </button>

          <button
            onClick={() => setConfirmChoice('cashout')}
            className="w-full py-3 bg-amber-400 text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
          >
            不同意，结束任务
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {confirmChoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[310] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmChoice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] w-full max-w-xs p-8 text-center shadow-2xl"
            >
              <h3 className="font-headline font-black text-lg italic uppercase tracking-tighter mb-3">
                确认投票
              </h3>
              <p className="text-sm text-neutral-500 mb-6">
                {confirmChoice === 'continue'
                  ? `确定同意加码至 ${customDays} 天？`
                  : '确定不同意加码？这将触发全队结算。'}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirm}
                  className="w-full py-3 bg-neutral-900 text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
                >
                  确认
                </button>
                <button
                  onClick={() => setConfirmChoice(null)}
                  className="w-full py-2 text-neutral-400 font-bold text-sm"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
