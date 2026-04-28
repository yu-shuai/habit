import { AnimatePresence, motion } from 'motion/react';
import { Check, Sun, Moon, Monitor } from 'lucide-react';
import { Visibility } from '../../types';
import { VISIBILITY_OPTIONS } from '../../constants/app';

interface SettingsSheetsProps {
  isAppearanceSheetOpen: boolean;
  setIsAppearanceSheetOpen: (open: boolean) => void;
  appearance: string;
  setAppearance: (appearance: string) => void;
  isVisibilitySheetOpen: boolean;
  setIsVisibilitySheetOpen: (open: boolean) => void;
  defaultVisibility: Visibility;
  setDefaultVisibility: (visibility: Visibility) => void;
}

const APPEARANCE_CARDS = [
  {
    id: 'light',
    label: '浅色',
    icon: Sun,
    preview: { bg: '#ffffff', card: '#f5f5f5', text: '#171717', bar: '#34d399' },
  },
  {
    id: 'dark',
    label: '深色',
    icon: Moon,
    preview: { bg: '#171717', card: '#262626', text: '#ffffff', bar: '#34d399' },
  },
  {
    id: 'system',
    label: '跟随系统',
    icon: Monitor,
    preview: { bg: 'linear-gradient(135deg, #ffffff 50%, #171717 50%)', card: '#e5e5e5', text: '#525252', bar: '#34d399' },
  },
];

export default function SettingsSheets({
  isAppearanceSheetOpen, setIsAppearanceSheetOpen,
  appearance, setAppearance,
  isVisibilitySheetOpen, setIsVisibilitySheetOpen,
  defaultVisibility, setDefaultVisibility,
}: SettingsSheetsProps) {
  const backdropClass = 'absolute inset-0 bg-black/60 backdrop-blur-md';

  return (
    <>
      <AnimatePresence>
        {isAppearanceSheetOpen && (
          <div className="fixed inset-0 z-[300] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAppearanceSheetOpen(false)}
              className={backdropClass}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] p-8 pb-12"
            >
              <div className="flex justify-center mb-6">
                <div className="w-10 h-1 bg-neutral-200 rounded-full" />
              </div>
              <h3 className="font-headline font-black text-xl italic uppercase tracking-tighter mb-8">
                外观模式
              </h3>
              <div className="flex flex-col gap-4">
                {APPEARANCE_CARDS.map(opt => {
                  const Icon = opt.icon;
                  const isActive = appearance === opt.id;
                  const isGradient = opt.id === 'system';
                  return (
                    <button
                      key={opt.id}
                      onClick={() => { setAppearance(opt.id); setIsAppearanceSheetOpen(false); }}
                      className={`relative flex items-center gap-5 p-4 rounded-2xl transition-all border-2 ${
                        isActive
                          ? 'border-neutral-900 bg-neutral-50 shadow-lg'
                          : 'border-neutral-100 bg-white hover:border-neutral-200'
                      }`}
                    >
                      <div
                        className="w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200 shadow-sm relative"
                        style={{ background: opt.preview.bg }}
                      >
                        <div
                          className="absolute top-2 left-2 right-2 h-2 rounded-sm"
                          style={{ backgroundColor: opt.preview.card }}
                        />
                        <div
                          className="absolute top-5 left-2 w-8 h-1.5 rounded-sm"
                          style={{ backgroundColor: opt.preview.text, opacity: 0.3 }}
                        />
                        <div
                          className="absolute bottom-2 left-2 right-2 h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: isGradient ? '#e5e5e5' : opt.preview.card }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ backgroundColor: opt.preview.bar, width: '60%' }}
                          />
                        </div>
                        {isGradient && (
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.6) 50%)' }}>
                            <div className="absolute bottom-2 left-2 right-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#333' }}>
                              <div className="h-full rounded-full" style={{ backgroundColor: opt.preview.bar, width: '60%' }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className={isActive ? 'text-neutral-900' : 'text-neutral-400'} />
                          <span className={`text-sm font-bold ${isActive ? 'text-neutral-900' : 'text-neutral-600'}`}>{opt.label}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {opt.id === 'light' ? '明亮清爽的界面风格' : opt.id === 'dark' ? '护眼舒适的暗色风格' : '根据系统设置自动切换'}
                        </p>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-neutral-900 rounded-full flex items-center justify-center flex-shrink-0"
                        >
                          <Check size={14} className="text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisibilitySheetOpen && (
          <div className="fixed inset-0 z-[300] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsVisibilitySheetOpen(false)}
              className={backdropClass}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] p-8"
            >
              <div className="flex justify-center mb-6">
                <div className="w-10 h-1 bg-neutral-200 rounded-full" />
              </div>
              <h3 className="font-headline font-black text-xl italic uppercase tracking-tighter mb-6">
                默认可见范围
              </h3>
              <div className="flex flex-col gap-2">
                {VISIBILITY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setDefaultVisibility(opt.id); setIsVisibilitySheetOpen(false); }}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-colors ${
                      defaultVisibility === opt.id ? 'bg-neutral-900 text-white' : 'bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="text-sm font-bold">{opt.label}</span>
                    {defaultVisibility === opt.id && <Check size={18} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
