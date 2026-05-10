import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useHabitStore, useActivityStore } from '../../store/useContentStore';
import MomentItem from '../MomentItem';
import FollowingTab from './FollowingTab';
import { AnimatePresence, motion } from 'motion/react';
import { Copy, Check, Users, X, ThumbsDown, ThumbsUp, Crown } from 'lucide-react';
import { HomeSubTab, Visibility, InteractionScope } from '../../types';
import { copyToClipboard, getTodayString } from '../../utils/app';
import { MomentItemSkeleton, HabitCardSkeleton } from '../Skeleton';


interface HomeTabProps {
  homeSubTab: HomeSubTab;
  setHomeSubTab: (tab: HomeSubTab) => void;
  joinCode: string;
  setJoinCode: (code: string) => void;
  handleJoinTeam: () => void;
  handleStartTeam: (teamId: string) => void;
  handleKickMember: (teamId: string, memberId: string) => void;
  handleLike: (id: string, scope?: InteractionScope) => void;
  handleAddComment: (postId: string, text: string, scope?: InteractionScope, replyToUserId?: string, replyToUserName?: string, replyToCommentId?: string) => void;
  handleDeleteComment: (postId: string, commentId: string) => void;
  handleChangeVisibility: (postId: string, visibility: Visibility) => void;
  handleDeletePost?: (postId: string) => void;
  handleEditPost?: (postId: string) => void;
  handleTeamVote?: (habitId: string, choice: 'continue' | 'cashout', newDays?: number) => void;
  onViewProfile: (userId: string) => void;
  fetchStatus?: string;
  onLoadMore?: () => void;
}


