import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, MessageCircle, MoreHorizontal } from 'lucide-react';
import { Post, Visibility, InteractionScope } from '../types';

const MomentItem = ({
  post,
  onDelete,
  onEdit,
  onLike,
  onAddComment,
  onDeleteComment,
  onViewDetail,
  onChangeVisibility,
  currentUserProfile,
  currentScope = 'public',
  showScopeSelector = false,
  allowedScopes = ['public', 'friends', 'team']
}: {
  post: Post;
  onDelete?: (id: string) => void;
  onEdit?: (post: Post) => void;
  onLike?: (id: string, scope: InteractionScope) => void;
  onAddComment?: (postId: string, text: string, scope: InteractionScope) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onViewDetail?: (post: Post) => void;
  onChangeVisibility?: (postId: string, visibility: Visibility) => void;
  currentUserProfile?: { id: string; name: string; avatar: string };
  currentScope?: InteractionScope;
  showScopeSelector?: boolean;
  allowedScopes?: InteractionScope[];
  key?: string | number
}) => {
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [activeViewScope, setActiveViewScope] = useState<InteractionScope>(currentScope);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setActiveViewScope(currentScope);
  }, [currentScope]);

  const displayUser = useMemo(() => {
    if (currentUserProfile && post.user.id === currentUserProfile.id) {
      return currentUserProfile;
    }
    return post.user;
  }, [post.user, currentUserProfile]);

  const timeStr = useMemo(() => {
    const date = new Date(post.createdAt);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }, [post.createdAt]);

  const filteredLikes = useMemo(() => {
    return post.likedBy.filter(l => l.scope === activeViewScope);
  }, [post.likedBy, activeViewScope]);

  const filteredComments = useMemo(() => {
    return post.comments.filter(c => c.scope === activeViewScope);
  }, [post.comments, activeViewScope]);

  const isLikedByMe = useMemo(() => {
    return post.likedBy.some(l => l.userId === currentUserProfile?.id && l.scope === activeViewScope);
  }, [post.likedBy, currentUserProfile, activeViewScope]);

  const visibleComments = showAllComments ? filteredComments : filteredComments.slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => onViewDetail?.(post)}
      className="flex gap-4 px-6 py-6 border-b border-neutral-50 last:border-none bg-white cursor-pointer active:bg-neutral-50 transition-colors"
    >
      <img
        src={displayUser.avatar}
        className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
        referrerPolicy="no-referrer"
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[#576b95] text-sm tracking-tight">{displayUser.name}</h4>
          {showScopeSelector && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-2xl border border-neutral-100 z-50 overflow-hidden"
                  >
                    {allowedScopes.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setActiveViewScope(s);
                          if (s !== post.visibility && onChangeVisibility) {
                            onChangeVisibility(post.id, s as Visibility);
                          }
                          setIsMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-left transition-colors ${activeViewScope === s ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50 text-neutral-400'}`}
                      >
                        {s === 'public' ? '广场' : s === 'friends' ? '朋友' : '团队'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {post.content && (
          <p className="text-[15px] leading-relaxed text-neutral-900 whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {post.images && post.images.length > 0 && (
          <div className={`grid gap-1 mt-1 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'} max-w-sm`}>
            {post.images.map((img, i) => (
              <img
                key={i}
                src={img}
                className={`object-cover rounded-sm ${post.images.length === 1 ? 'w-[70%] max-h-64' : 'w-full aspect-square'}`}
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-neutral-400">{timeStr.split(' ')[0]}</span>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(post);
                }}
                className="text-[12px] text-[#576b95] font-medium"
              >
                修改
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(post.id);
                }}
                className="text-[12px] text-[#576b95] font-medium"
              >
                删除
              </button>
            )}
          </div>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className={`${filteredLikes.length > 0 || filteredComments.length > 0 ? 'bg-neutral-50 rounded-lg p-3' : ''} mt-2`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onLike?.(post.id, activeViewScope)}
                className="flex items-center gap-1 group"
              >
                <ThumbsUp size={18} className={`${isLikedByMe ? 'text-blue-500 fill-blue-500' : 'text-[#333]'} transition-colors group-active:scale-125`} />
              </button>
              <button
                onClick={() => setIsCommenting(!isCommenting)}
                className="flex items-center gap-1 group"
              >
                <MessageCircle size={18} className="text-[#333] transition-colors group-active:scale-125" />
              </button>
            </div>
          </div>

          {filteredLikes.length > 0 && (
            <div className={`flex items-start gap-2 ${filteredComments.length > 0 ? 'border-b border-neutral-100 pb-2 mb-2' : ''}`}>
              <ThumbsUp size={12} className="text-[#576b95] mt-1 flex-shrink-0" />
              <p className="text-[12px] text-[#576b95] font-bold leading-tight">
                {filteredLikes.map(l => l.name).join(', ')}
              </p>
            </div>
          )}

          {filteredComments.length > 0 && (
            <div className="flex flex-col gap-1">
              {visibleComments.map(c => (
                <div key={c.id} className="text-[13px] group relative">
                  <span className="font-bold text-[#576b95]">{c.user}: </span>
                  <span className="text-neutral-700">{c.text}</span>
                  {onDeleteComment && (
                    <button
                      onClick={() => onDeleteComment(post.id, c.id)}
                      className="ml-2 text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
              {filteredComments.length > 10 && !showAllComments && (
                <button
                  onClick={() => setShowAllComments(true)}
                  className="text-[11px] text-[#576b95] font-medium mt-1 self-start"
                >
                  查看更多（共{filteredComments.length}条）
                </button>
              )}
            </div>
          )}

          {isCommenting && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="说点什么..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    onAddComment?.(post.id, commentText, activeViewScope);
                    setCommentText('');
                    setIsCommenting(false);
                  }
                }}
                className="flex-1 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#576b95]"
              />
              <button
                onClick={() => {
                  if (commentText.trim()) {
                    onAddComment?.(post.id, commentText, activeViewScope);
                    setCommentText('');
                    setIsCommenting(false);
                  }
                }}
                className="bg-[#576b95] text-white px-4 py-1.5 rounded-lg text-xs font-bold"
              >
                发送
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MomentItem;