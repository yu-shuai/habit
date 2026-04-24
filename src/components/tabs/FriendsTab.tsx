import { AnimatePresence, motion } from 'motion/react';
import MomentItem from '../MomentItem';
import FriendRequestList from './FriendRequestList';
import { Post, FriendSubTab, InteractionScope, Visibility, UserProfile } from '../../types';

interface FriendsTabProps {
  friendSubTab: FriendSubTab;
  setFriendSubTab: (tab: FriendSubTab) => void;
  activities: Post[];
  friends: any[];
  friendRequests: any[];
  userProfile: UserProfile;
  handleLike: (id: string, scope?: InteractionScope) => void;
  handleAddComment: (postId: string, text: string, scope?: InteractionScope) => void;
  handleDeleteComment: (postId: string, commentId: string) => void;
  handleChangeVisibility: (postId: string, visibility: Visibility) => void;
  setSelectedPost: (post: Post | null) => void;
  onAcceptRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onViewProfile: (userId: string) => void;
  hasNewFriendPosts?: boolean;
}

export default function FriendsTab({
  friendSubTab, setFriendSubTab,
  activities, friends, friendRequests,
  userProfile,
  handleLike, handleAddComment, handleDeleteComment, handleChangeVisibility,
  setSelectedPost,
  onAcceptRequest, onRejectRequest, onViewProfile,
  hasNewFriendPosts,
}: FriendsTabProps) {
  const friendIds = new Set(friends.map((f: any) => f.id));

  const friendPosts = activities.filter(
    a => (a.visibility === 'public' || a.visibility === 'friends') && friendIds.has(a.user?.id)
  );

  const tabs: { id: FriendSubTab; label: string }[] = [
    { id: 'feed', label: '动态' },
    { id: 'requests', label: `申请${friendRequests.length > 0 ? ` · ${friendRequests.length}` : ''}` },
  ];

  return (
    <div className="px-5 pt-4 pb-32">
      {/* Sub tabs */}
      <div className="flex gap-6 mb-8">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setFriendSubTab(t.id)}
            className="relative"
          >
            <span className={`text-lg font-headline font-black italic uppercase tracking-tighter transition-colors ${
              friendSubTab === t.id ? 'text-neutral-900' : 'text-neutral-300'
            }`}>
              {t.label}
            </span>
            {friendSubTab === t.id && (
              <motion.div
                layoutId="friend-tab-indicator"
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-neutral-900 rounded-full"
              />
            )}
            {t.id === 'requests' && friendRequests.length > 0 && (
              <div className="absolute -top-0.5 -right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
            {t.id === 'feed' && hasNewFriendPosts && (
              <div className="absolute -top-0.5 -right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {friendSubTab === 'feed' ? (
          <motion.div
            key="feed"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex flex-col gap-6"
          >
            {friendPosts.length > 0 ? (
              friendPosts.map(post => (
                <MomentItem
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  onChangeVisibility={handleChangeVisibility}
                  onViewDetail={setSelectedPost}
                  currentUserProfile={userProfile}
                  currentScope="friends"
                  showScopeSelector={false}
                />
              ))
            ) : (
              <div className="py-20 text-center opacity-30">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-relaxed">
                  暂无好友动态<br />去添加好友吧
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="requests"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <FriendRequestList
              requests={friendRequests}
              onAccept={onAcceptRequest}
              onReject={onRejectRequest}
              onViewProfile={onViewProfile}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
