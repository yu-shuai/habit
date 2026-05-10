import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Post, Visibility, InteractionScope, UserProfile } from '../types';
import { getTodayString } from '../utils/app';

interface UseActivityActionsParams {
  session: any;
  userProfile: UserProfile;
  tasks: any[];
  activities: Post[];
  checkInHabitId: string;
  checkInContent: string;
  checkInImages: string[];
  checkInVisibility: Visibility;
  editingPostId: string | null;
  setActivities: (updater: (prev: Post[]) => Post[]) => void;
  setIsCheckInOpen: (open: boolean) => void;
  setCheckInContent: (content: string) => void;
  setCheckInHabitId: (id: string) => void;
  setCheckInImages: (images: string[]) => void;
  setEditingPostId: (id: string | null) => void;
  handleCheck: (id: string, skipAutoPost?: boolean) => void;
  showToast: (message: string) => void;
  uploadPostImage?: (userId: string, file: File | Blob) => Promise<string | null>;
  deleteFiles?: (bucket: string, paths: string[]) => Promise<void>;
  createNotification?: (targetUserId: string, type: 'like' | 'comment' | 'reply' | 'friend_request' | 'friend_accept' | 'follow' | 'mention', postId?: string, commentId?: string, content?: string, postContentPreview?: string, postType?: string) => Promise<void>;
}