export default function HomeTab({
  homeSubTab, setHomeSubTab,
  joinCode, setJoinCode,
  handleJoinTeam, handleStartTeam, handleKickMember,
  handleLike, handleAddComment, handleDeleteComment, handleChangeVisibility, handleDeletePost, handleEditPost,
  handleTeamVote,
  onViewProfile,
  fetchStatus,
  onLoadMore,
}: HomeTabProps) {

  const { userProfile, followings, toast, setToast } = useAppStore();
  const { tasks, setSelectedTaskDetails } = useHabitStore();
  const { activities, setSelectedPost } = useActivityStore();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };
  const [kickTarget, setKickTarget] = useState<{ teamId: string; memberId: string; memberName: string } | null>(null);

  const TABS: { id: HomeSubTab; label: string }[] = [
    { id: 'discovery', label: '广场' },
    { id: 'team', label: '团队' },
    { id: 'following', label: '关注' },
  ];

  return (
    <div className="flex flex-col pb-32">
      {/* Sub tabs */}
      <div className="flex gap-6 px-5 pt-4 overflow-x-auto no-scrollbar border-b border-neutral-100">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setHomeSubTab(t.id)}
            className={`pb-3 font-headline font-black text-xl tracking-tighter italic transition-all flex-shrink-0 ${
              homeSubTab === t.id ? 'border-b-4 border-black text-black' : 'text-neutral-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Discovery */}
      {homeSubTab === 'discovery' && (
        <div className="flex flex-col pb-10">
          {fetchStatus === 'fetching...' ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="px-5 mb-6"><MomentItemSkeleton /></div>)
          ) : (
            activities.filter(a => a.visibility === 'public').map(post => (
              <MomentItem
                post={post}
                onLike={handleLike} onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment} onChangeVisibility={handleChangeVisibility}
                onDeletePost={handleDeletePost}
                onEditPost={handleEditPost}
                onViewDetail={setSelectedPost} onViewProfile={onViewProfile} currentUserProfile={userProfile} currentScope="public"
              />
            ))
          )}

          {activities.filter(a => a.visibility === 'public').length === 0 && fetchStatus !== 'fetching...' && (
            <div className="py-24 text-center">
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-neutral-300 italic">广场暂无动态</p>
            </div>
          )}
          {activities.filter(a => a.visibility === 'public').length > 0 && fetchStatus !== 'fetching...' && (
            <button
              onClick={onLoadMore}
              className="mt-6 mx-auto bg-neutral-100 text-neutral-400 px-6 py-3 rounded-full font-headline font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
            >
              加载更多
            </button>
          )}
        </div>
      )}

      {/* Following */}
      {homeSubTab === 'following' && (
        <FollowingTab
          activities={activities} followings={followings} userProfile={userProfile}
          onLike={handleLike} onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment} onChangeVisibility={handleChangeVisibility}
          onDeletePost={handleDeletePost}
          onEditPost={handleEditPost}
          setSelectedPost={setSelectedPost}
          onViewProfile={onViewProfile}
        />
      )}

       {/* Team */}
       {homeSubTab === 'team' && (
         <div className="flex flex-col gap-8 px-5 pt-5 pb-12">
           {fetchStatus === 'fetching...' ? (
             Array(2).fill(0).map((_, i) => <HabitCardSkeleton key={i} />)
           ) : (
             <>

          {/* Join code input */}
          <div className="bg-neutral-50 p-5 rounded-[2rem] flex flex-col gap-3 border border-dashed border-neutral-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">加入挑战小队</p>
            <div className="flex gap-2">
              <input
                type="text" placeholder="输入 6 位邀请码"
                value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1 bg-white px-5 py-3 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-black outline-none uppercase tracking-[0.2em]"
              />
              <button onClick={handleJoinTeam}
                className="bg-black text-white px-5 rounded-2xl font-headline font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform">
                加入
              </button>
            </div>
          </div>

          {/* Team cards */}
          {tasks.filter(t => t.type === 'team').map(t => {
            const isCreator = t.creatorId === userProfile.id;
            const isCaptainDeleted = t.captainDeleted === true;
            const isCompleted = t.currentProgress >= t.totalDays;
            const proposal = (t.voteStatus || []).find(v => v.userId === t.creatorId && v.choice === 'continue' && typeof v.newDays === 'number');
            const hasVoted = (t.voteStatus || []).some(v => v.userId === userProfile.id);
            const isVoteOpen = !!proposal && isCompleted && !t.isFailed && !t.isArchived && !isCaptainDeleted;
            const isTimedOut = proposal ? (Date.now() - proposal.votedAt) > 24 * 60 * 60 * 1000 : false;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTaskDetails(t)}
                className={`rounded-[2.5rem] p-7 text-white relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform ${
                  isCaptainDeleted ? 'bg-neutral-300 text-neutral-500' : t.isStarted ? 'bg-neutral-900' : 'bg-neutral-800'
                }`}
              >
                <div className="relative z-10">
                  {/* Captain deleted banner */}
                  {isCaptainDeleted && (
                    <div className="bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest text-center py-2 rounded-2xl mb-4">
                      队长已删除该任务
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                        {t.isStarted ? '进行中' : '等待开始'}
                      </span>
                      <h4 className="text-2xl font-headline font-black italic mt-0.5 leading-none uppercase tracking-tighter">{t.name}</h4>
                    </div>
                    {isVoteOpen && !isCreator && !hasVoted && !isTimedOut && handleTeamVote && (
                      <div className="flex gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); handleTeamVote(t.id, 'continue'); }}
                          className="w-10 h-10 rounded-full bg-emerald-400 text-neutral-900 flex items-center justify-center shadow-lg active:scale-95"
                          title="同意"
                        >
                          <ThumbsUp size={16} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleTeamVote(t.id, 'cashout'); }}
                          className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95"
                          title="拒绝"
                        >
                          <ThumbsDown size={16} />
                        </button>
                      </div>
                    )}
                    {!t.isStarted && isCreator && (
                      <button
                        onClick={e => { e.stopPropagation(); handleStartTeam(t.id); }}
                        className="bg-emerald-400 text-neutral-900 px-4 py-2 rounded-full font-headline font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-lg"
                      >
                        开始挑战
                      </button>
                    )}
                  </div>

                  {isVoteOpen && proposal && (
                    <div className={`mb-5 rounded-[2rem] p-4 border ${isCaptainDeleted ? 'border-transparent' : 'border-white/10'} ${isCaptainDeleted ? '' : 'bg-white/5'}`}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        队长发起加码：目标 {proposal.newDays} 天
                      </p>
                      <p className="text-[10px] font-bold mt-1 text-white/70">
                        规则：一票否决；24 小时未投也视为拒绝（将强制结算）
                      </p>
                      {isCreator && (
                        <p className="text-[10px] font-bold mt-1 text-amber-300">
                          你已发起投票，等待队员表态
                        </p>
                      )}
                      {!isCreator && hasVoted && (
                        <p className="text-[10px] font-bold mt-1 text-emerald-300">
                          你已投票
                        </p>
                      )}
                      {!isCreator && !hasVoted && isTimedOut && (
                        <p className="text-[10px] font-bold mt-1 text-red-300">
                          已超时，将按拒绝处理
                        </p>
                      )}
                    </div>
                  )}

                  {/* Invite code (only before start and for creator) */}
                  {!t.isStarted && t.inviteCode && t.creatorId === userProfile.id && (
                    <div 
                      className="bg-white/5 p-5 rounded-[2rem] flex justify-between items-center mb-6 cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98] border border-white/5" 
                      onClick={async (e) => {
                        e.stopPropagation();
                        const success = await copyToClipboard(t.inviteCode || '');
                        if (success) showToast('邀请码已复制');
                        else showToast('复制失败，请手动输入');
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic">团队邀请码</span>
                        <p className="text-2xl font-headline font-black text-white tracking-[0.25em] uppercase leading-none">{t.inviteCode}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                        <Copy size={20} />
                      </div>
                    </div>
                  )}

                  {/* Members */}
                  <div className="mb-5">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">
                      成员 (已打卡 {t.members?.filter(m => m.lastCheckDate === getTodayString()).length || 0}/{t.members?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {t.members?.map(m => {
                        const hasCheckedIn = m.lastCheckDate === getTodayString();
                        const isCaptain = m.id === t.creatorId;
                        return (
                          <div key={m.id} className="relative group/member">
                            <img
                              src={m.id === userProfile.id ? userProfile.avatar : m.avatar}
                              className={`w-11 h-11 rounded-[1rem] object-cover border-2 ${hasCheckedIn ? 'border-emerald-400' : 'border-white/10'}`}
                              referrerPolicy="no-referrer"
                            />
                            {hasCheckedIn && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-neutral-900 flex items-center justify-center">
                                <Check size={8} className="text-neutral-900" strokeWidth={4} />
                              </div>
                            )}
                            {isCaptain && (
                              <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-amber-400 rounded-full border-2 border-neutral-900 flex items-center justify-center">
                                <Crown size={8} className="text-neutral-900" />
                              </div>
                            )}
                            {/* Kick button (only creator, before start, not self) */}
                            {!t.isStarted && isCreator && m.id !== userProfile.id && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setKickTarget({ teamId: t.id, memberId: m.id, memberName: m.name });
                                }}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/member:opacity-100 transition-opacity border border-neutral-900"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">团队进度</span>
                      <span className="text-lg font-headline font-black italic">{t.currentProgress}/{t.totalDays}</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-1000"
                        style={{ width: `${(t.currentProgress / t.totalDays) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Team check-in content */}
                  {(() => {
                    const teamActivities = activities
                      .filter(a => a.habitId === t.id && a.type !== 'medal')
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .slice(0, 5);
                    if (teamActivities.length === 0) return null;
                    return (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">打卡动态</p>
                        <div className="flex flex-col gap-2">
                          {teamActivities.map(act => (
                            <div key={act.id} className="bg-white/5 rounded-xl px-3 py-2.5">
                              <div className="flex items-center gap-2 mb-1">
                                <img src={act.user.avatar} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                                <span className="text-[10px] font-bold text-white/70">{act.user.name}</span>
                                {act.user.id === t.creatorId && (
                                  <Crown size={10} className="text-amber-400" />
                                )}
                                <span className="text-[9px] text-white/30 ml-auto">
                                  {act.createdAt ? new Date(act.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : ''}
                                </span>
                              </div>
                              {act.content && (
                                <p className="text-[11px] text-white/60 leading-relaxed">{act.content}</p>
                              )}
                              {act.images && act.images.length > 0 && (
                                <div className="flex gap-1 mt-1.5">
                                  {act.images.slice(0, 3).map((img, i) => (
                                    <img key={i} src={img} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="absolute top-[-30px] right-[-30px] opacity-[0.04] rotate-12 scale-150 pointer-events-none">
                  <Users size={120} strokeWidth={4} />
                </div>
              </div>
            );
          })}

          {tasks.filter(t => t.type === 'team').length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-5 opacity-30">
              <div className="w-20 h-20 bg-neutral-50 rounded-[2.5rem] flex items-center justify-center">
                <Users size={32} className="text-neutral-400" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-relaxed">
                集结志同道合的小伙伴<br />开启团队自律之旅
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )}


      {/* Kick member confirm modal */}
      <AnimatePresence>
        {kickTarget && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setKickTarget(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 text-center"
            >
              <h3 className="font-headline font-black text-xl italic uppercase tracking-tighter mb-3">移除成员</h3>
              <p className="text-sm text-neutral-500 mb-8">确定要将「<span className="font-bold text-neutral-900">{kickTarget.memberName}</span>」移出团队吗？</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { handleKickMember(kickTarget.teamId, kickTarget.memberId); setKickTarget(null); }}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest"
                >
                  确认移除
                </button>
                <button
                  onClick={() => setKickTarget(null)}
                  className="w-full py-3 text-neutral-400 font-bold text-sm"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
