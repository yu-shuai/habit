import { AnimatePresence, motion } from 'motion/react';
import MomentItem from './MomentItem';
import { Post, Visibility, InteractionScope, UserProfile } from '../types';

interface PostDetailOverlayProps {
  post: Post | null;
  onClose: () => void;
  onLike: (postId: string, scope?: InteractionScope) => void;
  onAddComment: (postId: string, text: string, scope?: InteractionScope) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onChangeVisibility: (postId: string, visibility: Visibility) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (postId: string) => void;
  currentUserProfile: UserProfile;
}

export default function PostDetailOverlay({
  post, onClose,
  onLike, onAddComment, onDeleteComment, onChangeVisibility, onDeletePost, onEditPost,
  currentUserProfile,
}: PostDetailOverlayProps) {
  return (
    <AnimatePresence>
      {post && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] max-h-[85vh] overflow-y-auto p-6"
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 bg-neutral-200 rounded-full" />
            </div>

            <MomentItem
              post={post}
              onLike={onLike}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              onChangeVisibility={onChangeVisibility}
              onDeletePost={onDeletePost}
              onEditPost={onEditPost}
              currentUserProfile={currentUserProfile}
              showScopeSelector={false}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
