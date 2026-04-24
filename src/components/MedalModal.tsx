import { AnimatePresence, motion } from 'motion/react';

const MEDAL_CONFIG: Record<number, { emoji: string; color: string; label: string }> = {
  7:   { emoji: '🔥', color: 'from-orange-400 to-red-400',   label: '初燃之志' },
  30:  { emoji: '⭐', color: 'from-yellow-400 to-amber-400', label: '月度挑战者' },
  90:  { emoji: '💎', color: 'from-cyan-400 to-blue-500',    label: '季度铁人' },
  180: { emoji: '🌙', color: 'from-purple-400 to-indigo-500',label: '半年传说' },
  365: { emoji: '👑', color: 'from-amber-400 to-yellow-300', label: '年度王者' },
  500: { emoji: '🏆', color: 'from-emerald-400 to-teal-500', label: '传奇挑战者' },
};

interface MedalModalProps {
  medal: { days: number; taskName: string } | null;
  onClose: () => void;
}

export default function MedalModal({ medal, onClose }: MedalModalProps) {
  const cfg = medal ? MEDAL_CONFIG[medal.days] : null;

  return (
    <AnimatePresence>
      {medal && cfg && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center flex flex-col items-center gap-6"
          >
            {/* Medal */}
            <motion.div
              animate={{ rotate: [-5, 5, -5], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className={`w-28 h-28 rounded-full bg-gradient-to-br ${cfg.color} flex items-center justify-center shadow-2xl`}
            >
              <span className="text-5xl">{cfg.emoji}</span>
            </motion.div>

            {/* Medal info */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                勋章解锁
              </span>
              <h3 className="font-headline font-black text-3xl italic uppercase tracking-tighter">
                {medal.days} 天
              </h3>
              <p className="font-bold text-neutral-600">{cfg.label}</p>
              <p className="text-[11px] text-neutral-400 leading-relaxed px-4">
                在「{medal.taskName}」中坚持 {medal.days} 天，这枚勋章永久属于你。
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-black text-white rounded-2xl font-headline font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
            >
              收下勋章 🎖️
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
