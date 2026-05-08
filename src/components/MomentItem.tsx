import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, MessageCircle, MoreHorizontal, Globe, Users, Lock } from 'lucide-react';
import { Post, InteractionScope, Visibility, UserProfile } from '../types';

interface MomentItemProps {
  post: Post;
  onLike: (postId: string, scope?: InteractionScope) => void;
  onAddComment: (postId: string, text: string, scope?: InteractionScope) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onChangeVisibility: (postId: string, visibility: Visibility) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (postId: string) => void;
  onViewDetail?: (post: Post | null) => void;
  onViewProfile?: (userId: string) => void;
  currentUserProfile: UserProfile;
  currentScope?: InteractionScope;
  allowedScopes?: InteractionScope[];
  showScopeSelector?: boolean;
}

const SCOPE_LABELS: Record<InteractionScope, string> = {
  public: '广场',
  friends: '朋友',
  team: '团队',
};

const VisibilityIcon = ({ v }: { v: Visibility }) => {
  if (v === 'public') return <Globe size={11} className="text-neutral-400" />;
  if (v === 'friends') return <Users size={11} className="text-neutral-400" />;
  return <Lock size={11} className="text-neutral-400" />;
};

const VISIBILITY_OPTIONS: { id: Visibility; label: string }[] = [
  { id: 'public', label: '公开' },
  { id: 'friends', label: '仅朋友' },
  { id: 'private', label: '仅自己' },
];

