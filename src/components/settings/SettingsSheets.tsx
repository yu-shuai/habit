import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Visibility } from '../../types';
import { APPEARANCE_OPTIONS, VISIBILITY_OPTIONS } from '../../constants/app';

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

export default function SettingsSheets({
  isAppearanceSheetOpen, setIsAppearanceSheetOpen,
  appearance, setAppearance,
  isVisibilitySheetOpen, setIsVisibilitySheetOpen,
  defaultVisibility, setDefaultVisibility,
}: SettingsSheetsProps) {
  const backdropClass = 'absolute inset-0 bg-black/60 backdrop-blur-md';

  return (
    <>
      {/* Appearance sheet */}
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
              className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] p-8"
            >
              <div className="flex justify-center mb-6">
                <div className="w-10 h-1 bg-neutral-200 rounded-full" />
              </div>
              <h3 className="font-headline font-black text-xl italic uppercase tracking-tighter mb-6">
                外观模式
              </h3>
              <div className="flex flex-col gap-2">
                {APPEARANCE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setAppearance(opt.id); setIsAppearanceSheetOpen(false); }}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-colors ${
                      appearance === opt.id ? 'bg-neutral-900 text-white' : 'bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="text-sm font-bold">{opt.label}</span>
                    {appearance === opt.id && <Check size={18} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visibility sheet */}
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
