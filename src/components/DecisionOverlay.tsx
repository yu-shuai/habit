import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Flame } from 'lucide-react';
import { Habit } from '../types';

// ─── Confetti Particle ───────────────────────────────────────────────────────
const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#FFEAA7','#A29BFE','#FD79A8','#00B894','#FDCB6E'];
const BLESSINGS = [
  '🎉 太棒了！坚持就是胜利！',
  '🏆 了不起的成就！继续前行！',
  '✨ 成功属于坚持的人！',
  '🌟 你做到了！今天是你的高光时刻！',
  '💪 自律的力量，让你与众不同！',
  '🎊 每一天的坚持，都是写给未来的礼物！',
];

interface Particle { id: number; x: number; y: number; color: string; r: number; dx: number; dy: number; }

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      color: COLORS[i % COLORS.length],
      r: 4 + Math.random() * 6,
      dx: (Math.random() - 0.5) * 4,
      dy: 3 + Math.random() * 4,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.08;
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface DecisionOverlayProps {
  habit: Habit;
  isTeamCreator?: boolean;
  hasTeamVote?: boolean;
  onDecision: (choice: 'cashout' | 'continue', customDays?: number) => void;
}

export default function DecisionOverlay({
  habit, isTeamCreator, hasTeamVote, onDecision
}: DecisionOverlayProps) {
  const [phase, setPhase] = useState<'choice' | 'fireworks'>('choice');
  const [choosing, setChoosing] = useState<'cashout' | 'continue' | null>(null);
  const [customDays, setCustomDays] = useState(habit.totalDays + 30);
  const blessing = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];

  const handleCashout = () => {
    setChoosing('cashout');
    setPhase('fireworks');
    setTimeout(() => onDecision('cashout'), 3000);
  };

  const handleContinue = () => {
    if (customDays <= habit.totalDays) return;
    onDecision('continue', customDays);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center p-6 backdrop-blur-sm"
    >
      <AnimatePresence mode="wait">
        {phase === 'choice' ? (
          <motion.div
            key="choice"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 flex flex-col items-center gap-6 shadow-2xl"
          >
            {/* Trophy */}
            <motion.div
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="text-6xl"
            >
              🏆
            </motion.div>

            <div className="text-center">
              <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">
                挑战完成！
              </h2>
              <p className="text-sm text-neutral-500 mt-2">
                「{habit.name}」已完成 <span className="font-bold text-neutral-900">{habit.totalDays} 天</span>
              </p>
              {isTeamCreator && (
                <p className="text-[10px] text-amber-600 font-bold mt-1 bg-amber-50 px-3 py-1 rounded-full">
                  作为队长，你的决策将发起全队投票
                </p>
              )}
            </div>

            {/* Option A: Cashout */}
            <button
              onClick={handleCashout}
              className="w-full py-4 bg-amber-400 text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
            >
              🏆 见好就收，结束任务
            </button>

            {/* Option B: Continue with custom days */}
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-neutral-50 rounded-2xl p-4">
                <div className="flex flex-col flex-1">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">继续挑战天数</span>
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
              <p className="text-[10px] text-red-400 font-bold text-center">
                ⚠️ 继续挑战将失去保底勋章，失败则一无所获
              </p>
              <button
                onClick={handleContinue}
                disabled={customDays <= habit.totalDays}
                className="w-full py-3 bg-neutral-900 text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-30"
              >
                继续冲刺 {customDays} 天
              </button>
            </div>
          </motion.div>
        ) : (
          /* Fireworks phase */
          <motion.div
            key="fireworks"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <ConfettiCanvas />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10 text-center px-8"
            >
              <div className="text-8xl mb-6">🎊</div>
              <h2 className="text-white font-headline font-black text-3xl italic uppercase tracking-tighter drop-shadow-lg">
                任务归档！
              </h2>
              <p className="text-white/90 text-lg font-bold mt-4 leading-relaxed drop-shadow">
                {blessing}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