export default function MomentItem({
  post,
  onLike,
  onAddComment,
  onDeleteComment,
  onChangeVisibility,
  onViewDetail,
  onViewProfile,
  onDeletePost,
  onEditPost,
  currentUserProfile,
  currentScope = 'public',
}: MomentItemProps) {
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const commentRef = useRef<HTMLInputElement>(null);

  const scopedLikes = post.likedBy.filter(l => l.scope === currentScope);
  const scopedComments = post.comments.filter(c => c.scope === currentScope);
  const isLiked = scopedLikes.some(l => l.userId === currentUserProfile.id);
  const isOwner = post.user.id === currentUserProfile.id;

  const COMMENTS_LIMIT = 6;
  const visibleComments = showAllComments ? scopedComments : scopedComments.slice(0, COMMENTS_LIMIT);
  const hasMoreComments = scopedComments.length > COMMENTS_LIMIT;

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim(), currentScope);
    setCommentText('');
    setShowCommentInput(false);
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return '刚刚';
    if (m < 60) return `${m}分钟前`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}小时前`;
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const isCreatedToday = new Date(post.createdAt).toDateString() === new Date().toDateString();

  return (
    <div className="px-5 py-5 border-b border-neutral-100">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src={post.user.avatar}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer"
          referrerPolicy="no-referrer"
          onClick={() => onViewProfile?.(post.user.id ?? '')}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-neutral-900 truncate">{post.user.name}</p>
            <VisibilityIcon v={post.visibility} />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-neutral-400">{timeAgo(post.createdAt)}</p>
            <span className="text-[10px] text-neutral-300">·</span>
            <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{post.tag}</span>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <MoreHorizontal size={18} className="text-neutral-400" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-8 bg-white rounded-2xl shadow-xl border border-neutral-100 z-50 min-w-[130px] overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  {isCreatedToday && (
                    <button
                      onClick={() => { setShowMenu(false); onEditPost?.(post.id); }}
                      className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-neutral-50"
                    >
                      修改内容
                    </button>
                  )}
                  <button
                    onClick={() => { setShowVisibilityMenu(true); setShowMenu(false); }}
                    className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-neutral-50"
                  >
                    修改权限
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (window.confirm('确定要删除这条动态吗？')) {
                        onDeletePost?.(post.id);
                      }
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    删除动态
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>


      {/* Content */}
      {post.content && (
        <p
          className="text-sm text-neutral-800 leading-relaxed mb-3 cursor-pointer"
          onClick={() => onViewDetail?.(post)}
        >
          {post.content}
        </p>
      )}

      {/* Images */}
      {post.images.length > 0 && (
        <div className={`grid gap-1 mb-3 ${
          post.images.length === 1 ? 'grid-cols-1' :
          post.images.length === 4 ? 'grid-cols-2' : 'grid-cols-3'
        }`}>
          {post.images.map((img, i) => (
            <img
              key={i} src={img}
              onClick={() => setPreviewImage(img)}
              className={`w-full object-cover rounded-xl cursor-pointer ${post.images.length === 1 ? 'max-h-72' : 'aspect-square'}`}
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
      )}

      {/* Action bar - 点赞和评论符号放在最上面 */}
      <div className="flex items-center gap-4 mb-3">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onLike(post.id, currentScope)}
          className="flex items-center gap-1.5 group"
        >
          <Heart
            size={18}
            className={`transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-neutral-400 group-hover:text-red-400'}`}
          />
          {scopedLikes.length > 0 && (
            <span className={`text-xs font-semibold ${isLiked ? 'text-red-500' : 'text-neutral-400'}`}>
              {scopedLikes.length}
            </span>
          )}
        </motion.button>

        <button
          onClick={() => { setShowCommentInput(v => !v); setTimeout(() => commentRef.current?.focus(), 100); }}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-600"
        >
          <MessageCircle size={18} />
          {scopedComments.length > 0 && (
            <span className="text-xs font-semibold">{scopedComments.length}</span>
          )}
        </button>

        <div className="flex-1" />
      </div>

      {/* Likes - 谁点了赞放在中间 */}
      {scopedLikes.length > 0 && (
        <div className="flex items-start gap-2 py-2 px-3 bg-neutral-50 rounded-xl mb-2">
          <Heart size={13} className="text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" />
          <p className="text-xs text-[#576b95] leading-relaxed">
            {scopedLikes.map(l => l.name).join('、')}
          </p>
        </div>
      )}

      {/* Comments - 评论内容放在最后，只显示6条其他折叠 */}
      {scopedComments.length > 0 && (
        <div className="bg-neutral-50 rounded-xl px-3 py-2 mb-2 flex flex-col gap-1.5">
          {visibleComments.map(c => (
            <div
              key={c.id}
              className={`flex items-start gap-1.5 group relative ${c.userId === currentUserProfile.id ? 'cursor-pointer' : ''}`}
              onContextMenu={c.userId === currentUserProfile.id ? e => { e.preventDefault(); setDeleteTarget(prev => prev === c.id ? null : c.id); } : undefined}
            >
              <span className="text-[#576b95] text-xs font-semibold flex-shrink-0">{c.user}:</span>
              <span className="text-xs text-neutral-700 flex-1">{c.text}</span>
              {deleteTarget === c.id && (
                <button
                  onClick={() => { onDeleteComment(post.id, c.id); setDeleteTarget(null); }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full"
                >
                  删除
                </button>
              )}
              {deleteTarget === null && c.userId === currentUserProfile.id && (
                <span className="text-[10px] text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">长按</span>
              )}
            </div>
          ))}
          {/* 展开/折叠按钮 */}
          {hasMoreComments && (
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="text-xs text-[#576b95] py-1 text-left hover:underline"
            >
              {showAllComments ? '收起' : `展开更多 ${scopedComments.length - COMMENTS_LIMIT} 条评论`}
            </button>
          )}
        </div>
      )}

      {/* Comment input */}
      <AnimatePresence>
        {showCommentInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex gap-2 overflow-hidden"
          >
            <input
              ref={commentRef}
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSubmitComment();
                if (e.key === 'Escape') setShowCommentInput(false);
              }}
              placeholder="发表评论..."
              className="flex-1 bg-neutral-100 rounded-full px-4 py-2 text-sm outline-none"
            />
            <button
              onClick={handleSubmitComment}
              className="bg-neutral-900 text-white px-4 rounded-full text-xs font-bold"
            >
              发送
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visibility sheet */}
      <AnimatePresence>
        {showVisibilityMenu && (
          <div className="fixed inset-0 z-[400] flex items-end justify-center" onClick={() => setShowVisibilityMenu(false)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="relative bg-white w-full max-w-lg rounded-t-[2rem] p-6 pb-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto mb-6" />
              <h4 className="text-center font-black text-base mb-4">修改可见范围</h4>
              {VISIBILITY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { onChangeVisibility(post.id, opt.id); setShowVisibilityMenu(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-colors ${post.visibility === opt.id ? 'bg-neutral-100 font-bold' : 'hover:bg-neutral-50'}`}
                >
                  <span className="text-sm">{opt.label}</span>
                  {post.visibility === opt.id && <span className="ml-auto text-emerald-500 font-bold text-xs">当前</span>}
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-[500] bg-black/90 flex items-center justify-center p-4"
          >
            <img src={previewImage} className="max-w-full max-h-full rounded-xl object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