export const useActivityActions = ({
  session,
  userProfile,
  tasks,
  activities,
  checkInHabitId,
  checkInContent,
  checkInImages,
  checkInVisibility,
  editingPostId,
  setActivities,
  setIsCheckInOpen,
  setCheckInContent,
  setCheckInHabitId,
  setCheckInImages,
  setEditingPostId,
  handleCheck, showToast, uploadPostImage, deleteFiles,
  createNotification,
}: UseActivityActionsParams) => {
  /** Like / unlike a post */
  const handleLike = useCallback(
    async (postId: string, scope?: InteractionScope) => {
      if (!session?.user?.id) return;
      const post = activities.find(a => a.id === postId);
      if (!post) return;

      const currentScope = scope || 'public';
      const alreadyLiked = post.likedBy.some(
        l => l.userId === session.user.id && l.scope === currentScope
      );

      // Optimistic: compute new likedBy from local state for instant UI feedback
      let optimisticLikedBy;
      if (alreadyLiked) {
        optimisticLikedBy = post.likedBy.filter(
          l => !(l.userId === session.user.id && l.scope === currentScope)
        );
      } else {
        optimisticLikedBy = [
          ...post.likedBy,
          { name: userProfile.name, userId: session.user.id, scope: currentScope },
        ];
      }

      const previousLikedBy = post.likedBy;
      setActivities(prev =>
        prev.map(a => (a.id === postId ? { ...a, likedBy: optimisticLikedBy } : a))
      );

      let rpcError = null;
      if (alreadyLiked) {
        const { error } = await supabase.rpc('remove_like', {
          p_activity_id: postId,
          p_user_id: session.user.id
        });
        rpcError = error;
      } else {
        const { error } = await supabase.rpc('add_like', {
          p_activity_id: postId,
          p_like_obj: { name: userProfile.name, userId: session.user.id, scope: currentScope }
        });
        rpcError = error;
      }

      if (rpcError) {
        console.error('handleLike failed:', rpcError.message);
        setActivities(prev =>
          prev.map(a => (a.id === postId ? { ...a, likedBy: previousLikedBy } : a))
        );
        showToast('点赞失败，请重试');
      } else {
        if (!alreadyLiked && post.user.id !== session.user.id) {
          const preview = post.content ? (post.content.length > 30 ? post.content.slice(0, 30) + '...' : post.content) : (post.tag || '');
          createNotification?.(post.user.id, 'like', postId, undefined, undefined, preview, post.type);
        }
      }
    },
    [session, userProfile, activities, setActivities, showToast, createNotification]
  );

  /** Add a comment */
  const handleAddComment = useCallback(
    async (postId: string, text: string, scope?: InteractionScope, replyToUserId?: string, replyToUserName?: string, replyToCommentId?: string) => {
      if (!text.trim()) return;
      const newComment = {
        id: `c-${Date.now()}`,
        user: userProfile.name,
        userId: session?.user?.id,
        text: text.trim(),
        createdAt: Date.now(),
        scope: scope || 'public',
        ...(replyToUserId ? { replyToUserId, replyToUserName, replyToCommentId } : {}),
      };

      const post = activities.find(a => a.id === postId);
      if (!post) return;
      const previousComments = post.comments;
      const optimisticComments = [...post.comments, newComment];

      // Optimistic update
      setActivities(prev =>
        prev.map(a => (a.id === postId ? { ...a, comments: optimisticComments } : a))
      );

      const { error } = await supabase.rpc('add_comment', {
        p_activity_id: postId,
        p_comment_obj: newComment
      });

      if (error) {
        console.error('handleAddComment failed:', error.message);
        setActivities(prev =>
          prev.map(a => (a.id === postId ? { ...a, comments: previousComments } : a))
        );
        showToast('评论失败，请重试');
      } else {
        const updatedPost = activities.find(a => a.id === postId);
        if (updatedPost && session?.user?.id) {
          const preview = updatedPost.content ? (updatedPost.content.length > 30 ? updatedPost.content.slice(0, 30) + '...' : updatedPost.content) : (updatedPost.tag || '');
          if (replyToUserId && replyToUserId !== session.user.id) {
            createNotification?.(replyToUserId, 'reply', postId, newComment.id, text.trim(), preview, updatedPost.type);
          } else if (updatedPost.user.id !== session.user.id) {
            createNotification?.(updatedPost.user.id, 'comment', postId, newComment.id, text.trim(), preview, updatedPost.type);
          }
        }
      }
    },
    [session, userProfile, activities, setActivities, showToast, createNotification]
  );

  /** Delete a comment */
  const handleDeleteComment = useCallback(
    async (postId: string, commentId: string) => {
      const post = activities.find(a => a.id === postId);
      if (!post) return;
      const previousComments = post.comments;
      const optimisticComments = post.comments.filter(c => c.id !== commentId);

      setActivities(prev =>
        prev.map(a => (a.id === postId ? { ...a, comments: optimisticComments } : a))
      );

      const { error } = await supabase.rpc('remove_comment', {
        p_activity_id: postId,
        p_comment_id: commentId
      });

      if (error) {
        console.error('handleDeleteComment failed:', error.message);
        setActivities(prev =>
          prev.map(a => (a.id === postId ? { ...a, comments: previousComments } : a))
        );
        showToast('删除评论失败，请重试');
      }
    },
    [activities, setActivities, showToast]
  );

  /** Change post visibility */
  const handleChangeVisibility = useCallback(
    async (postId: string, visibility: Visibility) => {
      setActivities(prev =>
        prev.map(a => (a.id === postId ? { ...a, visibility } : a))
      );
      await supabase
        .from('activities')
        .update({ visibility })
        .eq('id', postId);
      showToast('可见范围已修改');
    },
    [setActivities, showToast]
  );

  /** Publish a check-in post (or update an existing one) */
  const handlePublishCheckIn = useCallback(async () => {
    if (!checkInHabitId) { showToast('请选择打卡任务'); return; }
    const habit = tasks.find(t => t.id === checkInHabitId);
    if (!habit && !editingPostId) return;

    showToast('正在发布...');
    const todayStr = getTodayString();
    
    const deterministicId = editingPostId || `auto-${checkInHabitId}-${userProfile.id}-${todayStr}`;
    const existingPost = activities.find(a => a.id === deterministicId);

    const finalImages: string[] = [];
    for (const img of checkInImages) {
      if (img.startsWith('data:') && uploadPostImage && session?.user?.id) {
        try {
          const res = await fetch(img);
          const blob = await res.blob();
          const uploadedUrl = await uploadPostImage(session.user.id, blob);
          if (uploadedUrl) finalImages.push(uploadedUrl);
        } catch (err) {
          console.error('Image upload failed, skipping base64 image:', err);
        }
      } else if (!img.startsWith('data:')) {
        finalImages.push(img);
      }
    }

    let dayNumber = 1;
    if (editingPostId && existingPost) {
      // 编辑模式：保留原有的打卡天数，防止天数被意外更新
      const match = existingPost.tag.match(/第(\d+)天/);
      dayNumber = match ? parseInt(match[1]) : 1;
    } else if (habit) {
      // 新打卡：使用与 CheckInModal.tsx 一致的逻辑
      dayNumber = habit.isCompletedToday ? habit.currentProgress : habit.currentProgress + 1;
    } else if (existingPost?.tag) {
      const match = existingPost.tag.match(/第(\d+)天/);
      dayNumber = match ? parseInt(match[1]) : 1;
    }

    const post: Post = {
      id: deterministicId,
      habitId: checkInHabitId,
      user: { id: userProfile.id, name: userProfile.name, avatar: userProfile.avatar },
      images: finalImages,
      tag: habit ? `${habit.name} · 第${dayNumber}天` : (existingPost?.tag || ''),
      likedBy: existingPost?.likedBy || [],
      comments: existingPost?.comments || [],
      visibility: checkInVisibility,
      content: checkInContent || (habit ? `✅ 打卡完成！第 ${dayNumber} 天` : (existingPost?.content || '')),
      createdAt: existingPost?.createdAt || Date.now(),
    };

    const { error: dbError } = await supabase.from('activities').upsert({
      id: deterministicId,
      habit_id: checkInHabitId,
      user_id: userProfile.id,
      user: post.user,
      images: post.images,
      tag: post.tag,
      content: post.content,
      visibility: post.visibility,
      liked_by: post.likedBy,
      comments: post.comments,
      created_at: new Date(post.createdAt).toISOString()
    });

    if (dbError) {
      console.error('Publish check-in error:', dbError.message);
      showToast('发布失败，请检查网络');
      return;
    }

    if (!editingPostId) {
      handleCheck(checkInHabitId, true);
    }

    // 4. 更新本地 Store
    setActivities(prev => {
      const idx = prev.findIndex(a => a.id === deterministicId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = post;
        return next;
      }
      return [post, ...prev];
    });

    setIsCheckInOpen(false);
    setCheckInContent('');
    setCheckInHabitId('');
    setCheckInImages([]);
    setEditingPostId(null);
    showToast(editingPostId ? '已修改打卡内容' : existingPost ? '已更新今日打卡' : '打卡成功！');
  }, [
    session, userProfile, tasks, activities,
    checkInHabitId, checkInContent, checkInImages, checkInVisibility, editingPostId,
    setActivities, setIsCheckInOpen, setCheckInContent, setCheckInHabitId,
    setCheckInImages, setEditingPostId, handleCheck, showToast, uploadPostImage,
  ]);

  /** Edit a post - open CheckInDrawer with pre-filled data */
  const handleEditPost = useCallback(
    async (postId: string) => {
      if (!session?.user?.id) return;
      const post = activities.find(a => a.id === postId);
      if (!post) return;
      if (post.user.id !== session.user.id) {
        showToast('只能修改自己的动态');
        return;
      }

      setEditingPostId(postId);
      setCheckInHabitId(post.habitId);
      setCheckInContent(post.content || '');
      setCheckInImages(post.images || []);
      setIsCheckInOpen(true);
    },
    [session, activities, setEditingPostId, setCheckInHabitId, setCheckInContent, setCheckInImages, setIsCheckInOpen, showToast]
  );

  /** Delete a post (#23) */
  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (!session?.user?.id) return;
      const post = activities.find(a => a.id === postId);
      if (!post) return;
      // Only allow owner to delete
      if (post.user.id !== session.user.id) {
        showToast('只能删除自己的动态');
        return;
      }

      // Optimistic removal
      setActivities(prev => prev.filter(a => a.id !== postId));

      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', postId)
        .eq('user_id', session.user.id);

      if (error) {
        // Rollback
        setActivities(prev => [post, ...prev]);
        showToast('删除失败，请重试');
      } else {
        // Delete associated images from storage
        if (post.images && post.images.length > 0 && deleteFiles) {
          try {
            // Extract file paths from public URLs
            // Example URL: https://[project].supabase.co/storage/v1/object/public/habit/userid/posts/123-abc.png
            const pathsToDelete = post.images.map(url => {
              const urlObj = new URL(url);
              const pathParts = urlObj.pathname.split('/public/habit/');
              return pathParts.length > 1 ? pathParts[1] : null;
            }).filter(Boolean) as string[];

            if (pathsToDelete.length > 0) {
              await deleteFiles('habit', pathsToDelete);
            }
          } catch (e) {
            console.error('Failed to parse image URLs for deletion:', e);
          }
        }
        showToast('动态已删除');
      }
    },
    [session, activities, setActivities, showToast, deleteFiles]
  );

  return {
    handleLike,
    handleAddComment,
    handleDeleteComment,
    handleChangeVisibility,
    handlePublishCheckIn,
    handleEditPost,
    handleDeletePost,
  };
};
