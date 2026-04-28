import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, UserCheck, UserPlus, Users, Heart, Eye } from 'lucide-react';
import { Post, UserProfile, Visibility, InteractionScope } from '../types';
import MomentItem from './MomentItem';
import { supabase } from '../lib/supabase';

interface UserProfilePageProps {
  profile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  activities: Post[];
  isFollowing: boolean;
  onFollow: (userId: string) => void;
  onLike: (id: string, scope?: InteractionScope) => void;
  onAddComment: (postId: string, text: string, scope?: InteractionScope) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onChangeVisibility: (postId: string, visibility: Visibility) => void;
  onViewDetail: (post: Post) => void;
  currentUserProfile: UserProfile;
  onSendFriendRequest: (userId: string, message?: string) => void;
}

export default function UserProfilePage({
  profile,
  isOpen,
  onClose,
  activities,
  isFollowing,
  onFollow,
  onLike,
  onAddComment,
  onDeleteComment,
  onChangeVisibility,
  onViewDetail,
  currentUserProfile,
  onSendFriendRequest,
}: UserProfilePageProps) {
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [friendMessage, setFriendMessage] = useState('');
  const [profileStats, setProfileStats] = useState({ friends: 0, followers: 0, likes: 0 });

  useEffect(() => {
    if (!profile?.id || !isOpen) return;
    const fetchStats = async () => {
      const [friendsRes, followersRes, likesRes] = await Promise.all([
        supabase.from('friendships').select('id', { count: 'exact' }).eq('status', 'accepted').or(`requester_id.eq.${profile.id},receiver_id.eq.${profile.id}`),
        supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', profile.id),
        supabase.from('activities').select('liked_by').eq('user_id', profile.id),
      ]);
      const totalLikes = (likesRes.data || []).reduce((sum: number, a: any) => sum + (a.liked_by?.length || 0), 0);
      setProfileStats({
        friends: friendsRes.count || 0,
        followers: followersRes.count || 0,
        likes: totalLikes,
      });
    };
    fetchStats();
  }, [profile?.id, isOpen]);

  if (!profile) return null;

  const userPosts = activities.filter(
    a => a.user.id === profile.id && a.visibility === 'public'
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 max-w-lg mx-auto bg-white z-[350] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-neutral-100">
            <button onClick={onClose} className="p-2 -ml-2">
              <ChevronRight className="rotate-180" size={24} />
            </button>
            <h2 className="font-headline font-black text-lg italic uppercase tracking-tighter">用户主页</h2>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto pb-20">
            <div className="flex flex-col items-center pt-10 pb-8 px-6 gap-5">
              <div className="relative">
                <img
                  src={profile.avatar}
                  className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center">
                <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter">
                  {profile.name}
                </h3>
                <p className="text-[11px] text-neutral-400 font-bold tracking-widest uppercase mt-1">
                  ID: {profile.customId || profile.id.substring(0, 8)}
                </p>
              </div>

              <div className="flex gap-10">
                {[
                  { label: '好友', value: profileStats.friends, icon: Users },
                  { label: '关注者', value: profileStats.followers, icon: Eye },
                  { label: '获赞', value: profileStats.likes, icon: Heart },
                ].map(s => (
                  <div key={s.label} className="text-center min-w-[60px]">
                    <p className="text-xl font-headline font-black italic leading-none">{s.value}</p>
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-1.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {profile.id !== currentUserProfile.id && (
                <div className="w-full mt-2">
                  <AnimatePresence mode="wait">
                    {isAddingFriend ? (
                      <motion.div 
                        key="adding"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-3 w-full"
                      >
                        <input
                          autoFocus
                          maxLength={15}
                          placeholder="打个招呼吧（最多 15 字）..."
                          className="w-full bg-neutral-50 rounded-2xl px-4 py-3 text-sm outline-none border border-neutral-100 focus:border-neutral-300 transition-colors placeholder:text-neutral-300"
                          value={friendMessage}
                          onChange={e => setFriendMessage(e.target.value)}
                        />
                        <div className="flex gap-3">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              onSendFriendRequest(profile.id, friendMessage);
                              setIsAddingFriend(false);
                              setFriendMessage('');
                            }}
                            className="flex-1 py-3 rounded-2xl font-headline font-black text-sm bg-black text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                          >
                            发送申请
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setIsAddingFriend(false);
                              setFriendMessage('');
                            }}
                            className="flex-1 py-3 rounded-2xl font-headline font-black text-sm bg-neutral-100 text-neutral-700 flex items-center justify-center active:scale-95 transition-transform"
                          >
                            取消
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-3 w-full"
                      >
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onFollow(profile.id)}
                          className={`flex-1 py-3 rounded-2xl font-headline font-black text-sm flex items-center justify-center gap-2 transition-colors ${
                            isFollowing
                              ? 'bg-neutral-100 text-neutral-700'
                              : 'bg-neutral-900 text-white'
                          }`}
                        >
                          {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                          {isFollowing ? '已关注' : '关注'}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsAddingFriend(true)}
                          className="flex-1 py-3 rounded-2xl font-headline font-black text-sm bg-neutral-100 text-neutral-700 flex items-center justify-center gap-2"
                        >
                          加好友
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="border-t border-neutral-100">
              <p className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                公开动态
              </p>
              {userPosts.length > 0 ? (
                userPosts.map(post => (
                  <MomentItem
                    key={post.id}
                    post={post}
                    onLike={onLike}
                    onAddComment={onAddComment}
                    onDeleteComment={onDeleteComment}
                    onChangeVisibility={onChangeVisibility}
                    onViewDetail={onViewDetail}
                    currentUserProfile={currentUserProfile}
                    currentScope="public"
                  />
                ))
              ) : (
                <div className="py-16 text-center text-[10px] font-bold text-neutral-300 uppercase tracking-widest italic">
                  暂无公开动态
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
