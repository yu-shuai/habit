import { AnimatePresence, motion } from 'motion/react';

const MOODS = [
  { emoji: '😆', label: '超开心', color: 'from-amber-100 to-amber-50', border: 'border-amber-300', text: 'text-amber-600' },
  { emoji: '😊', label: '开心', color: 'from-emerald-100 to-emerald-50', border: 'border-emerald-300', text: 'text-emerald-600' },
  { emoji: '😐', label: '一般', color: 'from-slate-100 to-slate-50', border: 'border-slate-300', text: 'text-slate-600' },
  { emoji: '😔', label: '低落', color: 'from-blue-100 to-blue-50', border: 'border-blue-300', text: 'text-blue-600' },
  { emoji: '😤', label: '烦躁', color: 'from-rose-100 to-rose-50', border: 'border-rose-300', text: 'text-rose-600' },
  { emoji: '😢', label: '难过', color: 'from-indigo-100 to-indigo-50', border: 'border-indigo-300', text: 'text-indigo-600' },
  { emoji: '🤩', label: '兴奋', color: 'from-purple-100 to-purple-50', border: 'border-purple-300', text: 'text-purple-600' },
  { emoji: '😴', label: '疲惫', color: 'from-cyan-100 to-cyan-50', border: 'border-cyan-300', text: 'text-cyan-600' },
];

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMood: string;
  setCurrentMood: (mood: string) => void;
}

export default function MoodModal({ isOpen, onClose, currentMood, setCurrentMood }: MoodModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center"
          >
            <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter mb-2">
              今天心情如何？
            </h3>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-8">
              选择一个表情来记录你的状态
            </p>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {MOODS.map(m => {
                const isSelected = currentMood === m.emoji;
                return (
                  <motion.button
                    key={m.emoji}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    animate={isSelected ? {
                      scale: [1, 1.15, 1.1],
                      transition: { duration: 0.4, ease: "easeOut" }
                    } : {}}
                    onClick={() => { setCurrentMood(m.emoji); onClose(); }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                      isSelected
                        ? `bg-gradient-to-br ${m.color} ${m.border} border-2 shadow-lg`
                        : 'bg-neutral-50 hover:bg-neutral-100 border-2 border-transparent'
                    }`}
                  >
                    <motion.span
                      className="text-3xl"
                      animate={isSelected ? {
                        rotate: [0, -10, 10, -5, 5, 0],
                        transition: { duration: 0.5, delay: 0.1 }
                      } : {}}
                    >
                      {m.emoji}
                    </motion.span>
                    <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
                      isSelected ? `${m.text}` : 'text-neutral-400'
                    }`}>
                      {m.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <button
              onClick={onClose}
              className="w-full py-4 text-neutral-400 font-headline font-black text-[10px] uppercase tracking-widest"
            >
              取消
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
