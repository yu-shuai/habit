import MomentItem from '../MomentItem';
import { Post, UserProfile, Visibility, InteractionScope } from '../../types';

interface FollowingTabProps {
  activities: Post[];
  followings: string[];
  userProfile: UserProfile;
  onLike: (id: string, scope?: InteractionScope) => void;
  onAddComment: (postId: string, text: string, scope?: InteractionScope) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onChangeVisibility: (postId: string, visibility: Visibility) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (postId: string) => void;
  setSelectedPost: (post: Post | null) => void;
  onViewProfile: (userId: string) => void;
}

export default function FollowingTab({
  activities, followings, userProfile,
  onLike, onAddComment, onDeleteComment, onChangeVisibility, onDeletePost, onEditPost, setSelectedPost,
  onViewProfile,
}: FollowingTabProps) {
  // Public and friends posts from followed users
  const followingPosts = activities
    .filter(a => followings.includes(a.user.id ?? '') && (a.visibility === 'public' || a.visibility === 'friends'))
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="flex flex-col pb-32">
      {followingPosts.length > 0 ? (
        followingPosts.map(post => (
          <MomentItem
            post={post}
            onLike={onLike}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            onChangeVisibility={onChangeVisibility}
            onDeletePost={onDeletePost}
            onEditPost={onEditPost}
            onViewDetail={setSelectedPost}
            onViewProfile={onViewProfile}
            currentUserProfile={userProfile}
            currentScope="public"
          />
        ))
      ) : (
        <div className="py-24 flex flex-col items-center gap-5 text-center">
          <div className="w-20 h-20 bg-neutral-50 rounded-[2rem] flex items-center justify-center">
            <span className="text-3xl">👀</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 italic">
              关注一些人<br />他们的公开动态将出现在这里
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
