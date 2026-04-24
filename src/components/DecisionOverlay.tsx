import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Users } from 'lucide-react';
import { Habit } from '../types';

const DecisionOverlay = ({
  habit,
  onDecision
}: {
  habit: Habit;
  onDecision: (choice: 'cashout' | 'continue') => void;
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [votes, setVotes] = useState<number>(0);
  const teamSize = 6;

  const handleContinue = () => {
    if (habit.type === 'team') {
      setIsVoting(true);
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setVotes(count);
        if (count === teamSize) {
          clearInterval(interval);
          setTimeout(() => onDecision('continue'), 1000);
        }
      }, 500);
    } else {
      onDecision('continue');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8 text-white select-none"
    >
      <AnimatePresence mode="wait">
        {!isVoting ? (
          <motion.div
            key="choice"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, y: -20 }}
            className="max-w-md w-full"
          >
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  boxShadow: ["0 0 20px rgba(255,255,255,0.1)", "0 0 60px rgba(255,255,255,0.3)", "0 0 20px rgba(255,255,255,0.1)"],
                  scale: [1, 1.05, 1]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 mb-10 bg-white text-black rounded-3xl flex items-center justify-center rotate-12"
              >
                <Check size={48} strokeWidth={4} />
              </motion.div>

              <h2 className="text-5xl font-headline font-black mb-2 uppercase tracking-tighter leading-none italic">
                目标升级
              </h2>
              <p className="text-neutral-500 font-bold tracking-[0.2em] uppercase text-[10px] mb-12">
                挑战达成: {habit.totalDays} 天
              </p>

              <p className="text-neutral-400 font-medium mb-16 leading-relaxed text-sm">
                获得保底勋章并结束任务，<br />
                或者挑战下一阶目标？如果失败，你将失去当前的阶梯勋章。
              </p>

              <div className="flex flex-col gap-4 w-full px-4">
                <button
                  onClick={handleContinue}
                  className="group relative overflow-hidden w-full py-6 bg-white text-black rounded-2xl font-headline font-black text-xl active:scale-95 transition-transform"
                >
                  <span className="relative z-10">继续挑战</span>
                  <motion.div
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-neutral-200/50"
                  />
                </button>
                <button
                  onClick={() => onDecision('cashout')}
                  className="w-full py-5 text-neutral-500 hover:text-white font-headline font-bold text-sm tracking-widest uppercase transition-colors"
                >
                  见好就收 (领取本阶勋章)
                </button>
              </div>
            </div>

            {habit.type === 'team' && (
              <div className="mt-12 pt-8 border-t border-white/10 opacity-30 flex items-center justify-center gap-3">
                <Users size={12} />
                <span className="text-[10px] font-bold tracking-widest uppercase italic">需团队同步</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="voting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center w-full max-w-sm"
          >
            <div className="mb-16 flex flex-col items-center">
              <h3 className="text-4xl font-headline font-black mb-3 tracking-tighter uppercase italic">
                团队投票中
              </h3>
              <p className="text-neutral-500 font-bold tracking-[0.4em] uppercase text-[9px]">
                正在同步队友意见
              </p>
            </div>

            <div className="flex flex-col gap-6 w-full mb-20">
              {Array.from({ length: teamSize }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                      0{i + 1}
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">队友</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {i < votes ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-emerald-400 font-black text-[10px] tracking-widest uppercase italic"
                      >
                        同意
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-12 h-0.5 bg-white/10"
                      />
                    )}
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${i < votes ? 'bg-white border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-white/10'}`}>
                      {i < votes && <Check size={14} className="text-black" strokeWidth={4} />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
              <motion.div
                animate={{ width: `${(votes / teamSize) * 100}%` }}
                className="absolute inset-y-0 left-0 bg-white"
              />
            </div>
            <p className="mt-6 text-[10px] font-black tracking-[0.5em] uppercase italic text-white/40">
              已收集 {votes}/{teamSize} 票
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DecisionOverlay;