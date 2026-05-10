import { motion } from 'motion/react';
import { Home, Users, CheckSquare, User, Bell } from 'lucide-react';
import { Tab } from '../types';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAppStore } from '../store/useAppStore';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isDark: boolean;
  setIsCheckInOpen: (open: boolean) => void;
  hasNewFriendRequests?: boolean;
  hasNewFriendPosts?: boolean;
  onOpenNotifications?: () => void;
}

export default function BottomNav({
  activeTab,
  setActiveTab,
  isDark,
  setIsCheckInOpen,
  hasNewFriendRequests,
  hasNewFriendPosts,
  onOpenNotifications,
}: BottomNavProps) {
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const appUpdate = useAppStore(s => s.appUpdate);

  const navItems: { id: Tab; icon: typeof Home; label: string }[] = [
    { id: 'home', icon: Home, label: '首页' },
    { id: 'friends', icon: Users, label: '朋友' },
  ];

  const rightNavItems: { id: Tab; icon: typeof CheckSquare; label: string }[] = [
    { id: 'tasks', icon: CheckSquare, label: '任务' },
    { id: 'me', icon: User, label: '我' },
  ];

  const renderNavBtn = (item: { id: Tab; icon: typeof Home; label: string }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className="flex flex-col items-center gap-1.5 flex-1 group"
      >
        <div className="relative flex flex-col items-center">
          <Icon
            size={22}
            className={`${isActive ? (isDark ? 'text-white' : 'text-black') : isDark ? 'text-white/30' : 'text-neutral-500/40'} group-hover:text-black transition-colors`}
          />
          {item.id === 'friends' && (hasNewFriendRequests || hasNewFriendPosts) && (
            <div className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
          )}
          {item.id === 'me' && appUpdate && (
            <div className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
          )}
          {isActive && (
            <motion.div
              layoutId="nav-dot"
              className={`w-1 h-1 ${isDark ? 'bg-white' : 'bg-black'} rounded-full mt-1.5`}
            />
          )}
        </div>
        <span
          className={`text-[10px] font-bold tracking-widest ${isActive ? (isDark ? 'text-white' : 'text-black') : isDark ? 'text-white/30' : 'text-neutral-500/40'} group-hover:text-black uppercase`}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-40 h-24 ${isDark ? 'bg-black/90 border-white/10' : 'bg-white/95 border-neutral-50'} backdrop-blur-xl flex items-center justify-between px-6 pb-2 border-t transition-all duration-500`}
    >
      {navItems.map(renderNavBtn)}

      {/* Center FAB */}
      <div className="relative -top-6 flex flex-col items-center">
        <motion.button
          onClick={() => setIsCheckInOpen(true)}
          className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Colorful rotating border */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(#4285F4 0deg 90deg, #34A853 90deg 180deg, #FBBC05 180deg 270deg, #EA4335 270deg 360deg)'
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
          />
          {/* Inner purple circle */}
          <div className="absolute inset-[3px] bg-[#8B5CF6] rounded-full flex items-center justify-center shadow-inner">
            <span className="text-xl font-headline font-black text-white">
              打
            </span>
          </div>
        </motion.button>
      </div>

      {rightNavItems.map(renderNavBtn)}

      {/* Notification bell - floating above the nav */}
      {onOpenNotifications && (
        <button
          onClick={onOpenNotifications}
          className="absolute top-3 right-5 p-2 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <Bell size={18} className={isDark ? 'text-white/60' : 'text-neutral-400'} />
          {unreadCount > 0 && (
            <div className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-[9px] font-bold text-white leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </div>
          )}
        </button>
      )}
    </nav>
  );
}
