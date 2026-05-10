import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { useHabitStore, useActivityStore } from '../../store/useContentStore';
import { Camera, Flame, Lock, CheckSquare, Users, Clock, Calendar, ChevronLeft, X, Award, UserMinus, Notebook, Crown } from 'lucide-react';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Habit } from '../../types';
import { MeTabSkeleton } from '../Skeleton';

// Completed task card with delete button (same pattern as HabitCard)
function CompletedTaskCard({
  task,
  claimed,
  completedDate,
  handleDelete,
  setSelectedTaskDetails,
}: {
  task: Habit;
  claimed: boolean;
  completedDate: string;
  handleDelete?: (id: string) => void;
  setSelectedTaskDetails: (task: Habit) => void;
}) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      onClick={() => setSelectedTaskDetails(task)}
      onContextMenu={(e) => { e.preventDefault(); setShowDelete(v => !v); }}
      className="p-5 rounded-[1.5rem] flex items-center gap-4 border border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-white cursor-pointer active:scale-[0.98] transition-transform relative shadow-sm hover:shadow-md hover:border-emerald-200 select-none"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        claimed ? 'bg-emerald-100' : 'bg-emerald-50'
      }`}>
        <Notebook size={18} className={claimed ? 'text-emerald-600' : 'text-emerald-500'} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-emerald-900 truncate">{task.name}</p>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
            task.type === 'team' ? 'text-emerald-600 bg-emerald-100' : 'text-blue-600 bg-blue-50'
          }`}>
            {task.type === 'team' ? '团队' : '个人'}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-[11px] text-emerald-600/70"><Clock size={10} />{task.totalDays}天</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-600/70"><Calendar size={10} />{completedDate}</span>
        </div>
      </div>
      <span
        className={`text-[9px] font-black px-2.5 py-1.5 rounded-full uppercase tracking-wide ${
          claimed ? 'text-emerald-700 bg-emerald-100' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
        }`}
      >
        {claimed ? '已领取' : '已完成'}
      </span>
      <AnimatePresence>
        {showDelete && handleDelete && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(task.id);
              setShowDelete(false);
            }}
            className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center z-20 transition-opacity hover:opacity-70 active:scale-90"
          >
            <X size={16} className="text-red-500" strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MeTabProps {
  isEditingName: boolean;
  setIsEditingName: (editing: boolean) => void;
  isEditingId: boolean;
  setIsEditingId: (editing: boolean) => void;
  tasksSubTab: 'ongoing' | 'completed';
  setTasksSubTab: (tab: 'ongoing' | 'completed') => void;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => void;
  updateProfile: (updates: Partial<{ name: string; avatar: string }>) => Promise<void>;
  updateProfileId: (newId: string) => Promise<void>;
  setSelectedMedal: (medal: { days: number; taskName: string } | null) => void;
  onViewProfile: (userId: string) => void;
  showToast: (message: string) => void;
  handleDelete?: (id: string) => void;
  onDeleteFriend?: (friendId: string) => void;
  onClaimReward?: (habit: Habit) => void;
  totalLikes: number;
  fetchStatus?: string;
  onRefreshLogs?: () => void;
}

const badgeIconForDays = (days: number) => {
  if (days <= 7) return '🔥';
  if (days <= 30) return '⭐';
  if (days <= 90) return '💎';
  if (days <= 180) return '🌙';
  if (days <= 365) return '👑';
  return '🏆';
};

