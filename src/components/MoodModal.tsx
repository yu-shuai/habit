import { AnimatePresence, motion } from 'motion/react';

const MOODS = [
  { emoji: '😆', label: '超开心' },
  { emoji: '😊', label: '开心' },
  { emoji: '😐', label: '一般' },
  { emoji: '😔', label: '低落' },
  { emoji: '😤', label: '烦躁' },
  { emoji: '😢', label: '难过' },
  { emoji: '🤩', label: '兴奋' },
  { emoji: '😴', label: '疲惫' },
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
              {MOODS.map(m => (
                <motion.button
                  key={m.emoji}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setCurrentMood(m.emoji); onClose(); }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-colors ${
                    currentMood === m.emoji
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${
                    currentMood === m.emoji ? 'text-white/70' : 'text-neutral-400'
                  }`}>
                    {m.label}
                  </span>
                </motion.button>
              ))}
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
