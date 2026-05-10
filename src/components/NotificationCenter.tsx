import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, MessageCircle, Reply, UserPlus, Check, ChevronLeft, Bell, Settings, Volume2, Vibrate, Eye, Rss, UserCheck, AtSign } from 'lucide-react';
import { AppNotification, NotificationType, NotificationPreferences } from '../types';
import { useNotificationStore } from '../store/useNotificationStore';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  onViewProfile?: (userId: string) => void;
  onViewPost?: (postId: string) => void;
  getPreferences: () => NotificationPreferences;
  savePreferences: (prefs: NotificationPreferences) => void;
}

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Heart; label: string; color: string; bg: string }> = {
  like: { icon: Heart, label: '赞了你的动态', color: 'text-red-500', bg: 'bg-red-50' },
  comment: { icon: MessageCircle, label: '评论了你的动态', color: 'text-blue-500', bg: 'bg-blue-50' },
  reply: { icon: Reply, label: '回复了你的评论', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  friend_request: { icon: UserPlus, label: '向你发送了好友申请', color: 'text-amber-500', bg: 'bg-amber-50' },
  friend_accept: { icon: UserCheck, label: '接受了你的好友申请', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  follow: { icon: Rss, label: '关注了你', color: 'text-purple-500', bg: 'bg-purple-50' },
  mention: { icon: AtSign, label: '在评论中提及了你', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  system: { icon: Bell, label: '通知', color: 'text-neutral-500', bg: 'bg-neutral-50' },
};

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  like: '点赞',
  comment: '评论',
  reply: '回复',
  friend_request: '好友申请',
  friend_accept: '好友通过',
  follow: '关注',
  mention: '@提及',
  system: '系统通知',
};

const SOUND_OPTIONS = [
  { id: 'default' as const, label: '默认', emoji: '🔔' },
  { id: 'gentle' as const, label: '轻柔', emoji: '🎵' },
  { id: 'crystal' as const, label: '清脆', emoji: '✨' },
  { id: 'bubble' as const, label: '气泡', emoji: '💧' },
];

const timeAgo = (ts: string) => {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}天前`;
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

export default function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onLoadMore,
  hasMore,
  onViewProfile,
  onViewPost,
  getPreferences,
  savePreferences,
}: NotificationCenterProps) {
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>(getPreferences());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setPrefs(getPreferences());
  }, [isOpen, getPreferences]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMore) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore]);

  const updateTypePref = (type: string, field: 'inApp' | 'sound' | 'vibration', value: boolean) => {
    const key = type as keyof NotificationPreferences;
    const current = prefs[key];
    if (current && typeof current === 'object' && 'inApp' in current) {
      const updated = { ...prefs, [key]: { ...current, [field]: value } };
      setPrefs(updated);
      savePreferences(updated);
    }
  };

  const updateSoundType = (soundType: 'default' | 'gentle' | 'crystal' | 'bubble') => {
    const updated = { ...prefs, soundType };
    setPrefs(updated);
    savePreferences(updated);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 max-w-lg mx-auto z-[300] bg-white flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-white px-6 pt-12 pb-4 flex items-center justify-between border-b border-neutral-100 relative">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-neutral-900 active:scale-90 transition-transform"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
            <h2 className="font-headline font-black text-xl italic uppercase tracking-tighter absolute left-1/2 -translate-x-1/2">
              消息通知
            </h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 -mr-2 text-neutral-400 active:scale-90 transition-transform"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Unread bar */}
          {unreadCount > 0 && !showSettings && (
            <div className="px-6 py-3 bg-neutral-50 flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-bold">{unreadCount} 条未读</span>
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-[#576b95] font-bold hover:underline"
              >
                全部已读
              </button>
            </div>
          )}

          {/* Settings panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-neutral-100"
              >
                <div className="px-6 py-4 space-y-4">
                  <h3 className="text-sm font-bold text-neutral-700">通知设置</h3>

                  {/* Sound type selector */}
                  <div>
                    <p className="text-xs text-neutral-400 mb-2">提示音效</p>
                    <div className="flex gap-2">
                      {SOUND_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => updateSoundType(opt.id)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            prefs.soundType === opt.id
                              ? 'bg-neutral-900 text-white shadow-md'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          <span className="text-base">{opt.emoji}</span>
                          <span className="block mt-0.5">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Per-type settings */}
                  <div className="space-y-3">
                    {Object.entries(NOTIFICATION_TYPE_LABELS).map(([type, label]) => {
                      const typePrefs = prefs[type as keyof NotificationPreferences];
                      if (!typePrefs || typeof typePrefs !== 'object' || !('inApp' in typePrefs)) return null;
                      const tp = typePrefs as { inApp: boolean; sound: boolean; vibration: boolean };
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-700">{label}</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateTypePref(type, 'inApp', !tp.inApp)}
                              className={`p-1.5 rounded-lg transition-colors ${tp.inApp ? 'bg-emerald-50 text-emerald-500' : 'bg-neutral-100 text-neutral-300'}`}
                              title="应用内通知"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => updateTypePref(type, 'sound', !tp.sound)}
                              className={`p-1.5 rounded-lg transition-colors ${tp.sound ? 'bg-blue-50 text-blue-500' : 'bg-neutral-100 text-neutral-300'}`}
                              title="声音"
                            >
                              <Volume2 size={14} />
                            </button>
                            <button
                              onClick={() => updateTypePref(type, 'vibration', !tp.vibration)}
                              className={`p-1.5 rounded-lg transition-colors ${tp.vibration ? 'bg-purple-50 text-purple-500' : 'bg-neutral-100 text-neutral-300'}`}
                              title="震动"
                            >
                              <Vibrate size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notification list */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto"
          >
            {notifications.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-5 text-center">
                <div className="w-20 h-20 bg-neutral-50 rounded-[2rem] flex items-center justify-center">
                  <Bell size={32} className="text-neutral-300" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 italic">
                  暂无通知
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map(n => {
                  const config = TYPE_CONFIG[n.type];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.isRead) onMarkAsRead(n.id);
                        if (n.postId && onViewPost) {
                          onViewPost(n.postId);
                          onClose();
                        } else if (n.actorId) {
                          onViewProfile?.(n.actorId);
                        }
                      }}
                      className={`flex items-start gap-3 px-6 py-4 border-b border-neutral-50 cursor-pointer active:bg-neutral-50 transition-colors relative ${
                        !n.isRead ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {!n.isRead && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-full" />
                      )}
                      <div className="relative flex-shrink-0">
                        <img
                          src={n.actorAvatar || 'https://picsum.photos/seed/default/200/200'}
                          className="w-11 h-11 rounded-full object-cover border border-neutral-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${config.bg} shadow-sm border border-white`}>
                          <Icon size={10} className={config.color} fill={n.type === 'like' ? 'currentColor' : 'none'} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm leading-relaxed">
                          <span className="font-bold text-neutral-900">{n.actorName}</span>
                          <span className="text-neutral-500"> {config.label}</span>
                        </p>
                        {n.content && (
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                            {n.content.length > 40 ? n.content.slice(0, 40) + '...' : n.content}
                          </p>
                        )}
                        {n.postContentPreview && (
                          <p className="text-[10px] text-neutral-300 mt-0.5 truncate">
                            原文: {n.postContentPreview}
                          </p>
                        )}
                        <p className="text-[10px] text-neutral-300 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
                {hasMore && (
                  <div className="py-4 flex justify-center">
                    <div className="w-5 h-5 border-[2.5px] border-neutral-200 border-t-neutral-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
