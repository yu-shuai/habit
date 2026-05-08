import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { useActivityStore } from '../../store/useContentStore';
import MomentItem from '../MomentItem';
import FriendRequestList from './FriendRequestList';
import { FriendSubTab, InteractionScope, Visibility } from '../../types';
import { MomentItemSkeleton } from '../Skeleton';

interface FriendsTabProps {
  friendSubTab: FriendSubTab;
  setFriendSubTab: (tab: FriendSubTab) => void;
  handleLike: (id: string, scope?: InteractionScope) => void;
  handleAddComment: (postId: string, text: string, scope?: InteractionScope) => void;
  handleDeleteComment: (postId: string, commentId: string) => void;
  handleChangeVisibility: (postId: string, visibility: Visibility) => void;
  handleDeletePost?: (postId: string) => void;
  handleEditPost?: (postId: string) => void;
  onAcceptRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onViewProfile: (userId: string) => void;
  hasNewFriendPosts?: boolean;
  fetchStatus?: string;
  onLoadMore?: () => void;
}


export default function FriendsTab({
  friendSubTab, setFriendSubTab,
  handleLike, handleAddComment, handleDeleteComment, handleChangeVisibility, handleDeletePost, handleEditPost,
  onAcceptRequest, onRejectRequest, onViewProfile,
  hasNewFriendPosts,
  fetchStatus,
  onLoadMore,
}: FriendsTabProps) {

  const { userProfile, friends, friendRequests } = useAppStore();
  const { activities, setSelectedPost } = useActivityStore();

  const friendIds = new Set(friends.map((f: any) => f.id));
  const currentUserId = userProfile.id;

  const friendPosts = activities.filter(
    a => (a.visibility === 'friends' || a.visibility === 'public') && (friendIds.has(a.user?.id) || a.user?.id === currentUserId)
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
            {fetchStatus === 'fetching...' ? (
              Array(3).fill(0).map((_, i) => <MomentItemSkeleton key={i} />)
            ) : (
              friendPosts.length > 0 ? (
                friendPosts.map(post => (
                  <MomentItem
                    post={post}
                    onLike={handleLike}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    onChangeVisibility={handleChangeVisibility}
                    onDeletePost={handleDeletePost}
                    onEditPost={handleEditPost}
                    onViewDetail={setSelectedPost}
                    onViewProfile={onViewProfile}
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
              )
            )}
            {friendPosts.length > 0 && fetchStatus !== 'fetching...' && (
              <button
                onClick={onLoadMore}
                className="mt-6 mx-auto bg-neutral-100 text-neutral-400 px-6 py-3 rounded-full font-headline font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
              >
                加载更多
              </button>
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
