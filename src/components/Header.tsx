import { motion } from 'motion/react';
import { Search, Plus, Settings } from 'lucide-react';
import { Tab } from '../types';

interface HeaderProps {
  isDark: boolean;
  currentMood: string;
  activeTab: Tab;
  setIsMoodOpen: (open: boolean) => void;
  setIsModalOpen: (open: boolean) => void;
  setIsSearching: (searching: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

export default function Header({
  isDark,
  currentMood,
  activeTab,
  setIsMoodOpen,
  setIsModalOpen,
  setIsSearching,
  setIsSettingsOpen,
}: HeaderProps) {
  const getHeaderRightIcon = () => {
    switch (activeTab) {
      case 'home':
      case 'friends':
        return <Search size={22} strokeWidth={2.5} />;
      case 'tasks':
        return <Plus size={24} strokeWidth={3} />;
      case 'me':
        return <Settings size={22} strokeWidth={2.5} onClick={() => setIsSettingsOpen(true)} />;
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 ${isDark ? 'bg-black/60' : 'bg-white/80'} backdrop-blur-xl h-20 flex items-center justify-between px-8 shadow-sm transition-all duration-500`}
    >
      <motion.button
        onClick={() => setIsMoodOpen(true)}
        whileHover={{ scale: 1.2, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -2, 0] }}
        transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
        className="text-2xl"
      >
        {currentMood}
      </motion.button>

      <h1
        className={`font-headline font-extrabold text-xl tracking-[0.25em] ${isDark ? 'text-white' : 'text-black'} transition-colors duration-500`}
      >
        HABIT
      </h1>

      <button
        onClick={() => {
          if (activeTab === 'tasks') setIsModalOpen(true);
          else if (activeTab === 'home' || activeTab === 'friends') setIsSearching(true);
          else if (activeTab === 'me') setIsSettingsOpen(true);
        }}
        className={`w-10 h-10 flex items-center justify-center ${isDark ? 'hover:bg-white/10' : 'hover:bg-neutral-100'} rounded-full transition-colors`}
      >
        {getHeaderRightIcon()}
      </button>
    </header>
  );
}