export default function MeTab({
  isEditingName, setIsEditingName,
  isEditingId, setIsEditingId,
  tasksSubTab, setTasksSubTab,
  handleImageUpload, updateProfile, updateProfileId,
  setSelectedMedal, onViewProfile,
  showToast, handleDelete, onDeleteFriend,
  onClaimReward,
  totalLikes,
  fetchStatus,
  onRefreshLogs,
}: MeTabProps) {
  const { userProfile, setUserProfile, friends, followers } = useAppStore();

  const { tasks, completedTasks, setSelectedTaskDetails } = useHabitStore();
  const { activities } = useActivityStore();
  const currentList = tasksSubTab === 'ongoing' ? tasks : completedTasks;
  const [isFriendsListOpen, setIsFriendsListOpen] = useState(false);
  const [isFollowersListOpen, setIsFollowersListOpen] = useState(false);

  const earnedMedals = useMemo(() => {
    const medalActs = (activities || []).filter(a => a.type === 'medal' && (a.user?.id === userProfile.id || (a as any).user_id === userProfile.id));
    return medalActs
      .map(a => {
        const m = /^medal:(\d+)/.exec(a.tag || '');
        const days = m ? Number(m[1]) : null;
        return days ? { days, taskName: (a.content || '').split('·').pop()?.trim().replace(/^「|」$/g, '') || '任务', habitId: a.habitId, createdAt: a.createdAt } : null;
      })
      .filter(Boolean) as { days: number; taskName: string; habitId: string; createdAt: number }[];
  }, [activities, userProfile.id]);

  const hasClaimedReward = useCallback((habitId: string) => {
    return earnedMedals.some(m => m.habitId === habitId);
  }, [earnedMedals]);

  if (fetchStatus === 'fetching...' && !userProfile.id) {
    return <MeTabSkeleton />;
  }

  return (
    <div className="flex flex-col pb-32">
      <div className="flex flex-col items-center gap-6 py-10 px-6">
        <div className="relative p-2 rounded-[3rem] border-2 border-neutral-100 group cursor-pointer">
          <img src={userProfile.avatar} className="w-24 h-24 rounded-[2.5rem] object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-black/20 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={24} />
            <input
              type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"
              onChange={e => handleImageUpload(e, url => { setUserProfile(p => ({ ...p, avatar: url })); updateProfile({ avatar: url }); })}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center border-4 border-white">
            <Flame size={14} className="text-white fill-white" />
          </div>
        </div>

        <div className="text-center flex flex-col items-center gap-1">
          {isEditingName ? (
            <input autoFocus
              className="font-headline font-black text-2xl tracking-tighter italic uppercase bg-neutral-100 px-4 py-1 rounded-xl outline-none text-center"
              value={userProfile.name}
              onChange={e => setUserProfile(p => ({ ...p, name: e.target.value }))}
              onBlur={() => { setIsEditingName(false); updateProfile({ name: userProfile.name }); }}
              onKeyDown={e => { if (e.key === 'Enter') { setIsEditingName(false); updateProfile({ name: userProfile.name }); } }}
            />
          ) : (
            <h2 onClick={() => setIsEditingName(true)}
              className="font-headline font-black text-2xl tracking-tighter italic uppercase hover:opacity-60 transition-opacity cursor-pointer">
              {userProfile.name}
            </h2>
          )}

          {isEditingId ? (
            <input autoFocus
              className="text-[10px] font-black tracking-[0.3em] uppercase bg-neutral-100 px-4 py-1 rounded-lg outline-none text-center mt-1"
              value={userProfile.customId ?? ''}
              onChange={e => setUserProfile(p => ({ ...p, customId: e.target.value }))}
              onBlur={async () => { setIsEditingId(false); await updateProfileId(userProfile.customId ?? ''); }}
              onKeyDown={async e => { if (e.key === 'Enter') { setIsEditingId(false); await updateProfileId(userProfile.customId ?? ''); } }}
            />
          ) : (
            <div className="flex items-center gap-2 group/id">
              <p className="text-[10px] text-neutral-400 font-black tracking-[0.3em] uppercase">
                ID: {userProfile.customId || userProfile.id.substring(0, 8)}
              </p>
              <button 
                onClick={() => setIsEditingId(true)}
                className="text-[10px] text-blue-500 font-bold ml-1 opacity-0 group-hover/id:opacity-100 transition-opacity"
              >
                修改
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-10">
          {[
            { label: '好友', value: friends.length, onClick: () => setIsFriendsListOpen(true) },
            { label: '关注', value: followers.length, onClick: () => setIsFollowersListOpen(true) },
            { label: '获赞', value: totalLikes },
          ].map(s => (
            <div 
              key={s.label} 
              className={`text-center min-w-[60px] ${s.onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
              onClick={s.onClick}
            >
              <p className="text-xl font-headline font-black italic leading-none">{s.value}</p>
              <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>


      <div className="px-6 flex flex-col gap-6 mt-10">

        <div className="flex justify-between items-baseline">
          <h3 className="font-sans font-extrabold text-xl tracking-wider text-neutral-900">勋章墙</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[7, 30, 90, 180, 365, 500].map((days, idx) => {
            const earned = earnedMedals.filter(m => m.days === days).sort((a, b) => b.createdAt - a.createdAt);
            const count = earned.length;
            const isUnlocked = count > 0;
            const latest = earned[0];
            return (
              <motion.div
                key={idx}
                whileTap={{ scale: 0.95 }}
                onClick={() => isUnlocked && latest && setSelectedMedal({ days, taskName: latest.taskName })}
                className="aspect-square bg-white rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm border border-neutral-100 relative"
              >
                <div className={`w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center shadow-inner ${!isUnlocked ? 'grayscale opacity-40' : ''}`}>
                  <span className="text-3xl">
                    {badgeIconForDays(days)}
                  </span>
                  {!isUnlocked && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-black rounded-full flex items-center justify-center border-2 border-white">
                      <Lock size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className={`font-black text-base tracking-tight leading-none ${isUnlocked ? 'text-black' : 'text-neutral-300'}`}>{days}天</span>
                  <span className={`text-[9px] uppercase tracking-widest ${isUnlocked ? 'text-black font-bold' : 'text-neutral-300 font-medium'}`}>
                    {isUnlocked ? `${count}次` : '未解锁'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="px-6 flex flex-col gap-5 mt-10 pb-12">
        <h3 className="font-headline font-black text-lg tracking-widest italic uppercase">我的任务</h3>
        <div className="flex gap-5">
          {(['ongoing', 'completed'] as const).map(tab => (
            <button key={tab} onClick={() => setTasksSubTab(tab)}
              className={`font-headline font-black text-sm tracking-tighter italic transition-all flex-shrink-0 ${tasksSubTab === tab ? 'border-b-2 border-black text-black' : 'text-neutral-300'}`}>
              {tab === 'ongoing' ? '进行中' : '已完成'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentList.map(t => {
            if (tasksSubTab === 'completed') {
              const completedDate = t.archivedAt
                ? new Date(t.archivedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
                : '已完成';
              const claimed = hasClaimedReward(t.id);
              return (
                <CompletedTaskCard
                  task={t}
                  claimed={claimed}
                  completedDate={completedDate}
                  handleDelete={handleDelete}
                  setSelectedTaskDetails={setSelectedTaskDetails}
                />
              );
            }
            return (
              <div key={t.id} onClick={() => setSelectedTaskDetails(t)}
                className={`p-5 rounded-[1.5rem] text-white relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform ${t.type === 'team' ? 'bg-neutral-800' : 'bg-neutral-900'}`}>
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      {t.type === 'team' && (
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Users size={9} /> 团队
                          {t.creatorId === userProfile.id && <Crown size={9} className="text-amber-400" />}
                        </span>
                      )}
                      {t.type !== 'team' && (
                        <span className="text-[9px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">个人</span>
                      )}
                    </div>
                    {t.isCompletedToday && <div className="w-2 h-2 bg-emerald-400 rounded-full" />}
                  </div>
                  <h4 className="text-lg font-headline font-black italic uppercase tracking-tighter mt-1">{t.name}</h4>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-headline font-black italic">{t.currentProgress}</span>
                      <span className="text-[10px] font-black text-white/40">/ {t.totalDays}天</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-3">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${(t.currentProgress / t.totalDays) * 100}%` }} />
                  </div>
                </div>
                <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-12">
                  {t.type === 'team' ? <Users size={80} /> : <CheckSquare size={80} />}
                </div>
              </div>
            );
          })}
          {currentList.length === 0 && (
            <div className="py-14 text-center text-[10px] font-bold text-neutral-300 uppercase tracking-widest italic border-2 border-dashed border-neutral-100 rounded-[2rem]">
              {tasksSubTab === 'ongoing' ? '暂无进行中任务' : '暂无已完成任务'}
            </div>
          )}
        </div>
      </div>

      {(() => {
        const allHabitIds = new Set([
          ...tasks.map(t => t.id),
          ...completedTasks.map(t => t.id),
        ]);
        const orphanActivities = (activities || [])
          .filter(a => {
            const hid = a.habitId || '';
            if (hid === '' || hid === 'null' || hid === 'undefined') return false;
            return !allHabitIds.has(hid) && a.type !== 'medal' && a.user?.id === userProfile.id;
          })
          .sort((a, b) => b.createdAt - a.createdAt);

        if (orphanActivities.length === 0) return null;

        const grouped = orphanActivities.reduce<Record<string, typeof orphanActivities>>((acc, a) => {
          const key = a.tag?.split('·')[0]?.trim() || a.tag || '未知任务';
          if (!acc[key]) acc[key] = [];
          acc[key].push(a);
          return acc;
        }, {});

        return (
          <div className="px-6 flex flex-col gap-5 mt-10 pb-12">
            <h3 className="font-headline font-black text-lg tracking-widest italic uppercase">历史打卡</h3>
            <p className="text-[10px] text-neutral-400 font-bold">以下任务已删除，但打卡记录仍保留</p>
            <div className="flex flex-col gap-6">
              {Object.entries(grouped).map(([taskName, logs]) => (
                <div key={taskName} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-black text-sm italic tracking-tighter text-neutral-700">{taskName}</span>
                    <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">{logs.length} 条记录</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {logs.slice(0, 10).map(log => (
                      <div key={log.id} className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-neutral-400">
                            {log.createdAt ? new Date(log.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                        <p className="text-[12px] text-neutral-600 leading-relaxed">{log.content || '打卡完成'}</p>
                        {log.images && log.images.length > 0 && (
                          <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                            {log.images.map((img, idx) => (
                              <img key={idx} src={img} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-neutral-100" referrerPolicy="no-referrer" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {logs.length > 10 && (
                      <p className="text-[10px] text-neutral-300 font-bold text-center py-2">还有 {logs.length - 10} 条记录</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <AnimatePresence>
        {isFollowersListOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 max-w-lg mx-auto z-[200] bg-neutral-50 flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="bg-white px-6 pt-12 pb-4 flex items-center justify-between border-b border-neutral-100 relative">
              <button
                onClick={() => setIsFollowersListOpen(false)}
                className="p-2 -ml-2 text-neutral-900 active:scale-90 transition-transform"
              >
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>
              <h2 className="font-headline font-black text-xl italic uppercase tracking-tighter absolute left-1/2 -translate-x-1/2">
                关注我的人
              </h2>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-3">
              {followers.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center">
                    <Users size={32} className="text-neutral-300" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    暂无关注者
                  </p>
                </div>
              ) : (
                followers.map((follower: any) => (
                  <div
                    key={follower.id}
                    onClick={() => {
                      onViewProfile(follower.id);
                      setIsFollowersListOpen(false);
                    }}
                    className="bg-white p-4 rounded-2xl flex items-center gap-4 border border-neutral-100 cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
                  >
                    <img 
                      src={follower.avatar || 'https://picsum.photos/seed/default/200/200'} 
                      className="w-12 h-12 rounded-full object-cover shadow-sm border border-neutral-100" 
                      alt={follower.name}
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-neutral-900 truncate">{follower.name}</h4>
                      <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase mt-0.5">
                        ID: {follower.custom_id || follower.id.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFriendsListOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 max-w-lg mx-auto z-[200] bg-neutral-50 flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="bg-white px-6 pt-12 pb-4 flex items-center justify-between border-b border-neutral-100 relative">
              <button
                onClick={() => setIsFriendsListOpen(false)}
                className="p-2 -ml-2 text-neutral-900 active:scale-90 transition-transform"
              >
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>
              <h2 className="font-headline font-black text-xl italic uppercase tracking-tighter absolute left-1/2 -translate-x-1/2">
                我的好友
              </h2>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-3">
              {friends.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center">
                    <Users size={32} className="text-neutral-300" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    您还没有添加任何好友
                  </p>
                </div>
              ) : (
                friends.map((friend: any) => (
                  <div
                    key={friend.id}
                    className="bg-white p-4 rounded-2xl flex items-center gap-4 border border-neutral-100 cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
                  >
                    <img 
                      src={friend.avatar || 'https://picsum.photos/seed/default/200/200'} 
                      className="w-12 h-12 rounded-full object-cover shadow-sm border border-neutral-100" 
                      alt={friend.name}
                      referrerPolicy="no-referrer"
                      onClick={() => {
                        onViewProfile(friend.id);
                        setIsFriendsListOpen(false);
                      }}
                    />
                    <div className="flex-1 min-w-0" onClick={() => {
                      onViewProfile(friend.id);
                      setIsFriendsListOpen(false);
                    }}>
                      <h4 className="font-bold text-sm text-neutral-900 truncate">{friend.name}</h4>
                      <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase mt-0.5">
                        ID: {friend.custom_id || friend.id.substring(0, 8)}
                      </p>
                    </div>
                    {onDeleteFriend && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteFriend(friend.id); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                        title="删除好友"
                      >
                        <UserMinus size={16} className="text-red-400" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
